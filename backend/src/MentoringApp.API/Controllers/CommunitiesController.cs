using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;

namespace MentoringApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommunitiesController : Controller
{
    private readonly ILogger<CommunitiesController> _logger;
    private readonly ICommunityService _communityService;

    public CommunitiesController(ILogger<CommunitiesController> logger, ICommunityService communityService)
    {
        _logger = logger;
        _communityService = communityService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("Getting all Communities.");

        var response = await _communityService.GetAllAsync();

        if (response == null)
        {
            return BadRequest();
        }

        return Ok(response.Communities);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Add([FromBody] AddCommunityRequest request)
    {
        _logger.LogInformation("Adding Community.");

        await _communityService.AddAsync(request);

        return Created();
    }

    [HttpPost("{communityId}/join")]
    [Authorize]
    public async Task<IActionResult> Join([FromRoute] int communityId)
    {
        _logger.LogInformation("Getting all Communities.");

        int userId = GetUserIdFromToken();

        await _communityService.Join(communityId, userId);

        return Ok();
    }

    [HttpPost("{communityId}/leave")]
    [Authorize]
    public async Task<IActionResult> Leave([FromRoute] int communityId)
    {
        _logger.LogInformation("Getting all Communities.");

        int userId = GetUserIdFromToken();

        await _communityService.Leave(communityId, userId);

        return Ok();
    }

    private int GetUserIdFromToken()
    {
        var authHeader = Request.Headers[HeaderNames.Authorization].ToString();

        var token = authHeader.Substring("Bearer ".Length).Trim();

        var jwtHandler = new JwtSecurityTokenHandler();
        var jwtToken = jwtHandler.ReadJwtToken(token);

        return int.Parse(jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
    }
}