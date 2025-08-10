namespace SoundTrekServer.Models
{
    public class WikipediaGeoSearchResult
    {
        public string Title { get; set; } = string.Empty;
        public string PageId { get; set; } = string.Empty;
        public double Lat { get; set; }
        public double Lon { get; set; }
    }
}
