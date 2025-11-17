using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Models;
using Microsoft.EntityFrameworkCore;

namespace MentoringApp.Persistance.Context;

internal class CatsRepository : ICatsRepository
{
    private readonly DataContext _context;

    public CatsRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<List<CatResponse>> GetCats(int count)
    {
        return await _context.Cats
            .OrderBy(cat => cat.Id)
            .Take(count)
            .Select(cat => cat.ToModel())
            .ToListAsync();
    }
}
