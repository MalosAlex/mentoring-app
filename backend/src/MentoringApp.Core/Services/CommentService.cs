using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;

namespace MentoringApp.Core.Services;

internal class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly IUserRepository _userRepository;

    public CommentService(ICommentRepository commentRepository, IUserRepository userRepository)
    {
        _commentRepository = commentRepository;
        _userRepository = userRepository;
    }

    public async Task<CommentResponse> AddAsync(AddCommentRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (string.IsNullOrWhiteSpace(request.Text)) throw new ArgumentException("Comment text required", nameof(request.Text));

        var user = await _userRepository.GetUserByIdAsync(request.UserId) ?? throw new ArgumentException("User not found", nameof(request.UserId));

        var comment = new Comment
        {
            PostId = request.PostId,
            UserId = request.UserId,
            Text = request.Text.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        await _commentRepository.AddAsync(comment);

        return new CommentResponse
        {
            Id = comment.Id,
            PostId = comment.PostId,
            UserId = comment.UserId,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt,
            AuthorName = user.FullName ?? user.Username
        };
    }
}