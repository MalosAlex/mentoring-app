using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Core.Services;
using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;
using NSubstitute;
using NUnit.Framework;
using User = MentoringApp.Persistance.Entities.User;

namespace MentoringApp.Tests.Services
{
    [TestFixture]
    public class PostServiceTests
    {
        private IPostRepository _postRepository;
        private ICommunityRepository _communityRepository;
        private IUserRepository _userRepository;
        private IPostService _postService;

        [SetUp]
        public void Setup()
        {
            _postRepository = Substitute.For<IPostRepository>();
            _communityRepository = Substitute.For<ICommunityRepository>();
            _userRepository = Substitute.For<IUserRepository>();

            _postService = new PostService(
                _postRepository,
                _communityRepository,
                _userRepository);
        }

        // -------------------------
        // CreateAsync
        // -------------------------

        [Test]
        public async Task CreateAsync_ValidRequest_CreatesPostAndReturnsResponse()
        {
            var communityId = 1;
            var userId = 2;
            var caption = "  Test caption  ";
            var trimmedCaption = caption.Trim();
            var mediaUrl = "/uploads/image.png";

            var request = new CreatePostRequest
            {
                CommunityId = communityId,
                UserId = userId,
                Caption = caption,
                MediaUrl = mediaUrl
            };

            var user = new User
            {
                Id = userId,
                Username = "testuser",
                FullName = "Test User"
            };

            var community = new Community
            {
                Id = communityId,
                Name = "Test Community",
                Description = "Description",
                Users = new List<User> { user }
            };

            _communityRepository.GetCommunityByIdAsync(communityId)
                .Returns(community);

            _userRepository.GetUserByIdAsync(userId)
                .Returns(user);

            Post? savedPost = null;

            _postRepository
                .When(r => r.AddAsync(Arg.Any<Post>()))
                .Do(callInfo =>
                {
                    savedPost = callInfo.Arg<Post>();
                    savedPost!.Id = 10;
                    savedPost.CreatedAt = DateTime.UtcNow;
                });

            var response = await _postService.CreateAsync(request);

            await _postRepository.Received(1)
                .AddAsync(Arg.Any<Post>());

            Assert.That(savedPost, Is.Not.Null);
            Assert.That(savedPost!.CommunityId, Is.EqualTo(communityId));
            Assert.That(savedPost.UserId, Is.EqualTo(userId));
            Assert.That(savedPost.Caption, Is.EqualTo(trimmedCaption));
            Assert.That(savedPost.MediaUrl, Is.EqualTo(mediaUrl));

            Assert.That(response.Id, Is.EqualTo(savedPost.Id));
            Assert.That(response.CommunityId, Is.EqualTo(communityId));
            Assert.That(response.UserId, Is.EqualTo(userId));
            Assert.That(response.Caption, Is.EqualTo(trimmedCaption));
            Assert.That(response.MediaUrl, Is.EqualTo(mediaUrl));
            Assert.That(response.AuthorName, Is.EqualTo(user.FullName));
        }

        [Test]
        public void CreateAsync_NullRequest_ThrowsArgumentNullException()
        {
            CreatePostRequest request = null;

            Assert.ThrowsAsync<ArgumentNullException>(
                async () => await _postService.CreateAsync(request!));
        }

        [TestCase("")]
        [TestCase("   ")]
        public void CreateAsync_EmptyCaption_ThrowsArgumentException(string caption)
        {
            var request = new CreatePostRequest
            {
                CommunityId = 1,
                UserId = 1,
                Caption = caption
            };

            var exception = Assert.ThrowsAsync<ArgumentException>(
            async () => await _postService.CreateAsync(request));

            Assert.That(exception, Is.Not.Null);
            Assert.That(exception!.Message, Does.StartWith("Caption is required"));
            Assert.That(exception.ParamName, Is.EqualTo("Caption"));

        }

        [Test]
        public void CreateAsync_CommunityNotFound_ThrowsArgumentException()
        {
            var request = new CreatePostRequest
            {
                CommunityId = 123,
                UserId = 1,
                Caption = "Valid caption"
            };

            _communityRepository.GetCommunityByIdAsync(request.CommunityId)
                .Returns((Community?)null);

            var exception = Assert.ThrowsAsync<ArgumentException>(
                async () => await _postService.CreateAsync(request));

            Assert.That(exception, Is.Not.Null);
            Assert.That(exception!.Message, Does.StartWith("Community not found"));
            Assert.That(exception.ParamName, Is.EqualTo("CommunityId"));

        }

        [Test]
        public void CreateAsync_UserNotFound_ThrowsArgumentException()
        {
            var request = new CreatePostRequest
            {
                CommunityId = 1,
                UserId = 99,
                Caption = "Valid caption"
            };

            var community = new Community
            {
                Id = request.CommunityId,
                Name = "Test",
                Description = "Test",
                Users = new List<User>()
            };

            _communityRepository.GetCommunityByIdAsync(request.CommunityId)
                .Returns(community);

            _userRepository.GetUserByIdAsync(request.UserId)
                .Returns((User?)null);

            var exception = Assert.ThrowsAsync<ArgumentException>(
                async () => await _postService.CreateAsync(request));

            Assert.That(exception, Is.Not.Null);
            Assert.That(exception!.Message, Does.StartWith("User not found"));
            Assert.That(exception.ParamName, Is.EqualTo("UserId"));

        }

        [Test]
        public void CreateAsync_UserNotMember_ThrowsInvalidOperationException()
        {
            var request = new CreatePostRequest
            {
                CommunityId = 1,
                UserId = 2,
                Caption = "Valid caption"
            };

            var communityUser = new User { Id = 10 };

            var community = new Community
            {
                Id = request.CommunityId,
                Name = "Test",
                Description = "Test",
                Users = new List<User> { communityUser }
            };

            var user = new User { Id = request.UserId, Username = "outsider" };

            _communityRepository.GetCommunityByIdAsync(request.CommunityId)
                .Returns(community);

            _userRepository.GetUserByIdAsync(request.UserId)
                .Returns(user);

            var exception = Assert.ThrowsAsync<InvalidOperationException>(
                async () => await _postService.CreateAsync(request));

            Assert.That(
                exception!.Message,
                Is.EqualTo("User must join the community before posting."));
        }

        // -------------------------
        // GetByCommunityAsync
        // -------------------------

        [TestCase(0)]
        [TestCase(-1)]
        public void GetByCommunityAsync_InvalidPageNumber_ThrowsArgumentException(int pageNumber)
        {
            var exception = Assert.ThrowsAsync<ArgumentException>(
                async () => await _postService.GetByCommunityAsync(1, pageNumber, 10));

            Assert.That(exception, Is.Not.Null);
            Assert.That(
                exception!.Message,
                Does.StartWith("Page number must be at least 1."));
            Assert.That(exception.ParamName, Is.EqualTo("pageNumber"));

        }

        [TestCase(0)]
        [TestCase(51)]
        public void GetByCommunityAsync_InvalidPageSize_ThrowsArgumentException(int pageSize)
        {
            var exception = Assert.ThrowsAsync<ArgumentException>(
                async () => await _postService.GetByCommunityAsync(1, 1, pageSize));

            Assert.That(exception, Is.Not.Null);
            Assert.That(
                exception!.Message,
                Does.StartWith("Page size must be between 1 and 50."));
            Assert.That(exception.ParamName, Is.EqualTo("pageSize"));

        }

        [Test]
        public void GetByCommunityAsync_CommunityNotFound_ThrowsArgumentException()
        {
            _communityRepository.GetCommunityByIdAsync(Arg.Any<int>())
                .Returns((Community?)null);

            var exception = Assert.ThrowsAsync<ArgumentException>(
                async () => await _postService.GetByCommunityAsync(1, 1, 10));

            Assert.That(exception, Is.Not.Null);
            Assert.That(exception!.Message, Does.StartWith("Community not found"));
            Assert.That(exception.ParamName, Is.EqualTo("communityId"));

        }

        [Test]
        public async Task GetByCommunityAsync_NoMorePages_ReturnsPostsAndHasMoreFalse()
        {
            var communityId = 1;
            var pageNumber = 2;
            var pageSize = 2;
            var expectedSkip = (pageNumber - 1) * pageSize;
            var expectedTake = pageSize + 1;

            var user = new User
            {
                Id = 5,
                FullName = "Author Name",
                Username = "author"
            };

            var community = new Community
            {
                Id = communityId,
                Name = "Community",
                Description = "Desc"
            };

            var createdAt = DateTime.UtcNow;

            var posts = new List<Post>
            {
                new Post
                {
                    Id = 1,
                    CommunityId = communityId,
                    UserId = user.Id,
                    User = user,
                    Caption = "Caption 1",
                    CreatedAt = createdAt
                },
                new Post
                {
                    Id = 2,
                    CommunityId = communityId,
                    UserId = user.Id,
                    User = user,
                    Caption = "Caption 2",
                    CreatedAt = createdAt.AddMinutes(-1)
                }
            };

            _communityRepository.GetCommunityByIdAsync(communityId)
                .Returns(community);

            _postRepository.GetByCommunityIdAsync(
                    communityId,
                    expectedSkip,
                    expectedTake)
                .Returns(posts);

            var result = await _postService.GetByCommunityAsync(communityId, pageNumber, pageSize);

            await _postRepository.Received(1)
                .GetByCommunityIdAsync(communityId, expectedSkip, expectedTake);

            Assert.That(result.PageNumber, Is.EqualTo(pageNumber));
            Assert.That(result.HasMore, Is.False);
            Assert.That(result.Posts.Count, Is.EqualTo(posts.Count));

            for (var index = 0; index < posts.Count; index++)
            {
                var entity = posts[index];
                var model = result.Posts[index];

                Assert.That(model.Id, Is.EqualTo(entity.Id));
                Assert.That(model.CommunityId, Is.EqualTo(entity.CommunityId));
                Assert.That(model.UserId, Is.EqualTo(entity.UserId));
                Assert.That(model.Caption, Is.EqualTo(entity.Caption));
                Assert.That(model.CreatedAt, Is.EqualTo(entity.CreatedAt));
                Assert.That(model.AuthorName, Is.EqualTo(user.FullName));
            }
        }

        [Test]
        public async Task GetByCommunityAsync_HasMorePages_TrimsToPageSizeAndSetsHasMoreTrue()
        {
            var communityId = 1;
            var pageNumber = 1;
            var pageSize = 2;
            var expectedSkip = 0;
            var expectedTake = pageSize + 1;

            var user = new User
            {
                Id = 5,
                FullName = "Author Name",
                Username = "author"
            };

            var community = new Community
            {
                Id = communityId,
                Name = "Community",
                Description = "Desc"
            };

            var createdAt = DateTime.UtcNow;

            var posts = new List<Post>
            {
                new Post { Id = 1, CommunityId = communityId, UserId = user.Id, User = user, Caption = "Caption 1", CreatedAt = createdAt },
                new Post { Id = 2, CommunityId = communityId, UserId = user.Id, User = user, Caption = "Caption 2", CreatedAt = createdAt.AddMinutes(-1) },
                new Post { Id = 3, CommunityId = communityId, UserId = user.Id, User = user, Caption = "Caption 3", CreatedAt = createdAt.AddMinutes(-2) }
            };

            _communityRepository.GetCommunityByIdAsync(communityId)
                .Returns(community);

            _postRepository.GetByCommunityIdAsync(
                    communityId,
                    expectedSkip,
                    expectedTake)
                .Returns(posts);

            var result = await _postService.GetByCommunityAsync(communityId, pageNumber, pageSize);

            Assert.That(result.PageNumber, Is.EqualTo(pageNumber));
            Assert.That(result.HasMore, Is.True);
            Assert.That(result.Posts.Count, Is.EqualTo(pageSize));

            Assert.That(result.Posts.Any(p => p.Id == 3), Is.False);
        }
    }
}
