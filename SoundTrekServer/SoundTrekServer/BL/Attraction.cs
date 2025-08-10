using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http.Headers;
using System.Net;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;


namespace SoundTrekServer.BL
{
    public class Attraction
    {
        private static readonly HttpClient client = new HttpClient();
        private static readonly string apiKey = AppSettings.GeminiApiKey;


        public static async Task<string> AttractionProcess(string language, double latitude, double longitude, int radius)
        {
            string attractionJson = await GetNearbyAttractions(latitude, longitude, radius);
            string description = await GetSpecificDescription(attractionJson, 0);
            //description = "Transform the following description of a tourist attraction into a captivating and suspenseful story in Hebrew. Make it engaging, as if the reader is about to embark on an unforgettable journey. Add a sense of mystery, wonder, and excitement, turning the location into a place that feels alive with history, secrets, or adventure. Original Description: " + description;
            //description = "Turn the following description of a tourist attraction into a fun and exciting story for kids in Hebrew! Make it playful, full of adventure, and spark their imagination. Add magical surprises, talking animals, hidden treasures, or anything that makes the place feel like a world of wonder!\r\n\r\nOriginal Description: " + description;
            description = "Rewrite the following description of a tourist attraction in the style of the Bible. Use grand, poetic language, as if telling a sacred story or prophecy. Describe the place with reverence and awe, as if it were part of an ancient tale written in holy scripture.\r\n\r\nOriginal Description: " + description;
            //description = "Transform the following description of a tourist attraction into an exciting treasure hunt adventure in Hebrew! Write it as if the reader is on a daring quest, following hidden clues, solving ancient riddles, and uncovering a long-lost secret. Add mystery, suspense, and the thrill of discovery—every step should bring them closer to the ultimate treasure! Original Description: " + description;
            string renderedDesc = await CallGeminiAPI(description, language);
            return renderedDesc;

        }

        public static async Task<string> GetNearbyAttractions(double latitude, double longitude, int radius)
        {
            // Step 1: Call the geosearch API to get nearby attractions.
            string geoSearchUrl = $"https://en.wikipedia.org/w/api.php?action=query&format=json&list=geosearch" +
                                  $"&gscoord={latitude}|{longitude}&gsradius={radius}";
            try
            {
                string geoResponse = await client.GetStringAsync(geoSearchUrl);
                JObject geoJson = JObject.Parse(geoResponse);
                JArray geosearch = (JArray)geoJson["query"]?["geosearch"];

                if (geosearch == null || geosearch.Count == 0)
                {
                    return JsonConvert.SerializeObject(new { Attractions = new List<object>() }, Formatting.Indented);
                }

                var attractionsList = new List<object>();

                // Step 2: For each attraction, call the extracts API individually.
                foreach (JObject item in geosearch)
                {
                    string pageId = item["pageid"].ToString();
                    string title = item["title"].ToString();
                    double lat = item["lat"].ToObject<double>();
                    double lon = item["lon"].ToObject<double>();

                    // Build the URL for getting the full plain-text description for this attraction.
                    string detailsUrl = $"https://en.wikipedia.org/w/api.php?action=query&format=json" +
                                        $"&prop=extracts&explaintext=true&redirects=1&pageids={pageId}";

                    string detailsResponse = await client.GetStringAsync(detailsUrl);
                    JObject detailsJson = JObject.Parse(detailsResponse);
                    JObject pages = (JObject)detailsJson["query"]?["pages"];

                    string description = "";
                    if (pages != null && pages[pageId] != null)
                    {
                        description = pages[pageId]["extract"]?.ToString() ?? "No description available.";
                    }

                    // Clean up the description:
                    // Remove newline, carriage returns, and tab characters.
                    string cleanedDescription = description.Replace("\n", " ")
                                                             .Replace("\r", " ")
                                                             .Replace("\t", " ")
                                                             .Trim();
                    // Remove any text starting with "== References =="
                    int refIndex = cleanedDescription.IndexOf("== References ==");
                    if (refIndex >= 0)
                    {
                        cleanedDescription = cleanedDescription.Substring(0, refIndex).Trim();
                    }

                    refIndex = cleanedDescription.IndexOf("== See also ==");
                    if (refIndex >= 0)
                    {
                        cleanedDescription = cleanedDescription.Substring(0, refIndex).Trim();
                    }

                    var attraction = new
                    {
                        Title = title,
                        Latitude = lat,
                        Longitude = lon,
                        Description = cleanedDescription
                    };

                    attractionsList.Add(attraction);
                }
                // Return the combined result as a formatted JSON string.
                return JsonConvert.SerializeObject(new { Attractions = attractionsList }, Formatting.Indented);
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new { Error = ex.Message });
            }
        }


        public static async Task<string> GetSpecificDescription(string attractionJson, int number)
        {
            JObject jsonObj = JObject.Parse(attractionJson);
            JArray attractions = (JArray)jsonObj["Attractions"]; // Get the "Attractions" array

            // Extract the "Description" of the first attraction safely
            string tempDescription = attractions?.Count >= number
                ? (string)attractions[number]["Description"]
                : "No attractions found.";
            return tempDescription;
        }


        //public static async Task<string> AiGenerate(string prompt, string genre, string language)
        //{
        //    prompt = SanitizeForJson(prompt);

        //    string description = $"Rewrite the following description of a tourist attraction in the style of the {genre}. Write a long paragraph. Original Description: " + prompt;
        //    return await CallGeminiAPI(description, language);


        //}
        public static async Task<string> AiGenerate(string desc, string genre, string language)
        {
            // desc = SanitizeForJson(desc);


            var promptJson = new
            {
                //instructions = $"Rewrite the following description of a tourist attraction into a rich, immersive, and highly stylistically distinct long paragraph that fully embodies the specified genre. The output must be deeply influenced by the genre's unique tone, mood, vocabulary, and storytelling style—whether it's fantasy, mystery, romance, thriller, or any other genre. Ensure the language paints vivid pictures aligned with the genre's conventions, creating an engaging and authentic listening experience. Write clearly and naturally only in the chosen language, strictly maintaining correct grammar and syntax. Avoid any quotation marks or special characters except letters, numbers, commas, and periods. The narration should transport the listener fully into the world and atmosphere of the genre, making the location come alive through genre-appropriate storytelling.",
                //instructions = $"Rewrite the following description of a tourist attraction into a rich, immersive, and highly stylistically distinct long paragraph that fully embodies the specified genre. The output must be deeply influenced by the genre's unique tone, mood, vocabulary, and storytelling style—whether it's fantasy, mystery, romance, thriller, or any other genre. Ensure the language paints vivid pictures aligned with the genre's conventions, creating an engaging and authentic listening experience. Write clearly and naturally only in the chosen language, strictly maintaining correct grammar and syntax. Use proper punctuation with commas and periods only; avoid any quotation marks or special characters except letters, numbers, commas, and periods. The narration should transport the listener fully into the world and atmosphere of the genre, making the location come alive through genre-appropriate storytelling.\r\n",
                instructions = $"Rewrite the following description of a tourist attraction into a rich, immersive, and highly stylistically distinct long paragraph that fully embodies the specified genre. The output must be deeply influenced by the genre's unique tone, mood, vocabulary, and storytelling style—whether it's fantasy, mystery, romance, thriller, or any other genre. Ensure the language paints vivid pictures aligned with the genre's conventions, creating an engaging and authentic listening experience. Write clearly and naturally only in the chosen language, strictly maintaining correct grammar and syntax. Use proper punctuation with commas and periods throughout the entire text; do NOT omit or skip commas and periods anywhere. Avoid any quotation marks or special characters except letters, numbers, commas, and periods. The narration should transport the listener fully into the world and atmosphere of the genre, making the location come alive through genre-appropriate storytelling.",
                genre = genre,
                language = language,
                originalDescription = desc
            };


            string jsonPrompt = System.Text.Json.JsonSerializer.Serialize(promptJson);

            return await CallGeminiAPI(jsonPrompt, language);
        }


        public static async Task<string> CallGeminiAPI(string prompt, string language)
        {

            using HttpClient client = new HttpClient();
            string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            //new { text = "The response should be completely in " + language + ". In addition try to make the response as long as possible. " + prompt }
                            new {text = prompt}
                        }
                    }
                }
            };

            string jsonContent = JsonConvert.SerializeObject(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Ensure Content-Length is included
            content.Headers.ContentLength = Encoding.UTF8.GetByteCount(jsonContent);

            // Send the POST request
            HttpResponseMessage response = await client.PostAsync(url, content);
            string responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"API Error: {response.StatusCode} - {responseJson}");
            }

            JObject Json = JObject.Parse(responseJson);
            string desc = (string)Json["candidates"][0]["content"]["parts"][0]["text"];
            string cleanedDesc = desc.Replace("\n", " ").Replace("\r", " ").Replace("\t", " ").Trim();

            cleanedDesc = Regex.Replace(cleanedDesc, @"[^0-9\p{L}\.,\s]", "");

            //string cleanedDesc = desc;
            cleanedDesc = Regex.Replace(cleanedDesc, @"\s+", " ");
            return cleanedDesc;
        }

        public static string SanitizeForJson(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            // Replace problematic control characters and escape sequences
            var sanitized = input
                .Replace("\\", "\\\\")   // backslash
                .Replace("\"", "\\\"")   // double quote
                .Replace("\b", "")       // backspace
                .Replace("\f", "")       // form feed
                .Replace("\n", "")       // newline
                .Replace("\r", "")       // carriage return
                .Replace("\t", " ");     // tab to space (optional)

            // Optionally strip out non-printable/control characters
            sanitized = new string(sanitized.Where(c => !char.IsControl(c)).ToArray());

            return sanitized;
        }


    }
}
