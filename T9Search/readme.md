# T9 Search

### Author: Jakub Pogadl


## Description

This program implements a T9 search algorithm to find contacts based on numeric input. It reads contacts (names and corresponding phone numbers) from standard input and searches for matches based on numeric input provided as a command-line argument.
Usage

Compile the program using a C compiler such as GCC:

```bash
gcc t9search.c -o t9search
```
Run the program:

```bash
./t9search [numeric_input]
```

If no numeric input is provided, the program will print all contacts.

### Input Format

The program reads contacts from standard input, where each contact consists of two lines:

- Name
- Phone number

The program expects the input to be formatted such that each line is no longer than 100 characters.
### Numeric Input

The numeric input provided as a command-line argument should consist of digits (0-9) representing T9 keypad mappings. Each digit corresponds to a set of characters according to the following mapping:

| Digit | Characters |
|-------|------------|
| 2     | a, b, c    |
| 3     | d, e, f    |
| 4     | g, h, i    |
| 5     | j, k, l    |
| 6     | m, n, o    |
| 7     | p, q, r, s |
| 8     | t, u, v    |
| 9     | w, x, y, z |
| 0     | + (space)  |
| 1     | (no characters) |

For example, "4663" corresponds to "good".
Output

The program outputs the contacts that match the numeric input, including both name and phone number. If no matches are found, it prints "Not found".
### Error Handling

    If the input contains characters other than digits (0-9), the program prints "Incorrect input" to stderr and exits with a status code of 1.
    If a line in the input exceeds 100 characters, the program prints "Invalid data" to stderr and exits with a status code of 1.

### Sample Usage
Input:
```bash
./t9search 4663
```

Output:
```
John Doe, 123-456-7890
```