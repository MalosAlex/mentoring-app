using MentoringApp.Core.Models;

namespace MentoringApp.Core.Abstractions;

public interface ICommunityService
{
    Task AddAsync(AddCommunityRequest request);
    Task<GetCommunitiesResponse> GetAllAsync(int userId);
    Task Join(int communityId, int userId);
    Task Leave(int communityId, int userId);
}
