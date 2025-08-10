namespace SoundTrekServer.Models
{
    public class CategoryMainCategoryLink
    {
        public int CategoryId { get; set; }
        public MainCategory MainCategory { get; set; } = null!;
    }
}
