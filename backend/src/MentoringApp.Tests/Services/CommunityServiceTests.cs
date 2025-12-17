
using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Core.Services;
using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;
using NSubstitute;
using User = MentoringApp.Persistance.Entities.User;

namespace MentoringApp.Tests.Services
{
    [TestFixture]
    public class CommunityServiceTests
    {
        private ICommunityRepository _communityRepository;
        private IUserRepository _userRepository;
        private ICommunityService _communityService;

        [SetUp]
        public void Setup()
        {
            _communityRepository = Substitute.For<ICommunityRepository>();
            _userRepository = Substitute.For<IUserRepository>();
            _communityService = new CommunityService(_communityRepository, _userRepository);
        }

        // -------------------------
        // AddAsync
        // -------------------------

        [Test]
        public async Task AddAsync_WhenCalled_ShouldCallRepositoryAdd()
        {
            var request = new AddCommunityRequest
            {
                Name = "Test Community",
                Description = "Test Description"
            };

            await _communityService.AddAsync(request);

            await _communityRepository.Received(1)
                .AddAsync(request.Name, request.Description);
        }

        // -------------------------
        // GetAllAsync
        // -------------------------

        [Test]
        public async Task GetAllAsync_WhenCalled_ShouldReturnCommunities()
        {
            var communities = new List<Community>
            {
                new Community { Id = 1, Name = "C1" }
            };

            var communitiesResponse = new List<CommunityResponse>
            {
                new CommunityResponse { Name = "C1" }
            };

            _communityRepository.GetAsync().Returns(communities);

            var result = await _communityService.GetAllAsync(0);

            Assert.That(result.Communities.First().Name, Is.EqualTo(communities.First().Name));
        }

        // -------------------------
        // Join
        // -------------------------

        [Test]
        public async Task Join_WhenUserAndCommunityExist_ShouldAddUserToCommunity()
        {
            // Arrange
            var user = new User { Id = 10 };
            var community = new Community
            {
                Id = 1,
                Users = new List<User>()
            };

            _userRepository.GetUserByIdAsync(10).Returns(user);
            _communityRepository.GetCommunityByIdAsync(1).Returns(community);

            // Act
            await _communityService.Join(1, 10);

            // Assert
            Assert.That(community.Users.Contains(user), Is.True);

            await _communityRepository.Received(1).SaveChangesAsync();
        }

        // -------------------------
        // Leave
        // -------------------------

        [Test]
        public async Task Leave_WhenUserIsInCommunity_ShouldRemoveUser()
        {
            // Arrange
            var user = new User { Id = 10 };
            var community = new Community
            {
                Id = 1,
                Users = new List<User> { user }
            };

            _userRepository.GetUserByIdAsync(10).Returns(user);
            _communityRepository.GetCommunityByIdAsync(1).Returns(community);

            // Act
            await _communityService.Leave(1, 10);

            // Assert
            Assert.That(community.Users.Contains(user), Is.False);

            await _communityRepository.Received(1).SaveChangesAsync();
        }
    }
}
