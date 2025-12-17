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

        int userId = GetUserIdFromToken();
        var response = await _communityService.GetAllAsync(userId);

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

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _communityService.AddAsync(request);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Created();
    }

    [HttpPost("{communityId}/join")]
    [Authorize]
    public async Task<IActionResult> Join([FromRoute] int communityId)
    {
        int userId = GetUserIdFromToken();

        _logger.LogInformation("{UserId} joining community {CommunityId}.", userId, communityId);

        await _communityService.Join(communityId, userId);

        return Ok();
    }

    [HttpPost("{communityId}/leave")]
    [Authorize]
    public async Task<IActionResult> Leave([FromRoute] int communityId)
    {
        int userId = GetUserIdFromToken();

        _logger.LogInformation("{UserId} leaving community {CommunityId}.", userId, communityId);

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