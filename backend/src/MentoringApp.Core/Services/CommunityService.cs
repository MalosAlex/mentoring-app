using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Persistance.Abstractions;

namespace MentoringApp.Core.Services;

internal class CommunityService : ICommunityService
{
    private readonly ICommunityRepository _communityRepository;
    private readonly IUserRepository _userRepository;

    public CommunityService(ICommunityRepository communityRepository, IUserRepository userRepository)
    {
        _communityRepository = communityRepository;
        _userRepository = userRepository;
    }

    public async Task AddAsync(AddCommunityRequest request)
    {
        await _communityRepository.AddAsync(request.Name, request.Description);
    }

    public async Task<GetCommunitiesResponse> GetAllAsync()
    {
        var communities = await _communityRepository.GetAsync();

        return new GetCommunitiesResponse
        {
            Communities = communities.Select(c => c.ToModel()).ToList()
        };
    }

    public async Task Join(int communityId, int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);

        var communtiies = await _communityRepository.GetCommunityByIdAsync(communityId);

        communtiies.Users.Add(user);

        await _communityRepository.SaveChangesAsync();
    }

    public async Task Leave(int communityId, int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);

        var communtiies = await _communityRepository.GetCommunityByIdAsync(communityId);

        communtiies.Users.Remove(user);

        await _communityRepository.SaveChangesAsync();
    }
}
