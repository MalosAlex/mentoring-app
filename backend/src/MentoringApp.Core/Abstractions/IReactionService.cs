using MentoringApp.Core.Models;

namespace MentoringApp.Core.Abstractions;

public interface IReactionService
{
    Task<PostReactionResponse> ReactAsync(ReactToPostRequest request);
}