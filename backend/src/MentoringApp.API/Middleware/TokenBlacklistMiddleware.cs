using System.Text.Json;
using MentoringApp.Core.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace MentoringApp.API.Middleware;

public class TokenBlacklistMiddleware
{
    private readonly RequestDelegate _next;

    public TokenBlacklistMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITokenBlacklistService blacklistService)
    {
        var authHeader = context.Request.Headers[HeaderNames.Authorization].ToString();
        
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            
            if (await blacklistService.IsTokenBlacklistedAsync(token))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/problem+json";

                    var problemDetails = new ProblemDetails
                    {
                        Detail = "This token has been revoked and cannot be used."
                    };

                    var jsonResponse = JsonSerializer.Serialize(problemDetails);
                    await context.Response.WriteAsync(jsonResponse);
                    
                    return;
                }
        }

        await _next(context);
    }
}