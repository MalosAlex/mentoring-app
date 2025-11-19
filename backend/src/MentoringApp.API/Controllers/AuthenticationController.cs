using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;

namespace MentoringApp.API.Controllers;


[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ITokenBlacklistService _tokenBlacklistService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUserService userService,
        
        ITokenBlacklistService tokenBlacklistService,
        ILogger<AuthController> logger
    )
    {
        _userService = userService;
        _tokenBlacklistService = tokenBlacklistService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        try
        {
            await _userService.RegisterUserAsync(request);
            return Created();
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var token = await _userService.LoginAsync(request);
        if(token == null)
        {
            return Unauthorized("Invalid credentials");
        }

        return Ok(new {Token = token});
    }
    
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var authHeader = Request.Headers[HeaderNames.Authorization].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return BadRequest("Invalid authorization header");
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        
        var jwtHandler = new JwtSecurityTokenHandler();
        var jwtToken = jwtHandler.ReadJwtToken(token);
        var expiration = jwtToken.ValidTo;

        await _tokenBlacklistService.BlacklistTokenAsync(token, expiration);

        return Ok("Logged out successfully");
    }

}