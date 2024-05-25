namespace Sniffer;

class Program
{
    public static void Main(string[] args)
    {
        var sniffer = new Sniffer(args);
        sniffer.start();
    }
}