using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace Ergoplanner.API.Controllers
{
    /// <summary>
    /// Health check and system information endpoints
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;
        private readonly IConfiguration _configuration;

        public HealthController(ILogger<HealthController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Get basic health status of the API
        /// </summary>
        /// <returns>Health status information</returns>
        /// <response code="200">API is healthy and running</response>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
        public ActionResult<HealthResponse> GetHealth()
        {
            _logger.LogInformation("Health check requested");

            return Ok(new HealthResponse
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
            });
        }

        /// <summary>
        /// Get detailed health information (requires authentication)
        /// </summary>
        /// <returns>Detailed health status information</returns>
        /// <response code="200">Detailed health information retrieved successfully</response>
        /// <response code="401">Unauthorized - Authentication required</response>
        [HttpGet("detailed")]
        [Authorize]
        [ProducesResponseType(typeof(DetailedHealthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public ActionResult<DetailedHealthResponse> GetDetailedHealth()
        {
            _logger.LogInformation("Detailed health check requested by {User}", User?.Identity?.Name ?? "Unknown");

            return Ok(new DetailedHealthResponse
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                MachineName = Environment.MachineName,
                OSVersion = Environment.OSVersion.ToString(),
                ProcessorCount = Environment.ProcessorCount,
                WorkingSet = Environment.WorkingSet / (1024 * 1024), // Convert to MB
                IsDebugMode = System.Diagnostics.Debugger.IsAttached,
                StartTime = Process.GetCurrentProcess().StartTime
            });
        }

        /// <summary>
        /// Ping endpoint for simple connectivity check
        /// </summary>
        /// <returns>Pong response</returns>
        /// <response code="200">Pong</response>
        [HttpGet("ping")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public ActionResult<string> Ping()
        {
            return Ok("pong");
        }
    }

    /// <summary>
    /// Basic health response model
    /// </summary>
    public class HealthResponse
    {
        /// <summary>
        /// Current health status
        /// </summary>
        public string Status { get; set; } = "Unknown";

        /// <summary>
        /// Timestamp of the health check
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// API version
        /// </summary>
        public string Version { get; set; } = "1.0.0";

        /// <summary>
        /// Current environment name
        /// </summary>
        public string Environment { get; set; } = "Unknown";
    }

    /// <summary>
    /// Detailed health response model with system information
    /// </summary>
    public class DetailedHealthResponse : HealthResponse
    {
        /// <summary>
        /// Machine name
        /// </summary>
        public string MachineName { get; set; } = "Unknown";

        /// <summary>
        /// Operating system version
        /// </summary>
        public string OSVersion { get; set; } = "Unknown";

        /// <summary>
        /// Number of processors
        /// </summary>
        public int ProcessorCount { get; set; }

        /// <summary>
        /// Working set memory in MB
        /// </summary>
        public long WorkingSet { get; set; }

        /// <summary>
        /// Indicates if running in debug mode
        /// </summary>
        public bool IsDebugMode { get; set; }

        /// <summary>
        /// Process start time
        /// </summary>
        public DateTime StartTime { get; set; }
    }
}