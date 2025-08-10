using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace SoundTrekServer.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class TtsController : ControllerBase {
        private readonly IConfiguration _config;

        // Allows us to read varibales from .env
        public TtsController(IConfiguration config) {
            _config = config;
        }

        // POST: /api/tts
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] TtsRequest request) {
            // Get the enviromen varibales
            var apiKey = _config["AZURE_TTS_KEY"];
            var region = _config["AZURE_TTS_REGION"];

            var ssml = $@"
            <speak version='1.0' xml:lang='en-US'>
                <voice name='en-US-JennyNeural'>
                    <express-as style='{request.Style}'>
                        {request.Text}
                    </express-as>
                </voice>
            </speak>";

            // HTTP request to AZURE
            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", apiKey);
            client.DefaultRequestHeaders.Add("User-Agent", "SoundTrekTTS");

            var content = new StringContent(ssml, System.Text.Encoding.UTF8, "application/ssml+xml");
            content.Headers.Add("X-Microsoft-OutputFormat", "audio-16khz-128kbitrate-mono-mp3");
            var url = $"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1";

            var response = await client.PostAsync(url, content);

            if(!response.IsSuccessStatusCode) {
                return StatusCode((int)response.StatusCode, "Azure TTS error");
            }

            var audioBytes = await response.Content.ReadAsByteArrayAsync();

            // Return the audio file to the user
            return File(audioBytes, "audio/mpeg");
        }
    }

    // Data structure to hold the data that we recieve from the user 
    public class TtsRequest {
        public string Text { get; set; } = string.Empty;
        public string Style { get; set; } = "defaukt";
    }
}