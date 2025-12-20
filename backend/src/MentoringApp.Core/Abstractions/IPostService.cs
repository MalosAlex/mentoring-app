using MentoringApp.Core.Models;

namespace MentoringApp.Core.Abstractions;

public interface IPostService
{
    Task<PostResponse> CreateAsync(CreatePostRequest request);
    Task<GetPostsResponse> GetByCommunityAsync(int communityId, int pageNumber, int pageSize);
    Task<GetPostsResponse> GetByUserAsync(int userId, int pageNumber, int pageSize);
    Task<PostReactionResponse> ReactAsync(int postId, int userId, string reactionType);
    Task<PostCommentDto> CommentAsync(int postId, int userId, string content);
}

