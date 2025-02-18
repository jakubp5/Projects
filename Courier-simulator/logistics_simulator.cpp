/**
 * @file logistics_simulator.cpp
 * @brief Simulation of a food delivery logistics system with dynamic traffic and rush hour conditions.
 *
 * This program models the operations of a food delivery service using
 * discrete event simulation. The system dynamically adjusts to various
 * conditions like traffic levels and rush hours, while processing customer
 * orders with couriers. It supports custom configurations and predefined
 * experimental setups for analysis.
 *
 * @authors Jakub Pogádl [xpogad00], Boris Semanco [xseman06]
 * @date 2.12.2024
 */

#include "logistics_simulator.h"
#include <iostream>

// Default simulation parameters
int NUM_COURIERS = 5;
unsigned int ORDER_CAPACITY = 5;
int WAIT_TIME = 10;

// Simulation time and operational constants
const double SIM_TIME = 760;       // Total simulation duration (12h 40m)
const double OPEN_TIME = 720;      // Restaurant closes at 12h (12:00)
const double DELIVERY_TIME = 10.0; // Base delivery time
const double ORDER_INTERVAL = 8.0; // Base interval between orders

// Time ranges for traffic and rush hours (in minutes from midnight)
const int RUSH_HOUR_LUNCH_START = 60;    // 11:00
const int RUSH_HOUR_LUNCH_END = 120;     // 12:00
const int RUSH_HOUR_EVENING_START = 480; // 18:00
const int RUSH_HOUR_EVENING_END = 540;   // 19:00

const int LOW_TRAFFIC_START = 600;    // 20:00
const int LOW_TRAFFIC_END = 720;      // 22:00
const int HIGH_TRAFFIC_START = 0;     // 10:00
const int HIGH_TRAFFIC_END = 360;     // 16:00
const int MEDIUM_TRAFFIC_START = 360; // 16:00
const int MEDIUM_TRAFFIC_END = 600;   // 20:00

// Traffic and rush hour multipliers to adjust delivery times
const int HIGH_TRAFFIC_MULTIPLIER = 1.4;
const int MEDIUM_TRAFFIC_MULTIPLIER = 1.2;
const int LOW_TRAFFIC_MULTIPLIER = 1;
const int RUSH_HOUR_MULTIPLIER = 1.5;

// Global simulation state
double currentOrderInterval = ORDER_INTERVAL;
Traffic currentTraffic = LOW;

// Queue to store pending orders
Queue orderQueue("Order Queue");

// Vector to manage courier facilities
std::vector<CourierData> courierFacilities;

// Load different experiment configurations
void loadConfig(std::string arg)
{
    // Different experiment settings for number of couriers, max orders, and wait time
    if (arg == "experiment1")
    {
        NUM_COURIERS = 5;
        ORDER_CAPACITY = 5;
        WAIT_TIME = 15;
    }
    else if (arg == "experiment2")
    {
        NUM_COURIERS = 4;
        ORDER_CAPACITY = 5;
        WAIT_TIME = 10;
    }
    else if (arg == "experiment3")
    {
        NUM_COURIERS = 3;
        ORDER_CAPACITY = 6;
        WAIT_TIME = 5;
    }
    else if (arg == "experiment4")
    {
        NUM_COURIERS = 4;
        ORDER_CAPACITY = 6;
        WAIT_TIME = 10;
    }
    else if (arg == "experiment5")
    {
        NUM_COURIERS = 4;
        ORDER_CAPACITY = 6;
        WAIT_TIME = 5;
    }
    else if (arg == "experiment6")
    {
        NUM_COURIERS = 4;
        ORDER_CAPACITY = 6;
        WAIT_TIME = 1;
    }
    else if (arg == "experiment7")
    {
        NUM_COURIERS = 4;
        ORDER_CAPACITY = 10;
        WAIT_TIME = 5;
    }
    else
    {
        fprintf(stderr, "Wrong experiment config\n");
        exit(EXIT_FAILURE);
    }
}

// Simulate changing traffic conditions throughout the day
void TrafficGenerator::Behavior()
{
    // Update traffic based on current simulation time
    if (Time >= LOW_TRAFFIC_START && Time <= LOW_TRAFFIC_END)
        currentTraffic = LOW;
    else if (Time >= HIGH_TRAFFIC_START && Time <= HIGH_TRAFFIC_END)
        currentTraffic = HIGH;
    else if (Time >= MEDIUM_TRAFFIC_START && Time <= MEDIUM_TRAFFIC_END)
        currentTraffic = MEDIUM;

    // Schedule the next update after 1 minute (1 unit of time)
    Activate(Time + 1.0); // Check traffic every simulation minute
}

// Add an order to the order queue
void Order::Behavior()
{
    Into(orderQueue);
    Passivate(); // Wait until processed
}

// Constructor for Courier process
Courier::Courier(CourierData *data) : courierData(data) {}

// Manage order deliveries for a specific courier
void Courier::Behavior()
{
    if (orderQueue.Length() == 0)
    {
        return; // No orders to process
    }

    unsigned int ordersToDeliver;

    if (orderQueue.Length() >= ORDER_CAPACITY)
    {
        ordersToDeliver = ORDER_CAPACITY;
    }
    // Force delivery if wait time exceeded and there are pending orders
    else if (Time - courierData->lastActiveTime > WAIT_TIME && orderQueue.Length() > 0)
    {
        ordersToDeliver = orderQueue.Length(); // Deliver all pending orders
    }
    else
    {
        return; // Wait for more orders
    }

    // activate orders
    for (unsigned int i = 0; i < ordersToDeliver; i++)
    {
        orderQueue.GetFirst()->Activate();
    }

    // Seize courier facility for delivery
    Seize(*courierData->facility);

    // Adjust delivery time based on traffic conditions
    double deliveryMultiplier = 1.0;
    switch (currentTraffic)
    {
    case LOW:
        deliveryMultiplier = LOW_TRAFFIC_MULTIPLIER;
        break;
    case MEDIUM:
        deliveryMultiplier = MEDIUM_TRAFFIC_MULTIPLIER;
        break;
    case HIGH:
        deliveryMultiplier = HIGH_TRAFFIC_MULTIPLIER;
        break;
    }

    // Simulate delivery time with traffic-based multiplier
    Wait(Exponential(DELIVERY_TIME * deliveryMultiplier * ordersToDeliver));

    // Simulate the courier's return to the restaurant
    Wait(Uniform(5, 7) * deliveryMultiplier);

    // Update the courier's last active time
    courierData->lastActiveTime = Time;

    // Release the courier facility for the next delivery
    Release(*courierData->facility);
}

// Generate new orders based on time of day
void OrderGenerator::Behavior()
{
    if (Time < OPEN_TIME)
    {
        // Adjust order interval during rush hours
        if ((Time >= RUSH_HOUR_LUNCH_START && Time <= RUSH_HOUR_LUNCH_END) ||
            (Time >= RUSH_HOUR_EVENING_START && Time <= RUSH_HOUR_EVENING_END))
        {
            currentOrderInterval = ORDER_INTERVAL / RUSH_HOUR_MULTIPLIER;
        }
        else
        {
            currentOrderInterval = ORDER_INTERVAL;
        }

        // Create two orders per generation
        (new Order())->Activate();
        (new Order())->Activate();

        // Schedule next order generation
        Activate(Time + Exponential(currentOrderInterval));
    }
}

// Match available couriers with pending orders
void OrderProcessor::Behavior()
{
    // Check each courier facility
    for (auto &courier : courierFacilities)
    {
        if (!courier.facility->Busy() && orderQueue.Length() > 0)
        {
            (new Courier(&courier))->Activate();
        }
    }

    // Reschedule order processing
    if (Time < SIM_TIME)
    {
        Activate(Time + 1.0); // Check every simulation minute
    }
}

// Display help information
void displayHelp()
{
    std::cout << "Food Delivery Simulation Usage:\n"
              << "  ./logistics_simulator [options]\n\n"
              << "Options:\n"
              << "  -n NUM_COURIERS        Set number of couriers\n"
              << "  -c COURIER_CAPACITY    Set max orders per delivery\n"
              << "  -w WAIT_TIME           Set courier wait time\n"
              << "  experiment1-7          Run predefined experiment configurations\n"
              << "  -h, --help             Display this help message\n\n"
              << "Example:\n"
              << "  ./simulation -n 5 -c 6 -w 10\n"
              << "  ./simulation experiment3\n";
}

// Parse command-line arguments
void parseArguments(int argc, const char *argv[])
{
    for (int i = 1; i < argc; ++i)
    {
        // Check for help flag
        if (std::string(argv[i]) == "-h" || std::string(argv[i]) == "--help")
        {
            displayHelp();
            exit(0);
        }
        // Check for experiment configuration
        else if (std::string(argv[i]).find("experiment") == 0)
        {
            loadConfig(argv[i]);
            return;
        }
        // Parse individual parameters
        else if (std::string(argv[i]) == "-n" && i + 1 < argc)
        {
            NUM_COURIERS = std::atoi(argv[++i]);
            if (NUM_COURIERS < 1)
            {
                fprintf(stderr, "Number of couriers cannot be less than 1\n");
                exit(EXIT_FAILURE);
            }
        }
        else if (std::string(argv[i]) == "-c" && i + 1 < argc)
        {
            ORDER_CAPACITY = std::atoi(argv[++i]);
            if (ORDER_CAPACITY < 1)
            {
                fprintf(stderr, "Capacity of courier cannot be less than 1\n");
                exit(EXIT_FAILURE);
            }
        }
        else if (std::string(argv[i]) == "-w" && i + 1 < argc)
        {
            WAIT_TIME = std::atoi(argv[++i]);
            if (WAIT_TIME < 0)
            {
                fprintf(stderr, "Wait time cannot be less than 0\n");
                exit(EXIT_FAILURE);
            }
        }
    }
}

int main(int argc, char const *argv[])
{
    // Parse command-line arguments
    parseArguments(argc, argv);

    // Seed random number generator
    RandomSeed(time(NULL));

    // Create courier facilities
    for (int i = 0; i < NUM_COURIERS; ++i)
    {
        CourierData data;
        data.facility = new Facility();
        data.lastActiveTime = 0.0;
        courierFacilities.push_back(data);
    }

    // Initialize simulation
    Init(0, SIM_TIME);

    // Activate simulation components
    OrderGenerator *orderGenerator = new OrderGenerator();
    OrderProcessor *orderProcessor = new OrderProcessor();

    (new TrafficGenerator)->Activate();
    orderGenerator->Activate();
    orderProcessor->Activate();

    // Run simulation
    Run();

    // Output simulation results
    orderQueue.Output();

    // Cleanup simulation objects
    for (auto &facility : courierFacilities)
    {
        facility.facility->Output();
        delete facility.facility;
    }
    delete orderGenerator;
    delete orderProcessor;

    // Print simulation parameters
    std::cout << "Simulation completed with the following parameters:\n";
    std::cout << "  Number of couriers: " << NUM_COURIERS << "\n";
    std::cout << "  Order capacity per delivery: " << ORDER_CAPACITY << "\n";
    std::cout << "  Courier wait time: " << WAIT_TIME << " minutes\n";

    return 0;
}