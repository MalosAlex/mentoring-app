using MentoringApp.Core.Models;

namespace MentoringApp.Core.Abstractions;

public interface ICommentService
{
    Task<CommentResponse> AddAsync(AddCommentRequest request);
}