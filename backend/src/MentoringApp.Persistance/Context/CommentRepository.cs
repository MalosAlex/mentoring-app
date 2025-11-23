using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;

namespace MentoringApp.Persistance.Context;

internal class CommentRepository : ICommentRepository
{
    private readonly DataContext _context;
    public CommentRepository(DataContext context) => _context = context;

    public async Task AddAsync(Comment comment)
    {
        await _context.Comments.AddAsync(comment);
        await _context.SaveChangesAsync();
    }
}