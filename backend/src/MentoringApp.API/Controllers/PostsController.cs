using MentoringApp.API.Models;
using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;

namespace MentoringApp.API.Controllers;

[ApiController]
[Route("api/communities/{communityId}/posts")]
[Authorize]
public class PostsController : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4"
    };

    private readonly ILogger<PostsController> _logger;
    private readonly IPostService _postService;
    private readonly IReactionService _reactionService;
    private readonly ICommentService _commentService;
    private readonly IWebHostEnvironment _environment;

    public PostsController(
        ILogger<PostsController> logger,
        IPostService postService,
        IReactionService reactionService,
        ICommentService commentService,
        IWebHostEnvironment environment)
    {
        _logger = logger;
        _postService = postService;
        _reactionService = reactionService;
        _commentService = commentService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> Get(int communityId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        _logger.LogInformation("User {UserId} fetching posts for community {CommunityId}", GetUserIdFromToken(), communityId);

        var response = await _postService.GetByCommunityAsync(communityId, pageNumber, pageSize);

        return Ok(response);
    }

    [HttpPost]
    [RequestSizeLimit(104857600)] // 100 MB
    public async Task<IActionResult> Create(int communityId, [FromForm] CreatePostForm form)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userId = GetUserIdFromToken();
        string? mediaUrl = null;

        if (form.Media is { Length: > 0 })
        {
            if (!AllowedContentTypes.Contains(form.Media.ContentType))
            {
                return BadRequest("Unsupported media type.");
            }

            mediaUrl = await SaveMediaFileAsync(form.Media);
        }

        var created = await _postService.CreateAsync(new CreatePostRequest
        {
            Caption = form.Caption,
            CommunityId = communityId,
            UserId = userId,
            MediaUrl = mediaUrl
        });

        return CreatedAtAction(nameof(Get), new { communityId, pageNumber = 1, pageSize = 1 }, created);
    }

    [HttpPost("{postId}/react")]
    public async Task<IActionResult> React(int communityId, int postId, [FromBody] ReactToPostRequest body)
    {
        var userId = GetUserIdFromToken();
        body.PostId = postId;
        body.UserId = userId;
        var result = await _reactionService.ReactAsync(body);
        return Ok(result);
    }

    [HttpPost("{postId}/comment")]
    public async Task<IActionResult> Comment(int communityId, int postId, [FromBody] AddCommentRequest body)
    {
        var userId = GetUserIdFromToken();
        body.PostId = postId;
        body.UserId = userId;
        var result = await _commentService.AddAsync(body);
        return Ok(result);
    }

    private async Task<string> SaveMediaFileAsync(IFormFile file)
    {
        var uploadsPath = Path.Combine(GetWebRootPath(), "uploads");
        Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsPath, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        return $"/uploads/{fileName}";
    }

    private string GetWebRootPath()
    {
        if (!string.IsNullOrWhiteSpace(_environment.WebRootPath))
        {
            return _environment.WebRootPath;
        }

        var defaultPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        Directory.CreateDirectory(defaultPath);
        return defaultPath;
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

