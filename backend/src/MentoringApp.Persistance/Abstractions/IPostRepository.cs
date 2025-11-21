using MentoringApp.Persistance.Entities;

namespace MentoringApp.Persistance.Abstractions;

public interface IPostRepository
{
    Task AddAsync(Post post);
    Task<List<Post>> GetByCommunityIdAsync(int communityId, int skip, int take);
}

