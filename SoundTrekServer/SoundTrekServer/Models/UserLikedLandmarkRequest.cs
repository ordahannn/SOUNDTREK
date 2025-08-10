namespace SoundTrekServer.Models
{
    public class UserLikedLandmarkRequest
    {
        public int UserId { get; set; }
        public Landmark Landmark { get; set; } = new Landmark();
    }
}
