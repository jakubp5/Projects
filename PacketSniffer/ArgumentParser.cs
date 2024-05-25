namespace Sniffer;

public class ArgumentParser
{
    public class ParsedArguments
    {
        public string? InterfaceName { get; set; }
        public bool Tcp { get; set; } = false;
        public bool Udp { get; set; } = false;
        public int? Port { get; set; }
        public int? DstPort { get; set; }
        public int? SrcPort { get; set; }
        public bool Icmp4 { get; set; } = false;
        public bool Icmp6 { get; set; } = false;
        public bool Arp { get; set; } = false;
        public bool Ndp { get; set; } = false;
        public bool Igmp { get; set; } = false;
        public bool Mld { get; set; } = false;
        public int N { get; set; } = 1;
        public int PacketsCaptured { get; set; } = 0;
    }
    
    //method for pasrsing arguments
    public static ParsedArguments? ParseArguments(string[] args)
    {
        ParsedArguments? parsedArguments = new ParsedArguments();
        for(int i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "-i":
                case "--interface":
                    
                    if(i+1 >= args.Length)
                    {
                        return null;
                    }
                    parsedArguments.InterfaceName = args[i+1];
                    break;
                case "-t":
                case "--tcp":
                    parsedArguments.Tcp = true;
                    break;
                case "-u":
                case "--udp":
                    parsedArguments.Udp = true;
                    break;
                case "-p":
                    parsedArguments.Port = int.Parse(args[i+1]);
                    break;
                case "--port-destination":
                    parsedArguments.DstPort = int.Parse(args[i+1]);
                    break;
                case "--port-source":
                    parsedArguments.SrcPort = int.Parse(args[i+1]);
                    break;
                case "--icmp4":
                    parsedArguments.Icmp4 = true;
                    break;
                case "--icmp6":
                    parsedArguments.Icmp6 = true;
                    break;
                case "--arp":
                    parsedArguments.Arp = true;
                    break;
                case "--ndp":
                    parsedArguments.Ndp = true;
                    break;
                case "--igmp":
                    parsedArguments.Igmp = true;
                    break;
                case "--mld":
                    parsedArguments.Mld = true;
                    break;
                case "-n":
                    parsedArguments.N = int.Parse(args[i+1]);
                    break;
            }
        }
        //when no protocol is specified, all protocols are set to true
        if(!parsedArguments.Tcp && !parsedArguments.Udp && !parsedArguments.Icmp4 && !parsedArguments.Icmp6 && !parsedArguments.Arp && !parsedArguments.Ndp && !parsedArguments.Igmp && !parsedArguments.Mld)
        {
            parsedArguments.Tcp = true;
            parsedArguments.Udp = true;
            parsedArguments.Icmp4 = true;
            parsedArguments.Icmp6 = true;
            parsedArguments.Arp = true;
            parsedArguments.Ndp = true;
            parsedArguments.Igmp = true;
            parsedArguments.Mld = true;
        }
        return parsedArguments;
    }
}
   