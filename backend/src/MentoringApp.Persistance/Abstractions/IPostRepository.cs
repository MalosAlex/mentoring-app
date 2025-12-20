using MentoringApp.Persistance.Entities;

namespace MentoringApp.Persistance.Abstractions;

public interface IPostRepository
{
    Task AddAsync(Post post);
    Task<List<Post>> GetByCommunityIdAsync(int communityId, int skip, int take);
    Task<List<Post>> GetByUserIdAsync(int userId, int skip, int take);

    Task<Post?> GetByIdAsync(int postId);
    Task<PostReaction?> GetReactionAsync(int postId, int userId);
    Task UpsertReactionAsync(PostReaction reaction);
    Task<int> CountReactionsAsync(int postId);
    Task<PostComment> AddCommentAsync(PostComment comment);
}

