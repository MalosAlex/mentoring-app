using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;

namespace MentoringApp.Core.Services;

internal class ReactionService : IReactionService
{
    private readonly IReactionRepository _reactionRepository;

    public ReactionService(IReactionRepository reactionRepository)
    {
        _reactionRepository = reactionRepository;
    }

    public async Task<PostReactionResponse> ReactAsync(ReactToPostRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (string.IsNullOrWhiteSpace(request.Type)) request.Type = "like";

        var existing = await _reactionRepository.GetByPostAndUserAsync(request.PostId, request.UserId);
        if (existing == null)
        {
            var reaction = new Reaction
            {
                PostId = request.PostId,
                UserId = request.UserId,
                Type = request.Type.Trim().ToLowerInvariant()
            };
            await _reactionRepository.AddAsync(reaction);
        }
        else
        {
            existing.Type = request.Type.Trim().ToLowerInvariant();
            await _reactionRepository.UpdateAsync(existing);
        }

        var total = await _reactionRepository.CountByPostAsync(request.PostId);
        return new PostReactionResponse
        {
            PostId = request.PostId,
            Type = request.Type.Trim().ToLowerInvariant(),
            TotalReactions = total
        };
    }
}