using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;
using Microsoft.EntityFrameworkCore;

namespace MentoringApp.Persistance.Context;

internal class CommunityRepository : ICommunityRepository
{
    private readonly DataContext _context;

    public CommunityRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddAsync(string name, string description)
    {
        await _context.Communities.AddAsync(new Community
        {
            Name = name,
            Description = description
        });

        await _context.SaveChangesAsync();
    }

    public async Task<List<Community>> GetAsync()
    {
        return await _context.Communities
            .Include(c => c.Users)
            .ToListAsync();
    }

    public async Task<Community> GetCommunityByIdAsync(int id)
    {
        return await _context.Communities
            .Include(c => c.Users)
            .Where(c => c.Id == id)
            .SingleOrDefaultAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
