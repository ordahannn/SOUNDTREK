namespace SoundTrekServer.Models
{
    public class WikipediaLandmark
    {
        public string PageId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public double Lat { get; set; }
        public double Lon { get; set; }
        public string? ImageUrl { get; set; }
        public string? ShortDescription { get; set; }
        public List<string> Categories { get; set; } = new();
        public string? WikibaseItem { get; set; }
    }
}
