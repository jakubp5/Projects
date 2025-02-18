#include "dns-monitor.h"
#include "ArgumentParser.h"

#define ETHERNET_HEADER_SIZE 14
#define UDP_HEADER_SIZE 8

pcap_t *global_handle = nullptr;
userArgs global_args;

// fix A, AAAA, NS, MX, SOA, CNAME, SRV

std::string returnType(uint16_t type)
{
    switch (type)
    {
    case 1:
        return "A";
    case 2:
        return "NS";
    case 5:
        return "CNAME";
    case 6:
        return "SOA";
    case 15:
        return "MX";
    case 28:
        return "AAAA";
    case 33:
        return "SRV";
    default:
        return std::to_string(type);
    }
}

std::string returnClass(uint16_t dns_class)
{
    switch (dns_class)
    {
    case 1:
        return "IN";
    case 2:
        return "CS";
    case 3:
        return "CH";
    case 4:
        return "HS";
    default:
        return std::to_string(dns_class);
    }
}

void write(std::string domain_name, std::string ip, userArgs *args, bool is_ip)
{
    if (args->domains_file.is_open())
    {
        // if the domain name is not in the set of domain names, print it to the file
        if (args->domainnamesinfile.find(domain_name) == args->domainnamesinfile.end())
        {
            args->domains_file << domain_name << std::endl;
            args->domainnamesinfile.insert(domain_name);
        }
    }
    if (is_ip && args->translations_file.is_open())
    {
        if (ip.empty())
        {
            return;
        }
        // if ip not a key in the map, print the domain name and ip to the file
        if (args->domainToIPs.find(ip) == args->domainToIPs.end())
        {

            args->domainToIPs[ip] = domain_name;
            args->translations_file << domain_name << " " << ip << std::endl;
        }
    }
}

void extractDomainName(const u_char *packet, int offset, std::string &domain_name, int dns_header_offset)
{
    // print the value of offset
    while (packet[offset] != 0)
    {
        uint8_t length = packet[offset];

        // Check if it's a pointer (0xC0 mask)
        if ((length & 0xC0) == 0xC0 || length == 0xC1)
        {
            // get the offset
            uint16_t pointer_offset = ntohs(*(uint16_t *)(packet + offset)) & 0x3FFF;
            extractDomainName(packet, dns_header_offset + pointer_offset, domain_name, dns_header_offset); // Recursively extract domain name from the pointed location
            offset += 2;                                                                                   // Move past the pointer
            return;                                                                                        // A pointer is always the end of the current label sequence
        }
        // Append each label
        offset++;
        for (int i = 0; i < length; i++)
        {
            domain_name += packet[offset + i];
        }

        offset += length;   // Move to the next length byte
        domain_name += "."; // Add a dot between labels
    }
    // Remove the trailing dot
    if (!domain_name.empty() && domain_name.back() == '.')
    {
        domain_name.pop_back();
    }
}
int calculateDomainLength(const u_char *packet, int offset, int dns_header_offset)
{
    int domain_length = 0;
    while (packet[offset] != 0)
    {
        uint8_t length = packet[offset];

        // Check if it's a pointer (0xC0 mask)
        if ((length & 0xC0) == 0xC0 || length == 0xC1)
        {
            // Get the offset
            // uint16_t pointer_offset = ntohs(*(uint16_t *)(packet + offset)) & 0x3FFF;
            domain_length += 2;   // Move past the pointer
            return domain_length; // A pointer is always the end of the current label sequence
        }

        // Move to the next length byte
        offset++;
        domain_length++;
        offset += length;
        domain_length += length;
    }

    domain_length++; // Move past the null byte
    return domain_length;
}

void parseQuestion(const u_char *packet, int &offset, int record_count, userArgs *args, int dns_header_offset, std::string &question_section)
{
    for (int i = 0; i < record_count; i++)
    {
        std::string domain_name;
        extractDomainName(packet, offset, domain_name, dns_header_offset);
        offset += calculateDomainLength(packet, offset, dns_header_offset);
        
        dnsQuestion question;
        std::memcpy(&question, packet + offset, sizeof(dnsQuestion));

        offset += sizeof(dnsQuestion);


        // Convert the qtype and qclass to string
        std::string qtype_str = returnType(ntohs(question.qtype));
        std::string qclass_str = returnClass(ntohs(question.qclass));

        question_section += domain_name + " " + qclass_str + " " + qtype_str + "\n";
        write(domain_name, "", args, false);
    }
}

void parseSection(const u_char *packet, int &offset, int record_count, userArgs *args, int dns_header_offset, std::string &section)
{
    for (int i = 0; i < record_count; i++)
    {
        std::string domain_name;
        bool is_ip = false;

        extractDomainName(packet, offset, domain_name, dns_header_offset);
        offset += calculateDomainLength(packet, offset, dns_header_offset);



        dnsAnswer answer;
        std::memcpy(&answer, packet + offset, sizeof(dnsAnswer));

        // Extract the fields of the DNS answer
        uint16_t answer_type = ntohs(answer.type);
        uint16_t answer_class = ntohs(answer.answer_class);
        uint32_t answer_ttl = ntohl(answer.ttl);
        uint16_t answer_rdlength = ntohs(answer.rdlength);

        offset += sizeof(dnsAnswer);

        std::string result;

        if (answer_class != 1)
        {
            offset += answer_rdlength; // Move to the next answer
            continue;                  // Skip the rest of the loop and go to the next answer
        }

        std::string type_str = returnType(answer_type);
        std::string class_str = returnClass(answer_class);

        std::string responsible_mailbox;

        dnsSOA soa;

        dnsSRV srv;

        uint16_t priority;
        

        //print size of srv
        std::cout << "velkost srv: " << sizeof(dnsSRV) << std::endl;

        switch (answer_type)
        {
        case 1: // A
            if (answer_rdlength == 4)
            {
                is_ip = true;
                const uint8_t *ip = packet + offset;
                result = inet_ntoa(*(struct in_addr *)ip);
                section += domain_name + " " + std::to_string(answer_ttl) + " " + class_str + " " + type_str + " " + result + "\n";
                offset += answer_rdlength;
            }
            break;
        case 28: // AAAA
            if (answer_rdlength == 16)
            {
                is_ip = true;
                const uint8_t *ipv6 = packet + offset;
                char ipv6_str[INET6_ADDRSTRLEN];
                inet_ntop(AF_INET6, ipv6, ipv6_str, INET6_ADDRSTRLEN);
                result = ipv6_str;
                section += domain_name + " " + std::to_string(answer_ttl) + " " + class_str + " " + type_str + " " + result + "\n";
                offset += answer_rdlength;
            }
            break;
        case 2: // NS
            extractDomainName(packet, offset, result, dns_header_offset);
            offset += calculateDomainLength(packet, offset, dns_header_offset);
            section += domain_name + " " + std::to_string(answer_ttl) + " " + class_str + " " + type_str + " " + result + "\n";
            break;
        case 5: // CNAME
            extractDomainName(packet, offset, result, dns_header_offset);
            offset += calculateDomainLength(packet, offset, dns_header_offset);
            section += domain_name + " " + std::to_string(answer_ttl) + " " + class_str + " " + type_str + " " + result + "\n";
            break;
        case 6: // SOA

            extractDomainName(packet, offset, result, dns_header_offset);
            offset += calculateDomainLength(packet, offset, dns_header_offset);
            extractDomainName(packet, offset, responsible_mailbox, dns_header_offset);
            offset += calculateDomainLength(packet, offset, dns_header_offset);
            std::memcpy(&soa, packet + offset, sizeof(dnsSOA));

            soa.serial = ntohl(soa.serial);
            soa.refresh = ntohl(soa.refresh);
            soa.retry = ntohl(soa.retry);
            soa.expire = ntohl(soa.expire);
            soa.minimum = ntohl(soa.minimum);

            offset += sizeof(dnsSOA);
            section += domain_name + " " + std::to_string(answer_ttl) + " " + class_str + " " + type_str + " " + result + " " + responsible_mailbox + " " + std::to_string(soa.serial) + " " + std::to_string(soa.refresh) + " " + std::to_string(soa.retry) + " " + std::to_string(soa.expire) + " " + std::to_string(soa.minimum) + "\n";
            break;
        case 15: // MX

            //priority
            priority = ntohs(*(uint16_t *)(packet + offset));
            offset += 2;
            extractDomainName(packet, offset, result, dns_header_offset);
            offset += calculateDomainLength(packet, offset, dns_header_offset);
            section += domain_name + " " + std::to_string(answer_ttl) + " " + class_str + " " + type_str + " " + std::to_string(priority)  + " " + result + "\n";
    
            break;

            break;
        case 33: // SRV
            //priority
            std::memcpy(&srv, packet + offset, sizeof(dnsSRV));
            
            srv.priority = ntohs(srv.priority);
            srv.weight = ntohs(srv.weight);
            srv.port = ntohs(srv.port);

            offset += sizeof(dnsSRV);
            extractDomainName(packet, offset, result, dns_header_offset);
            offset += calculateDomainLength(packet, offset, dns_header_offset);
            section += domain_name + " " + std::to_string(answer_ttl) + " " + class_str + " " + type_str + " " + std::to_string(srv.priority) + " " + std::to_string(srv.weight) + " " + std::to_string(srv.port) + " " + result + "\n";
            break;
        default:
            offset += answer_rdlength; // Move to the next answer
            continue;                  // Skip the rest of the loop and go to the next answer
            break;
        }
        write(domain_name, result, args, is_ip);
    }
}

void verboseOutput(char *buffer, const ip *ip_header, udphdr *udp_header, dnsHeader *dns_header, std::string &question_section, std::string &answer_section, std::string &authority_section, std::string &additional_section)
{
    struct in_addr src_ip = ip_header->ip_src;
    struct in_addr dst_ip = ip_header->ip_dst;
    std::cout << "Timestamp: " << buffer << std::endl;
    std::cout << "SrcIP: " << inet_ntoa(src_ip) << std::endl;
    std::cout << "DstIP: " << inet_ntoa(dst_ip) << std::endl;
    std::cout << "SrcPort: UDP/" << ntohs(udp_header->uh_sport) << std::endl;
    std::cout << "DstPort: UDP/" << ntohs(udp_header->uh_dport) << std::endl;
    std::cout << "Identifier: " << std::hex << ntohs(dns_header->id) << std::dec << std::endl;
    uint16_t flags = ntohs(dns_header->flags);
    std::cout << "Flags:"
              << " QR=" << ((flags & 0x8000) >> 15)
              << ", Opcode=" << ((flags & 0x7800) >> 11)
              << ", AA=" << ((flags & 0x0400) >> 10)
              << ", TC=" << ((flags & 0x0200) >> 9)
              << ", RD=" << ((flags & 0x0100) >> 8)
              << ", RA=" << ((flags & 0x0080) >> 7)
              << ", AD=" << ((flags & 0x0020) >> 5)
              << ", CD=" << ((flags & 0x0010) >> 4)
              << ", RCODE=" << (flags & 0x000F) << std::endl;
    std::cout << std::endl;
    if (!question_section.empty())
    {
        std::cout << "[Question Section]" << std::endl;
        std::cout << question_section << std::endl;
    }
    if (!answer_section.empty())
    {
        std::cout << "[Answer Section]" << std::endl;
        std::cout << answer_section << std::endl;
    }
    if (!authority_section.empty())
    {
        std::cout << "[Authority Section]" << std::endl;
        std::cout << authority_section << std::endl;
    }
    if (!additional_section.empty())
    {
        std::cout << "[Additional Section]" << std::endl;
        std::cout << additional_section << std::endl;
    }
    std::cout << "====================" << std::endl;
}

void nonVerboseOutput(char *buffer, ip *ip_header, dnsHeader *dns_header)
{
    std::string src_ip_str;
    std::string dst_ip_str;

    if (ip_header->ip_v == 4) // IPv4
    {
        struct in_addr src_ip = ip_header->ip_src;
        struct in_addr dst_ip = ip_header->ip_dst;
        src_ip_str = inet_ntoa(src_ip);
        dst_ip_str = inet_ntoa(dst_ip);
    }
    else if (ip_header->ip_v == 6) // IPv6
    {
        struct ip6_hdr *ip6_header = (struct ip6_hdr *)ip_header;
        char src_ip[INET6_ADDRSTRLEN];
        char dst_ip[INET6_ADDRSTRLEN];
        inet_ntop(AF_INET6, &ip6_header->ip6_src, src_ip, INET6_ADDRSTRLEN);
        inet_ntop(AF_INET6, &ip6_header->ip6_dst, dst_ip, INET6_ADDRSTRLEN);
        src_ip_str = src_ip;
        dst_ip_str = dst_ip;
    }

    std::string query_response;

    // check for query
    //  After populating the dns_header
    if (dns_header->flags & htons(0x8000))
    {
        query_response = "R";
    }
    else
    {
        query_response = "Q";
    }

    std::cout << buffer << " " << src_ip_str << " -> " << dst_ip_str << " (" << query_response << " " << ntohs(dns_header->question_count) << "/" << ntohs(dns_header->answer_count) << "/" << ntohs(dns_header->authority_count) << "/" << ntohs(dns_header->arcount) << ")" << std::endl;
}
pcap_t *openInteface(const std::string &interface)
{
    char errbuf[PCAP_ERRBUF_SIZE];
    pcap_t *handle = pcap_open_live(interface.c_str(), BUFSIZ, 1, 1000, errbuf);
    if (handle == nullptr)
    {
        std::cerr << "Could not open interface " << interface << ": " << errbuf << std::endl;
        return nullptr;
    }

    std::cout << "Interface " << interface << " opened" << std::endl;

    return handle;
}

void packetHandler(u_char *userData, const struct pcap_pkthdr *pkthdr, const u_char *packet)
{
    userArgs *args = (userArgs *)userData;

    struct ip *ip_header = (struct ip *)(packet + ETHERNET_HEADER_SIZE);

    int ip_header_len = 0;
    uint8_t protocol = 0;

    // Check if the packet is an IPv4 or IPv6
    if (ip_header->ip_v == 4)
    {
        // Parse IPv4 header
        const struct ip *ip_header = (struct ip *)(packet + ETHERNET_HEADER_SIZE);
        // Calculate the length of the IP header
        ip_header_len = ip_header->ip_hl * 4;
        protocol = ip_header->ip_p;
    }
    else if (ip_header->ip_v == 6)
    {
        // Parse IPv6 header
        const struct ip6_hdr *ip6_header = (struct ip6_hdr *)(packet + ETHERNET_HEADER_SIZE);
        ip_header_len = sizeof(struct ip6_hdr);
        protocol = ip6_header->ip6_nxt;
    }

    // program captures only UDP packets
    if (int(protocol) != IPPROTO_UDP)
    {
        return;
    }

    char timestamp[64];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", localtime(&pkthdr->ts.tv_sec));

    struct udphdr *udp_header = (struct udphdr *)(packet + ETHERNET_HEADER_SIZE + ip_header_len);

    // program captures only DNS packets
    if (ntohs(udp_header->uh_dport) != 53 && ntohs(udp_header->uh_sport) != 53)
    {
        return;
    }

    // dns header offset depends on the length of the ip header
    int dns_header_offset = ETHERNET_HEADER_SIZE + ip_header_len + UDP_HEADER_SIZE;

    // get the dns header
    dnsHeader *dns_header = (dnsHeader *)(packet + dns_header_offset);

    int offset = ETHERNET_HEADER_SIZE + ip_header_len + UDP_HEADER_SIZE + sizeof(dnsHeader);

    std::string question_section;
    std::string answer_section;
    std::string authority_section;
    std::string additional_section;

    // parse the question
    if (ntohs(dns_header->question_count) > 0)
    {
        parseQuestion(packet, offset, ntohs(dns_header->question_count), args, dns_header_offset, question_section);
    }

    // if packet is a response, parse the answer
    if (dns_header->answer_count > 0)
    {
        parseSection(packet, offset, ntohs(dns_header->answer_count), args, dns_header_offset, answer_section);
    }

    // if packet has authority, parse the authority
    if (dns_header->authority_count > 0)
    {
        parseSection(packet, offset, ntohs(dns_header->authority_count), args, dns_header_offset, authority_section);
    }

    // if packet has additional, parse the additional
    if (dns_header->arcount > 0)
    {
        parseSection(packet, offset, ntohs(dns_header->arcount), args, dns_header_offset, additional_section);
    }

    // print depending on the verbose flag
    if (args->verbose)
    {
        verboseOutput(timestamp, ip_header, udp_header, dns_header, question_section, answer_section, authority_section, additional_section);
    }
    else
    {
        nonVerboseOutput(timestamp, ip_header, dns_header);
    }
}
/**
 * @brief Closes the interface
 *
 * @param handle
 */
void closeInterface(pcap_t *handle)
{
    pcap_close(handle);
}

// ctrl+c

void signalHandler(int signum)
{
    // Close the pcap handle
    if (global_handle != nullptr)
    {
        pcap_close(global_handle);
        global_handle = nullptr;
    }

    // Close the files
    if (global_args.domains_file.is_open())
    {
        global_args.domains_file.close();
    }
    if (global_args.translations_file.is_open())
    {
        global_args.translations_file.close();
    }

    exit(signum);
}

int main(int argc, char *argv[])
{
    parseArguments(argc, argv, global_args);

    signal(SIGINT, signalHandler);

    // if no interface or pcap file specified
    if (global_args.interface.empty() && global_args.pcapfile.empty())
    {
        std::cerr << "No interface or pcap file specified" << std::endl;
        return 1;
    }

    // if both interface and pcap file specified
    if (!global_args.interface.empty() && !global_args.pcapfile.empty())
    {
        std::cerr << "Both interface and pcap file specified" << std::endl;
        return 1;
    }

    // if interface specified
    if (!global_args.interface.empty())
    {
        global_handle = openInteface(global_args.interface);
        if (global_handle == nullptr)
        {
            return 1;
        }
        pcap_loop(global_handle, 0, packetHandler, (u_char *)&global_args);
        closeInterface(global_handle);
        return 0;
    }

    // if pcap file specified
    if (!global_args.pcapfile.empty())
    {
        std::cout << "Opening pcap file " << global_args.pcapfile << std::endl;
        char errbuf[PCAP_ERRBUF_SIZE];
        global_handle = pcap_open_offline(global_args.pcapfile.c_str(), errbuf);
        if (global_handle == nullptr)
        {
            std::cerr << "Could not open pcap file " << global_args.pcapfile << ": " << errbuf << std::endl;
            return 1;
        }
        // extract dns packets from pcap file
        pcap_loop(global_handle, 0, packetHandler, (u_char *)&global_args);
        
        if (global_args.domains_file.is_open())
        {
            global_args.domains_file.close();
        }

        if (global_args.translations_file.is_open())
        {
            global_args.translations_file.close();
        }
        closeInterface(global_handle);
    }
    return 0;
}