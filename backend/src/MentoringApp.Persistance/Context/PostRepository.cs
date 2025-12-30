using System.Linq;
using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;
using Microsoft.EntityFrameworkCore;

namespace MentoringApp.Persistance.Context;

internal class PostRepository : IPostRepository
{
    private readonly DataContext _context;

    public PostRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Post post)
    {
        await _context.Posts.AddAsync(post);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Post>> GetByCommunityIdAsync(int communityId, int skip, int take)
    {
        return await _context.Posts
            .AsNoTracking()
            .Where(p => p.CommunityId == communityId)
            .Include(p => p.User)
            .Include(p => p.Reactions)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<List<Post>> GetByUserIdAsync(int userId, int skip, int take)
    {
        return await _context.Posts
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .Include(p => p.User)
            .Include(p => p.Reactions)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<Post?> GetByIdAsync(int postId)
        => await _context.Posts.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == postId);

    public async Task<PostReaction?> GetReactionAsync(int postId, int userId)
        => await _context.PostReactions.FirstOrDefaultAsync(r => r.PostId == postId && r.UserId == userId);

    public async Task UpsertReactionAsync(PostReaction reaction)
    {
        var existing = await GetReactionAsync(reaction.PostId, reaction.UserId);
        if (existing is null)
        {
            await _context.PostReactions.AddAsync(reaction);
        }
        else
        {
            existing.ReactionType = reaction.ReactionType;
            existing.CreatedAt = reaction.CreatedAt;
            _context.PostReactions.Update(existing);
        }
        await _context.SaveChangesAsync();
    }

    public async Task<int> CountReactionsAsync(int postId)
        => await _context.PostReactions.CountAsync(r => r.PostId == postId);

    public async Task<PostComment> AddCommentAsync(PostComment comment)
    {
        await _context.PostComments.AddAsync(comment);
        await _context.SaveChangesAsync();
        return comment;
    }
}

