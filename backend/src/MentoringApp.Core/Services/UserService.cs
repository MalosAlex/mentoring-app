using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Core.Validation;
using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace MentoringApp.Core.Services;

internal class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public UserService(
        IUserRepository userRepository,
        IConfiguration configuration
    )
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<string?> LoginAsync(LoginRequest request)
    {
        var isEmail = request.Identifier.Contains('@');
    
        var user = isEmail 
            ? await _userRepository.GetUserByEmailAsync(request.Identifier)
            : await _userRepository.GetUserByUsernameAsync(request.Identifier);
        if(user == null)
        {
            return null;
        }

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if(!isPasswordValid)
        {
            return null;
        }

        return GenerateJwtToken(user);
    }
    private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("fullName", user.FullName)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    public async Task RegisterUserAsync(RegisterRequest request)
    {
        UserValidator.ValidateRegisterRequest(request);

        var existingUser = await _userRepository.GetUserByEmailAsync(request.Email)?? await _userRepository.GetUserByUsernameAsync(request.Username);
        if(existingUser != null)
        {
            throw new InvalidOperationException("User already exists");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            FullName = request.FullName,
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash
        };

        await _userRepository.AddUserAsync(user);
    }
}