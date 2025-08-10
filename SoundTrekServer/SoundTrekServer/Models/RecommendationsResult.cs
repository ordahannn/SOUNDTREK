namespace SoundTrekServer.Models
{
    public class RecommendationsResult
    {
        public List<RecommendedLandmark> RecommendedLandmarks { get; set; } = new();
        public List<RecommendedRouteStop> RecommendedRoute { get; set; } = new();
    }
}
