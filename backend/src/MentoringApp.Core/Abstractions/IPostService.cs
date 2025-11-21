using MentoringApp.Core.Models;

namespace MentoringApp.Core.Abstractions;

public interface IPostService
{
    Task<PostResponse> CreateAsync(CreatePostRequest request);
    Task<GetPostsResponse> GetByCommunityAsync(int communityId, int pageNumber, int pageSize);
}

