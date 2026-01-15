using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Persistance.Abstractions;
using static System.Net.Mime.MediaTypeNames;

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
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Community name is required", nameof(request.Name));
        }

        await _communityRepository.AddAsync(request.Name, request.Description);
    }

    public async Task<GetCommunitiesResponse> GetAllAsync(int? userId = null)
    {
        var communities = await _communityRepository.GetAsync();

        return new GetCommunitiesResponse
        {
            Communities = communities.Select(c => c.ToModel(userId)).ToList()
        };
    }

    public async Task Join(int communityId, int userId)
    {
        var community = await _communityRepository.GetCommunityByIdAsync(communityId);
        if (community == null) throw new ArgumentException("Community not found", nameof(communityId));

        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null) throw new ArgumentException("User not found", nameof(userId));

        if (community.Users.Any(u => u.Id == userId)) return;

        community.Users.Add(user);
        await _communityRepository.SaveChangesAsync();
    }

    public async Task Leave(int communityId, int userId)
    {
        var community = await _communityRepository.GetCommunityByIdAsync(communityId);
        if (community == null) throw new ArgumentException("Community not found", nameof(communityId));

        var user = community.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null) return;

        community.Users.Remove(user);
        await _communityRepository.SaveChangesAsync();
    }
}
