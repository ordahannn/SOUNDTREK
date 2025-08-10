using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text;
using SoundTrekServer.Models;
using Microsoft.Extensions.Configuration;
using System.Diagnostics;

namespace SoundTrekServer.DAL
{
    public class GeminiDAL
    {
        private readonly HttpClient _httpClient;
        private readonly string _geminiApiKey;
        private readonly string _geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        public GeminiDAL(IConfiguration config)
        {
            _geminiApiKey = config["Gemini:ApiKey"]; // Reads the key from the "Gemini:ApiKey" section
            if (string.IsNullOrEmpty(_geminiApiKey))
                throw new InvalidOperationException("Missing Gemini ApiKey in configuration.");

            _httpClient = new HttpClient();
        }

        public GeminiDAL() : this(new ConfigurationBuilder()
                            .SetBasePath(AppContext.BaseDirectory)
                            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
                            .Build())
        {
        }

        /// <summary>
        /// Sends a list of landmarks and available categories to Gemini for classification.
        /// </summary>
        /// <param name="promptText">Classification prompt including task, categories and landmarks.</param>
        /// <returns>List of classification results (pageId + selected categories).</returns>
        public async Task<List<LandmarkClassificationResult>> ClassifyLandmarks(string promptText)
        {
            Console.WriteLine("[GeminiDAL.ClassifyLandmarks] Starting the preparation of the classification request..."); // log

            var stopwatch = Stopwatch.StartNew(); // Start timer

            // Step 1: Build the request body (payload) object containing the prompt
            var requestBody = BuildRequestBody(promptText);

            // Step 1.1: Serialize the request body (payload) object into a JSON string
            var requestBodyJson = JsonSerializer.Serialize(requestBody);
            // Console.WriteLine($"[GeminiDAL.ClassifyLandmarks] The requestBody Serialized into a Json string: {requestBodyJson}"); // log

            try
            {
                // Step 2: Create and send HTTP Post request to the Gemini endpoint - with retry logic for 503 errors (service overloaded)
                var response = await SendGeminiRequestWithRetry(requestBodyJson);

                if (response.IsSuccessStatusCode)
                {
                    // Step 3: Extract the raw generated text from the Gemini response content as a string
                    var responseTextStr = await ExtractTextFromGeminiResponse(response);
                    Console.WriteLine($"[GeminiDAL.ClassifyLandmarks] Raw Gemini response: {responseTextStr.Substring(0, Math.Min(responseTextStr.Length, 100))}...");

                    // Step 4: Clean the raw response text and extract the JSON array as a string
                    var responseJsonArrayStr = ExtractJsonArrayFromResponse(responseTextStr);
                    Console.WriteLine($"[GeminiDAL.ClassifyLandmarks] Clean response JSON text: {responseJsonArrayStr.Substring(0, Math.Min(responseJsonArrayStr.Length, 100))}..."); // log

                    // Step 5: Parse the cleaned JSON text into LandmarkClassificationResult objects list 
                    List<LandmarkClassificationResult> classificationResults = ParseResponseTextToClassificationResult(responseJsonArrayStr);

                    Console.WriteLine($"[GeminiDAL.ClassifyLandmarks] Returning {classificationResults.Count} results."); // log

                    stopwatch.Stop(); // Stop timer
                    Console.WriteLine($"[GeminiDAL] Gemini classification took {stopwatch.ElapsedMilliseconds} ms");                    

                    return classificationResults;
                }
                else
                {
                    stopwatch.Stop(); // Stop timer

                    // Other non-success status: log and abort
                    Console.WriteLine($"[GeminiDAL.ClassifyLandmarks] Error (after {stopwatch.ElapsedMilliseconds} ms): {response.StatusCode}");
                    return new List<LandmarkClassificationResult>();
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop(); // Stop timer

                // Other exception: log and abort
                Console.WriteLine($"[GeminiDAL.ClassifyLandmarks] Exception (after {stopwatch.ElapsedMilliseconds} ms): {ex.Message}");
                return new List<LandmarkClassificationResult>();
            }
        }


        /// <summary>
        /// Constructs the request body (payload) object, matching the JSON schema expected by Gemini.
        /// </summary>
        /// <param name="promptText">Classification prompt including task, categories and landmarks.</param>
        /// <returns>Request body (payload) object.</returns>

        // 1. Build the request body (request body) object containing the prompt
        private object BuildRequestBody(string promptText)
        {
            Console.WriteLine("[GeminiDAL.BuildRequestBody] Creating the requestBody..."); // log

            // Build the request payload: a single-part message containing the promptText
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = promptText }
                        }
                    }
                }
            };
            return requestBody;
        }

        /// <summary>
        /// Builds the HTTP POST request to Gemini, setting URL, API-key header, and JSON content.
        /// </summary>
        private HttpRequestMessage CreateGeminiPostRequest(string requestBodyJson)
        {
            // Create an HttpRequestMessage (Post method) with the Gemini api URL
            var request = new HttpRequestMessage(HttpMethod.Post, _geminiUrl);

            // Add the API key header for authentication
            request.Headers.Add("x-goog-api-key", _geminiApiKey);

            // Attach the serialized JSON request body (payload) as the request content
            request.Content = new StringContent(
                requestBodyJson,
                Encoding.UTF8,
                "application/json"
            );

            return request;
        }

        /// <summary>
        /// Builds and sends the classification POST request to Gemini, with retry logic for 503 errors.
        /// Retry logic: retrying up to 3 times on HTTP 503 with exponential backoff.
        /// </summary>
        private async Task<HttpResponseMessage> SendGeminiRequestWithRetry(string requestBodyJson)
        {
            // Configure retry policy parameters
            const int maxRetries = 3;   // Number of attempts before giving up
            int delayMs = 1000;         // Initial backoff delay (in milliseconds) - start with a 1 second

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    // Create HTTP POST request for Gemini classification
                    var request = CreateGeminiPostRequest(requestBodyJson);

                    // Send the request to the Gemini endpoint
                    var response = await _httpClient.SendAsync(request);

                    // If the service is overloaded, wait and retry
                    if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable)
                    {
                        // 503: Service is overloaded
                        Console.WriteLine($"[GeminiDAL.SendGeminiRequestWithRetry] Attempt {attempt} failed with 503, retrying in {delayMs}ms..."); // log

                        await Task.Delay(delayMs);
                        delayMs *= 2; // Increase the delay for next attempt - exponential backoff
                        continue;
                    }

                    // Return either a successful response or a non-503 error
                    return response;
                }
                catch (Exception ex)
                {
                    // On exception: retry or abort if max attempts reached
                    Console.WriteLine($"[GeminiDAL.SendGeminiRequestWithRetry] Error calling Gemini. Exception on attempt {attempt}: {ex.Message}");

                    if (attempt == maxRetries)
                        throw;

                    await Task.Delay(delayMs);
                    delayMs *= 2; // Increase the delay for next attempt - exponential backoff
                }
            }

            // Exhausted all retries without success, log and throw exception
            Console.WriteLine("[GeminiDAL.SendGeminiRequestWithRetry] All retry attempts failed.");
            throw new InvalidOperationException("[GeminiDAL.SendGeminiRequestWithRetry] Unreachable retry logic reached");
        }


        /// <summary>
        /// Reads the Gemini HTTPS response body and extracts the raw “text” field from the first candidate.
        /// </summary>
        private async Task<string> ExtractTextFromGeminiResponse(HttpResponseMessage response)
        {
            Console.WriteLine($"[GeminiDAL.ExtractTextFromGeminiResponse] Extracting the Gemini raw response text ..."); // log

            // Read the full raw JSON response content (returned from Gemini) as a string
            var responseJson = await response.Content.ReadAsStringAsync();

            // Parse the raw JSON into a DOM to navigate to the “text” field
            using var doc = JsonDocument.Parse(responseJson);

            // 1. Extract the generated text from the response structure
            var responseText = doc.RootElement
                                    .GetProperty("candidates")[0]
                                    .GetProperty("content")
                                    .GetProperty("parts")[0]
                                    .GetProperty("text")
                                    .GetString() ?? string.Empty;

            return responseText;
        }

        /// <summary>
        /// Cleans the raw response text - trims whitespace/backticks, 
        /// then extracts the JSON array (between '[' and ']') as s string.
        /// </summary>
        private string ExtractJsonArrayFromResponse(string rawResponseText)
        {
            Console.WriteLine($"[GeminiDAL.ExtractJsonArrayFromResponse] Cleaning Gemini raw response text and extracting the JSON array..."); // log

            // If the response is empty or whitespace, return an empty string
            if (string.IsNullOrWhiteSpace(rawResponseText))
                return string.Empty;

            // Remove leading/trailing whitespace and any markdown backticks
            var cleanedResponseText = rawResponseText.Trim() // Trim whitespace/newlines
                                         .Trim('`')          // Strip backtick ` characters if present
                                         .Trim();

            // After cleaning, if the response is empty or whitespace, return an empty string
            if (string.IsNullOrWhiteSpace(cleanedResponseText))
                return string.Empty;

            //  Locate the JSON array within square brackets, and extract only that substring
            int start = cleanedResponseText.IndexOf('[');
            int end = cleanedResponseText.LastIndexOf(']');
            if (start >= 0 && end > start)
            {
                // Extract just the array slice
                cleanedResponseText = cleanedResponseText[start..(end + 1)];
            }

            return cleanedResponseText;
        }

        /// <summary>
        /// Deserializes the cleaned JSON array into LandmarkClassificationResult objects.
        /// Returns an empty list on parse errors or if input is empty.
        /// </summary>        
        private List<LandmarkClassificationResult> ParseResponseTextToClassificationResult(string cleanedJsonText)
        {

            if (string.IsNullOrWhiteSpace(cleanedJsonText))
                return new List<LandmarkClassificationResult>();

            try
            {
                // Try to parse the returned Json text as JSON array of LandmarkClassificationResult type
                // Deserialize into a list, ignoring case on property names
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsedResults = JsonSerializer.Deserialize<List<LandmarkClassificationResult>>(
                    cleanedJsonText,
                    options
                );

                Console.WriteLine($"[GeminiDAL.ParseResults] Parsed {parsedResults?.Count ?? 0} classification results."); // log

                return parsedResults ?? new List<LandmarkClassificationResult>();
            }
            catch (JsonException je)
            {
                // If parsing fails, log the error and return an empty list
                Console.WriteLine($"[GeminiDAL] Failed to parse responseText as JSON array: {je.Message}");

                return new List<LandmarkClassificationResult>();
            }
        }




        private string ExtractJsonObjectFromResponse(string rawResponseText)
        {
            if (string.IsNullOrWhiteSpace(rawResponseText))
                return string.Empty;

            // Clean up backticks and spaces
            var cleaned = rawResponseText.Trim().Trim('`').Trim();

            // If the string starts with the word "json" (like sometimes in Gemini's prompt) – remove it
            if (cleaned.StartsWith("json", StringComparison.OrdinalIgnoreCase))
            {
                cleaned = cleaned.Substring(4).Trim();
            }

            return cleaned;
        }



        /// <summary>
        /// 
        /// </summary>
        /// <param name="promptText"></param>
        /// <returns></returns>
        public async Task<RecommendationsResult> CreateUserRecommendations(string promptText)
        {
            Console.WriteLine("[GeminiDAL.CreateUserRecommendations] Starting the preparation of the request..."); // log

            // Step 1: Build the request body (payload) object containing the prompt
            var requestBody = BuildRequestBody(promptText);

            // Step 1.1: Serialize the request body (payload) object into a JSON string
            var requestBodyJson = JsonSerializer.Serialize(requestBody);
            Console.WriteLine($"[GeminiDAL.CreateUserRecommendations] The requestBody Serialized into a Json string: {requestBodyJson}"); // log

            try
            {
                // Step 2: Create and send HTTP Post request to the Gemini endpoint - with retry logic for 503 errors (service overloaded)
                var response = await SendGeminiRequestWithRetry(requestBodyJson);

                if (response.IsSuccessStatusCode)
                {
                    // Step 3: Extract the raw generated text from the Gemini response content as a string
                    var responseTextStr = await ExtractTextFromGeminiResponse(response);
                    Console.WriteLine($"[GeminiDAL.CreateUserRecommendations] Raw Gemini response: {responseTextStr.Substring(0, Math.Min(responseTextStr.Length, 500))}..."); // log

                    // Step 4: Clean the raw response text and extract the JSON object as a string
                    var responseJsonObjectStr = ExtractJsonObjectFromResponse(responseTextStr);
                    Console.WriteLine($"[GeminiDAL.CreateUserRecommendations] Clean response JSON text: {responseJsonObjectStr}"); // log

                    if (string.IsNullOrWhiteSpace(responseJsonObjectStr))
                    {
                        Console.WriteLine("[GeminiDAL.CreateUserRecommendations] Cleaned response is empty – returning empty RecommendationsResult.");
                        return new RecommendationsResult();
                    }

                    // Step 5: Parse the cleaned JSON text into RecommendationsResult object
                    RecommendationsResult recommendationsResults = ParseResponseTextToRecommendationsResult(responseJsonObjectStr);

                    Console.WriteLine($"[GeminiDAL.CreateUserRecommendations] Returning {recommendationsResults.RecommendedLandmarks.Count} recommended landmarks from Gemini."); // log
                    Console.WriteLine($"[GeminiDAL.CreateUserRecommendations] Returning recommended route with {recommendationsResults.RecommendedRoute.Count} stops from Gemini."); // log

                    return recommendationsResults;
                }
                else
                {
                    // Other non-success status: log and abort
                    Console.WriteLine($"[GeminiDAL] Error during creation of recommendations with Gemini: {response.StatusCode}");
                    return new RecommendationsResult();
                }
            }
            catch (Exception ex)
            {
                // Other exception: log and abort
                Console.WriteLine($"[GeminiDAL] An unexpected exception occurred during recommendations creation with Gemini: {ex.Message}");
                return new RecommendationsResult();
            }
        }
        

        
        /// <summary>
        /// Deserializes the cleaned JSON into RecommendationsResult objects.
        /// Returns an empty response on parse errors or if input is empty.
        /// </summary>        
        private RecommendationsResult ParseResponseTextToRecommendationsResult(string cleanedJsonText)
        {

            if (string.IsNullOrWhiteSpace(cleanedJsonText))
                return new RecommendationsResult();

            try
            {
                // Try to parse the returned Json text as RecommendationsResult type
                // Deserialize into an object, ignoring case on property names
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsedResults = JsonSerializer.Deserialize<RecommendationsResult>(
                    cleanedJsonText,
                    options
                );

                Console.WriteLine($"[GeminiDAL.ParseResults] Parsed {parsedResults?.RecommendedLandmarks?.Count ?? 0} recommended landmarks, and {parsedResults?.RecommendedRoute?.Count ?? 0} route stops");

                return parsedResults ?? new RecommendationsResult();
            }
            catch (JsonException je)
            {
                // If parsing fails, log the error and return an empty list
                Console.WriteLine($"[GeminiDAL] Failed to parse responseText as RecommendationsResult: {je.Message}");

                return new RecommendationsResult();
            }
        }
        

    }
}