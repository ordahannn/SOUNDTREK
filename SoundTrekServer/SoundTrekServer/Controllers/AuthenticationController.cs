using Microsoft.AspNetCore.Mvc;
using SoundTrekServer.BL;
using SoundTrekServer.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SoundTrekServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public AuthenticationController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private readonly Auth _authBL = new Auth();

        /** 
            POST: api/Authentication/login
            Logs user in using email and password
        **/
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _authBL.Login(request.Email, request.Password);
            if (user == null)
                return Unauthorized("Invalid credentials");

            var token = GenerateJwtToken(user);

            return Ok(new { token, user }); // Return user object and a token if login was successfull
        }

        /**
            Generates JWT token for a valid user
        **/
        private string GenerateJwtToken(AppUser user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("FullName", user.FirstName + " " + user.LastName)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60*24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /**
            POST: api/Authentication/register
            Register new user
        **/
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            var user = new AppUser
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                BirthDate = request.BirthDate,
                Email = request.Email,
                PreferredLanguage = request.PreferredLanguage,
                ProfileImageUrl = request.ProfileImageUrl ?? string.Empty,
                SearchRadiusMeters = request.SearchRadiusMeters
            };

            var createdUser = _authBL.Register(user, request.Password);

            if (createdUser == null)
                return Conflict("Email already in use or registration failed");

            var token = GenerateJwtToken(createdUser);
            return Ok(new { token, user = createdUser });
        }

        /** 
            GET: api/Authentication/check-email?email=…
            Checks if the email is already registered
        **/
        [HttpGet("check-email")]
        public IActionResult CheckEmail([FromQuery] string email)
        {
            bool exists = _authBL.IsEmailTaken(email);
            return Ok(new { emailTaken = exists });
        }

        /**
            GET: api/Authentiction/get-user-data?userId=…
            Returns user info by id
        **/
        [HttpGet("get-user-data")]
        public IActionResult GetUserById([FromQuery] int userId)
        {
            var user = _authBL.GetUserById(userId);

            if (user == null)
                return NotFound();

            return Ok(user);
        }
    }
}