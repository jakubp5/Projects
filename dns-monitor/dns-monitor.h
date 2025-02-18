#include <iostream>
#include <pcap.h>
#include <cstring>
#include <unistd.h>
#include <netinet/ip.h>
#include <netinet/udp.h>
#include <ctime>
#include <arpa/inet.h>
#include <netinet/if_ether.h>
#include <netinet/ip6.h> // Include this header for ip6_hdr
#include <fstream>
#include <map> // Include this header for std::map
#include <set> // Include this header for std::set
#include <csignal>
#include <iomanip>

#define ETHERNET_HEADER_SIZE 14
#define UDP_HEADER_SIZE 8

#pragma pack(push, 1)
struct dnsAnswer {
    uint16_t type;
    uint16_t answer_class;
    uint32_t ttl;
    uint16_t rdlength;
};
#pragma pack(pop)

#pragma pack(push, 1)
struct dnsQuestion {
    uint16_t qtype;
    uint16_t qclass;
};
#pragma pack(pop)



//soa
#pragma pack(push, 1)
struct dnsSOA {
    uint32_t serial;
    uint32_t refresh;
    uint32_t retry;
    uint32_t expire;
    uint32_t minimum;
};
#pragma pack(pop)

#pragma pack(push, 1)
struct dnsSRV {
    uint16_t priority;
    uint16_t weight;
    uint16_t port;
};
#pragma pack(pop)


enum SECTION_TYPE
{
    QUESTION,
    ANSWER,
    AUTHORITY,
    ADDITIONAL
};



struct dnsHeader {
    uint16_t id; // identification number        
    uint16_t flags; // flags 
    uint16_t question_count; // number of question entries
    uint16_t answer_count; // number of answer entries
    uint16_t authority_count; // number of authority entries
    uint16_t arcount; // number of resource entries
};

