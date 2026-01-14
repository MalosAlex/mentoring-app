using MentoringApp.Core.Models;

namespace MentoringApp.Core.Abstractions;

public interface IPostService
{
    Task<PostResponse> CreateAsync(CreatePostRequest request);
    Task<GetPostsResponse> GetByCommunityAsync(int communityId, int pageNumber, int pageSize, int? currentUserId = null);
    Task<GetPostsResponse> GetByUserAsync(int userId, int pageNumber, int pageSize, int? currentUserId = null);
    Task<PostReactionResponse> ReactAsync(int postId, int userId, string reactionType);
    Task<PostCommentDto> CommentAsync(int postId, int userId, string content);
    Task<CommentReactionResponse> ReactToCommentAsync(int commentId, int userId, string reactionType);
}

