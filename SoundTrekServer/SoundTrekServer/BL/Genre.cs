using SoundTrekServer.DAL;
using System.Text.Json;
namespace SoundTrekServer.BL
{
    public class Genre
    {
        private int genreID;
        private string genreName;
        private string genreImageUrl;

        public Genre(int genreID, string genreName, string genreImageUrl)
        {
            this.GenreID = genreID;
            this.GenreName = genreName;
            this.GenreImageUrl = genreImageUrl;
        }

        public int GenreID { get => genreID; set => genreID = value; }
        public string GenreName { get => genreName; set => genreName = value; }
        public string GenreImageUrl { get => genreImageUrl; set => genreImageUrl = value; }

        public static List<Genre> GetAllGenres()
        {
            DBservices db = new DBservices();
            return db.DB_GetAllGenres();
        }

        public static async Task<string> GetGenreImageUrl(string genreName)
        {
            string apiKey = "O9GYrE4op5eyrhuS1ENU5gz1SNbfwRg40FiqIOg6eWP5Obw3gdwaA3bB"; // 🔑 שים פה את המפתח שלך
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", apiKey);

            string url = $"https://api.pexels.com/v1/search?query={Uri.EscapeDataString(genreName)}&per_page=1";
            HttpResponseMessage response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return null;

            string json = await response.Content.ReadAsStringAsync();

            using JsonDocument doc = JsonDocument.Parse(json);
            var photo = doc.RootElement.GetProperty("photos");

            if (photo.GetArrayLength() == 0)
                return null;

            string imageUrl = photo[0].GetProperty("src").GetProperty("medium").GetString();
            return imageUrl;
        }

    }
}
