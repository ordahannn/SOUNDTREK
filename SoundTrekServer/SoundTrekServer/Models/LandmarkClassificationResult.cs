namespace SoundTrekServer.Models
{
    public class LandmarkClassificationResult
    {
        public string PageId { get; set; }
        public List<int> Categories { get; set; } = new();
    }
}
