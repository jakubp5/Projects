# Post Office Simulation (Barbershop Problem)
## Author
Jakub Pogadl (xpogad00)
## Overview
This project is a simulation of a post office problem using processes and semaphores. It demonstrates synchronization among multiple customers and officers using semaphores and shared memory. The simulation consists of customers arriving at a post office, waiting in different queues for services, and officers serving them. The post office closes after a specified period, and all processes terminate accordingly.
Files

## Files
- 'proj2.c': The main source code file containing the implementation of the simulation.
- 'proj2.out': The output file where the events of the simulation are logged.

## Compilation

To compile the program, use the following command:

```bash
gcc -o proj2 proj2.c -pthread
```

## Usage

To run the program, use the following command:

```bash

./proj2 NZ NU TZ TU F

    NZ: Number of customers.
    NU: Number of officers.
    TZ: Maximum wait time (in milliseconds) for a customer before they enter the office.
    TU: Maximum break time (in milliseconds) for an officer.
    F: Maximum time (in milliseconds) until the post office closes.
```

## Example

```bash
./proj2 5 3 1000 100 5000
```

# Post Office Simulation

This command runs the simulation with 5 customers, 3 officers, a maximum wait time of 1 second for customers, a maximum break time of 0.1 seconds for officers, and the post office closes after 5 seconds.

## Description

### Customer Process

1. Each customer sleeps for a random time up to TZ before entering the post office.
2. If the post office is closed, the customer logs that they are going home and exits.
3. If the post office is open, the customer chooses a random queue (1, 2, or 3) and signals their entry.
4. The customer waits in their chosen queue until an officer serves them.
5. Once served, the customer logs that they are going home and exits.

### Officer Process

1. Each officer continuously checks if all queues are empty.
2. If all queues are empty and the post office is closed, the officer logs that they are going home and exits.
3. If the post office is open, the officer logs that they are taking a break and sleeps for a random time up to TU.
4. After the break, the officer checks the queues again.
5. If a queue is not empty, the officer picks a customer from a random non-empty queue and serves them.
6. The officer logs the start and end of the service and returns to check the queues again.

### Post Office Process

1. The post office process waits for a random time up to F.
2. The post office logs that it is closing and sets the shared variable to indicate that it is closed.
3. The post office process exits.

## Synchronization

The program uses semaphores and shared memory to synchronize between processes:

- `mutex`: Ensures mutual exclusion when accessing shared variables.
- `customer`: Signals that a customer has entered the office.
- `customerDone`: Signals that a customer has been served.
- `officerDone`: Signals that an officer has finished serving a customer.
- `queue1`, `queue2`, `queue3`: Semaphores for the three queues to ensure customers wait until they are served.

## Initialization and Cleanup

- The `init` function initializes shared memory and semaphores and opens the output file.
- The `cleanup` function destroys semaphores, unmaps shared memory, and closes the output file.

## Important Notes

- The program uses `mmap` to allocate shared memory for variables.
- The program uses `usleep` for simulating delays.
- Ensure proper synchronization using semaphores to avoid race conditions.