namespace SoundTrekServer.Models
{
    public class Landmark
    {
        public string Title { get; set; } = string.Empty;
        public string PageId { get; set; } = string.Empty;
        public double Lat { get; set; }
        public double Lon { get; set; }
        public string? ImageUrl { get; set; }
        public string? ShortDescription { get; set; }
        public List<MainCategory> MainCategories { get; set; } = new();
        public List<Category> Categories { get; set; } = new();        
        public List<Interest> Interests { get; set; } = new();
    }
}
