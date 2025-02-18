#ifndef PIZZA_DELIVERY_SIM_H
#define PIZZA_DELIVERY_SIM_H

#include "simlib.h"
#include <vector>
#include <string>

// Enum to represent different traffic conditions
enum Traffic
{
    LOW,
    MEDIUM,
    HIGH
};

// Structure to store courier-specific data
struct CourierData
{
    Facility *facility;    // Simulation facility for the courier
    double lastActiveTime; // Time of last courier activity
};

// Configurable simulation parameters
extern int NUM_COURIERS;                     // Total number of couriers
extern unsigned int ORDER_CAPACITY;          // Maximum pizzas per delivery
extern int WAIT_TIME;                        // Maximum wait time before forcing delivery

// Simulation time and operational parameters
extern const double SIM_TIME;       // Total simulation duration
extern const double OPEN_TIME;      // Restaurant closing time
extern const double DELIVERY_TIME;  // Base time for a delivery
extern const double ORDER_INTERVAL; // Base interval between orders

// Traffic and rush hour conditions
extern const int RUSH_HOUR_MULTIPLIER;
extern const int HIGH_TRAFFIC_MULTIPLIER;
extern const int MEDIUM_TRAFFIC_MULTIPLIER;
extern const int LOW_TRAFFIC_MULTIPLIER;

// Load configuration for different simulation experiments
void loadConfig(std::string arg);

// Process class to simulate traffic conditions
class TrafficGenerator : public Process
{
public:
    void Behavior();
};

// Process class representing a single order
class Order : public Process
{
public:
    void Behavior();
};

// Process class representing a courier
class Courier : public Process
{
public:
    CourierData *courierData;
    explicit Courier(CourierData *data);
    void Behavior();
};

// Event class to generate new orders
class OrderGenerator : public Event
{
public:
    void Behavior();
};

// Event class to process and dispatch orders to couriers
class OrderProcessor : public Event
{
public:
    void Behavior();
};

// Function for parsing command-line arguments
void parseArguments(int argc, const char *argv[]);

// Help function to display usage instructions
void displayHelp();

#endif // PIZZA_DELIVERY_SIM_H
