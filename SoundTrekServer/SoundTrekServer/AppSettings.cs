public static class AppSettings
{
    public static string GeminiApiKey { get; private set; }

    public static void Initialize(IConfiguration configuration)
    {
        GeminiApiKey = configuration["Gemini:ApiKey"];
        if (string.IsNullOrEmpty(GeminiApiKey))
            throw new InvalidOperationException("Gemini ApiKey is missing!");
    }
}