# Compiler and flags
CXX = g++
CXXFLAGS = -I/usr/local/include/simlib -Wall -Wextra -std=c++17
LDFLAGS = -L/usr/local/include/simlib -lsimlib

# Source, headers, and target
SRC = logistics_simulator.cpp
HEADERS = logistics_simulator.h
TARGET = logistics_simulator
OBJ = $(SRC:.cpp=.o)

# Default target
all: $(TARGET)

# Build the target
$(TARGET): $(OBJ)
	$(CXX) $(OBJ) -o $@ $(LDFLAGS)

# Compile object files
%.o: %.cpp $(HEADERS)
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Clean build artifacts
clean:
	rm -f $(OBJ) $(TARGET)

# Run the program
run: all
	./$(TARGET)

# Phony targets
.PHONY: all clean run
