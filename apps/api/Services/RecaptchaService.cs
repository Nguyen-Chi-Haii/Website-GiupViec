using System.Text.Json;

namespace GiupViecAPI.Services
{
    public interface IRecaptchaService
    {
        Task<bool> VerifyAsync(string token);
    }

    public class RecaptchaService : IRecaptchaService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<RecaptchaService> _logger;

        public RecaptchaService(HttpClient httpClient, IConfiguration configuration, ILogger<RecaptchaService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> VerifyAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("CAPTCHA token is empty");
                return false;
            }

            var secretKey = _configuration["Recaptcha:SecretKey"];
            
            // If no secret key configured or using placeholder, skip verification in development
            if (string.IsNullOrEmpty(secretKey) || secretKey.StartsWith("YOUR_"))
            {
                _logger.LogWarning("Recaptcha SecretKey not configured or using placeholder - skipping verification (dev mode)");
                return true; // Allow in development
            }

            try
            {
                var response = await _httpClient.PostAsync(
                    $"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={token}",
                    null
                );

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RecaptchaResponse>(jsonResponse);

                if (result == null)
                {
                    _logger.LogWarning("Failed to parse reCAPTCHA response");
                    return false;
                }

                // reCAPTCHA v3 returns a score (0.0 - 1.0), threshold typically 0.5
                if (result.success && result.score >= 0.5)
                {
                    _logger.LogInformation($"reCAPTCHA verified successfully. Score: {result.score}");
                    return true;
                }

                _logger.LogWarning($"reCAPTCHA verification failed. Success: {result.success}, Score: {result.score}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying reCAPTCHA");
                return false;
            }
        }

        private class RecaptchaResponse
        {
            public bool success { get; set; }
            public double score { get; set; }
            public string action { get; set; }
            public DateTime challenge_ts { get; set; }
            public string hostname { get; set; }
            public string[] error_codes { get; set; }
        }
    }
}
