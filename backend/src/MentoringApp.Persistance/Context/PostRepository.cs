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
        var posts = await _context.Posts
            .AsNoTracking()
            .Where(p => p.CommunityId == communityId)
            .Include(p => p.User)
            .Include(p => p.Reactions)
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        if (posts.Any())
        {
            var postIds = posts.Select(p => p.Id).ToList();
            var comments = await _context.PostComments
                .AsNoTracking()
                .Where(c => postIds.Contains(c.PostId))
                .Include(c => c.User)
                .Include(c => c.Reactions)
                .ToListAsync();

            foreach (var post in posts)
            {
                post.Comments = comments.Where(c => c.PostId == post.Id).ToList();
            }
        }

        return posts;
    }

    public async Task<Post?> GetByIdAsync(int postId)
    {
        var post = await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Reactions)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post != null)
        {
            post.Comments = await _context.PostComments
                .Where(c => c.PostId == postId)
                .Include(c => c.User)
                .Include(c => c.Reactions)
                .ToListAsync();
        }

        return post;
    }

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

    public async Task DeleteReactionAsync(PostReaction reaction)
    {
        _context.PostReactions.Remove(reaction);
        await _context.SaveChangesAsync();
    }

    public async Task<int> CountReactionsAsync(int postId)
        => await _context.PostReactions.CountAsync(r => r.PostId == postId);

    public async Task<PostComment?> GetCommentByIdAsync(int commentId)
        => await _context.PostComments.FirstOrDefaultAsync(c => c.Id == commentId);

    public async Task<CommentReaction?> GetCommentReactionAsync(int commentId, int userId)
        => await _context.CommentReactions.FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

    public async Task UpsertCommentReactionAsync(CommentReaction reaction)
    {
        var existing = await GetCommentReactionAsync(reaction.CommentId, reaction.UserId);
        if (existing is null)
        {
            await _context.CommentReactions.AddAsync(reaction);
        }
        else
        {
            existing.ReactionType = reaction.ReactionType;
            existing.CreatedAt = reaction.CreatedAt;
            _context.CommentReactions.Update(existing);
        }
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCommentReactionAsync(CommentReaction reaction)
    {
        _context.CommentReactions.Remove(reaction);
        await _context.SaveChangesAsync();
    }

    public async Task<int> CountCommentReactionsAsync(int commentId)
        => await _context.CommentReactions.CountAsync(r => r.CommentId == commentId);

    public async Task<PostComment> AddCommentAsync(PostComment comment)
    {
        await _context.PostComments.AddAsync(comment);
        await _context.SaveChangesAsync();
        return comment;
    }
}
