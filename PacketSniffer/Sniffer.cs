using System.Net;

namespace Sniffer;

using System;
using System.Linq;
using SharpPcap;
using PacketDotNet;
using System.Text;



class Sniffer
{
    private ArgumentParser.ParsedArguments? parsedArguments;

    public Sniffer(string[] args)
    {
        parsedArguments = ArgumentParser.ParseArguments(args);
    }
    
    public void start(){
        //if no interface is specified, print all interfaces
        if (parsedArguments == null)
        {
            PrintInterfaces();
            return;
        }
        
        if (parsedArguments.InterfaceName == null) 
            return;
        
        
        //find the device by name
        var device = CaptureDeviceList.Instance.FirstOrDefault(x => x.Name == parsedArguments.InterfaceName);    
            
        //if device is not found, exit
        if(device == null)
        {
            Console.Error.WriteLine("Device not found");
            Environment.Exit(1);
        }

        
        Console.CancelKeyPress += (sender, e) =>
        {
            e.Cancel = true; 
            device.StopCapture();
            Environment.Exit(0); 
        };
        
        
        device.OnPacketArrival += device_OnPacketArrival;
            
        device.Open(DeviceModes.Promiscuous);
            
        device.StartCapture();
        
        //loop until device is stopped
        while (device.Started)
        {
        }
    }
    
    
    private void device_OnPacketArrival(object sender, PacketCapture e)
    {
                
        var rawPacket = e.GetPacket();
        
        var packet = Packet.ParsePacket(rawPacket.LinkLayerType, rawPacket.Data);
        var ethernetPacket = packet.Extract<EthernetPacket>();
        var ipPacket = packet.Extract<IPPacket>();
        var timestamp = rawPacket.Timeval.Date.ToString("yyyy-MM-ddTHH:mm:ss.fffzzz");
        
        var srcMAC = BitConverter.ToString(ethernetPacket.SourceHardwareAddress.GetAddressBytes()).Replace("-", ":").ToLower();
        var dstMAC = BitConverter.ToString(ethernetPacket.DestinationHardwareAddress.GetAddressBytes()).Replace("-", ":").ToLower();
        
        var frameLength = rawPacket.PacketLength;
        
        ProtocolType? protocol = ipPacket?.Protocol;
        
        IPAddress srcIP = ipPacket?.SourceAddress;
        IPAddress dstIP = ipPacket?.DestinationAddress;
        
        ushort? srcPort = null;
        ushort? dstPort = null;
        
        switch (protocol)
        {
            case ProtocolType.Tcp:
                if (parsedArguments.Tcp)
                {
                    var tcpPacket = packet.Extract<TcpPacket>();
                    srcPort = tcpPacket?.SourcePort;
                    dstPort = tcpPacket?.DestinationPort;
                    break;
                }
                return;
            case ProtocolType.Udp:
                if(parsedArguments.Udp)
                {
                    var udpPacket = packet.Extract<UdpPacket>();
                    srcPort = udpPacket?.SourcePort;
                    dstPort = udpPacket?.DestinationPort;
                    break;
                }
                return;
            case ProtocolType.Igmp:
                if(parsedArguments.Igmp)
                {
                    break;
                }
                return;
            case ProtocolType.Icmp:
                if(parsedArguments.Icmp4)
                {
                    break;
                }
                return;
            case ProtocolType.IcmpV6:
                var icmpv6Packet = packet.Extract<IcmpV6Packet>();
                if (icmpv6Packet == null)
                {
                    return;
                }

                if (parsedArguments.Icmp6 && icmpv6Packet.Type is IcmpV6Type.EchoRequest or IcmpV6Type.EchoReply)
                {
                    break;
                }

                if (parsedArguments.Ndp && icmpv6Packet.Type is IcmpV6Type.NeighborSolicitation or IcmpV6Type.NeighborAdvertisement or IcmpV6Type.RouterSolicitation or IcmpV6Type.RouterAdvertisement or IcmpV6Type.RedirectMessage)
                {
                    break;
                }

                if (parsedArguments.Mld && icmpv6Packet.Type is IcmpV6Type.MulticastListenerQuery or IcmpV6Type.MulticastListenerReport or IcmpV6Type.MulticastListenerDone or IcmpV6Type.Version2MulticastListenerReport)
                {
                    break;
                }

                return;
            default:
                if (ethernetPacket.Type == EthernetType.Arp)
                {
                    if(!parsedArguments.Arp)
                    {
                        return;
                    }
                    var arpPacket = packet.Extract<ArpPacket>();
                    srcIP = arpPacket.SenderProtocolAddress;
                    dstIP = arpPacket.TargetProtocolAddress;

                    break;
                }
                return;
        }

        //filter by ports
        if (parsedArguments.Port != null && (srcPort != parsedArguments.Port && dstPort != parsedArguments.Port))
        {
            return;
        }
        //handle srcport and dstport filter
        if(parsedArguments.SrcPort != null && srcPort != parsedArguments.SrcPort)
        {
            return;
        }
        if(parsedArguments.DstPort != null && dstPort != parsedArguments.DstPort)
        {
            return;
        }
        
        PrintPacket(timestamp, srcMAC, dstMAC, frameLength, srcIP, dstIP, srcPort, dstPort);
        HexDump(rawPacket.Data);       
        Console.WriteLine();
        
        //if N is specified, stop capturing after N packets
        parsedArguments.PacketsCaptured++;
        if (parsedArguments.PacketsCaptured >= parsedArguments.N)
        {
            e.Device.StopCapture();
            Environment.Exit(0);
        }
    }

    //print all interfaces    
    private void PrintInterfaces()
    {
        foreach (var dev in CaptureDeviceList.Instance)
        {
            Console.WriteLine($"{dev.Name}");
        }
    }

    private void PrintPacket(string timestamp, string srcMAC, string dstMAC, int frameLength, IPAddress srcIP, IPAddress dstIP, ushort? srcPort, ushort? dstPort)
    {
        Console.WriteLine($"timestamp: {timestamp}");
        Console.WriteLine($"src MAC: {srcMAC}");
        Console.WriteLine($"dst MAC: {dstMAC}");
        Console.WriteLine($"frame length: {frameLength}");
        Console.WriteLine($"src IP: {srcIP}");
        Console.WriteLine($"dst IP: {dstIP}");
        Console.WriteLine($"src port: {srcPort}");
        Console.WriteLine($"dst port: {dstPort}");
    }

    
    //creates a hex dump of the packet
    private void HexDump(byte[] data)
    {
        int index = 0;
        Console.WriteLine();
        while (index < data.Length)
        {
            int bytesRemaining = data.Length - index;
            int print = Math.Min(16, bytesRemaining);
    
            StringBuilder hexBuilder = new StringBuilder(print * 3);
            StringBuilder charBuilder = new StringBuilder(16);
    
            for (int i = 0; i < print; i++)
            {
                byte b = data[index + i];
                hexBuilder.Append($"{b:X2} ");
                charBuilder.Append(b >= 32 && b <= 126 ? (char)b : '.');
            }
    
            hexBuilder.Append(' ', (16 - print) * 3);
    
            Console.WriteLine($"{hexBuilder} {charBuilder}");
    
            index += print;
        }
    }
}