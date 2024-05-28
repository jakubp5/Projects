# Simple Clustering Analysis: 2D Nearest Neighbor

## Author

Jakub Pogádl

## xlogin

xpogad00


## Overview

This project implements a simple clustering analysis using the single linkage method. The program reads 2D objects from a file, clusters them using the nearest neighbor method, and outputs the resulting clusters.

## Files

- `proj2.c`: The main source code file containing the implementation of the clustering analysis.

## Compilation

To compile the program, use the following command:

```bash
gcc -o proj2 proj2.c -lm
```

## Usage

To run the program, use the following command:

```bash

./proj2 filename [N]
```
Where:

- `filename`: The name of the file containing the 2D objects.
- `N`: The number of clusters to end up with. If not provided, the default is 1.

Example

```bash
./proj2 data.txt 3
```
This command runs the program with the objects loaded from data.txt and clusters them into 3 clusters.
File Format

### The input file should be formatted as follows:

- The first line contains the number of objects.
- Each subsequent line contains an object ID followed by its x and y coordinates.


```bash
count=5
1 24 45
2 40 89
3 58 23
4 78 56
5 98 12
```

## Description
### Functions

- `init_cluster`: Initializes a cluster with a given capacity.
- `clear_cluster`: Clears all objects from a cluster.
- `resize_cluster`: Resizes a cluster to a new capacity.
- `append_cluster`: Adds an object to a cluster, resizing if necessary.
- `merge_clusters`: Merges two clusters into one.
- `remove_cluster`: Removes a cluster from an array of clusters.
- `obj_distance`: Calculates the Euclidean distance between two objects.
- `cluster_distance`: Calculates the distance between two clusters.
- `find_neighbours`: Finds the two nearest clusters.
- `sort_cluster`: Sorts objects in a cluster by their IDs.
- `print_cluster`: Prints the objects in a cluster.
- `load_clusters`: Loads objects from a file into clusters.
- `print_clusters`: Prints all clusters.

### Main Loop

The main loop merges the nearest clusters until the desired number of clusters is reached. It then prints the final clusters.

### Error Handling

The program includes several checks and error messages for:

- Invalid input format
- Memory allocation failures
- Duplicate IDs
- Invalid coordinates

### Debugging

Debugging macros are provided to aid in the development process. These can be enabled or disabled by defining the NDEBUG macro.