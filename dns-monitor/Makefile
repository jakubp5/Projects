# Compiler and flags
CXX = g++
CXXFLAGS = -Wall -Wextra -std=c++11

# Source files
SRC = dns-monitor.cpp ArgumentParser.cpp

# Output binary
OUT = dns-monitor

# Libraries (assuming you need pcap and resolver libraries)
LIBS = -lpcap

# Build target
all: $(OUT)

# Rule to compile the program
$(OUT): $(SRC)
	$(CXX) $(CXXFLAGS) -o $(OUT) $(SRC) $(LIBS)

# Clean up
clean:
	rm -f $(OUT)
