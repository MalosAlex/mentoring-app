using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;
using Microsoft.EntityFrameworkCore;

namespace MentoringApp.Persistance.Context;

internal class ReactionRepository : IReactionRepository
{
    private readonly DataContext _context;
    public ReactionRepository(DataContext context) => _context = context;

    public async Task<Reaction?> GetByPostAndUserAsync(int postId, int userId)
        => await _context.Reactions.FirstOrDefaultAsync(r => r.PostId == postId && r.UserId == userId);

    public async Task<int> CountByPostAsync(int postId)
        => await _context.Reactions.CountAsync(r => r.PostId == postId);

    public async Task AddAsync(Reaction reaction)
    {
        await _context.Reactions.AddAsync(reaction);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Reaction reaction)
    {
        _context.Reactions.Update(reaction);
        await _context.SaveChangesAsync();
    }
}