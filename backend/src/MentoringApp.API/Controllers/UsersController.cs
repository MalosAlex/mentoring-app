using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace MentoringApp.API.Controllers;


[ApiController]
[Route("api")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserService userService,
        ILogger<UsersController> logger
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

}