namespace SoundTrekServer.Models
{
    public class CategoryMappings
    {
        public int CategoryId { get; set; }
        public List<MainCategory> MainCategories { get; set; } = new();
        public List<Interest> Interests { get; set; } = new();
    }
}
