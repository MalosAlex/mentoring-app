using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.Linq;

namespace MentoringApp.API.Controllers;


[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUserService userService,
        ILogger<AuthController> logger
    )
    {
        _userService = userService;
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
            return Unauthorized("Invalid email or password");
        }

        return Ok(new {Token = token});
    }


}