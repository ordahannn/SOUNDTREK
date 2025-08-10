namespace SoundTrekServer.Models
{
    public class RecommendationsResponse
    {
        public List<Landmark> RecommendedLandmarks { get; set; } = new();
        public List<RecommendedRouteStop> RecommendedRoute { get; set; } = new();
    }
}
