namespace SoundTrekServer.Models
{
    public class RecommendationsRequest
    {
        public int UserId { get; set; }
        public double UserLat { get; set; }
        public double UserLon { get; set; }
        public List<Landmark> NearbyLandmarks { get; set; } = new();
    }
}