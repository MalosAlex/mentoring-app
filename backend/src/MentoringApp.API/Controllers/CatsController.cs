using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace MentoringApp.API.Controllers;

[ApiController]
[Route("[controller]")]
public class CatsController : Controller
{
    private readonly ILogger<CatsController> _logger;
    private readonly ICatsService _catsService;

    public CatsController(ILogger<CatsController> logger, ICatsService catsService)
    {
        _logger = logger;
        _catsService = catsService;
    }

    [HttpGet("")]
    public async Task<IActionResult> GetMuscleGroups([FromQuery] GetCatsRequest request)
    {
        _logger.LogInformation("Getting {CatsCounts} cats.", request.Count);

        var cats = await _catsService.GetCats(request);

        if (cats == null)
        {
            return BadRequest();
        }

        return Ok(cats);
    }
}