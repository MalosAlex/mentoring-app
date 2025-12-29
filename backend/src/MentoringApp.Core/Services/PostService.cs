using System;
using System.Linq;
using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;

namespace MentoringApp.Core.Services;

internal class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly IUserRepository _userRepository;

    public PostService(
        IPostRepository postRepository,
        ICommunityRepository communityRepository,
        IUserRepository userRepository)
    {
        _postRepository = postRepository;
        _communityRepository = communityRepository;
        _userRepository = userRepository;
    }

    public async Task<PostResponse> CreateAsync(CreatePostRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.Caption))
        {
            throw new ArgumentException("Caption is required", nameof(request.Caption));
        }

        var community = await _communityRepository.GetCommunityByIdAsync(request.CommunityId)
            ?? throw new ArgumentException("Community not found", nameof(request.CommunityId));

        var user = await _userRepository.GetUserByIdAsync(request.UserId)
            ?? throw new ArgumentException("User not found", nameof(request.UserId));

        var isMember = community.Users?.Any(u => u.Id == request.UserId) ?? false;
        if (!isMember)
        {
            throw new InvalidOperationException("User must join the community before posting.");
        }

        var post = new Post
        {
            CommunityId = request.CommunityId,
            UserId = request.UserId,
            Caption = request.Caption.Trim(),
            MediaUrl = request.MediaUrl,
            CreatedAt = DateTime.UtcNow
        };

        await _postRepository.AddAsync(post);
        post.User = user;

        return post.ToModel();
    }

    public async Task<GetPostsResponse> GetByCommunityAsync(int communityId, int pageNumber, int pageSize)
    {
        if (pageNumber < 1)
        {
            throw new ArgumentException("Page number must be at least 1.", nameof(pageNumber));
        }

        if (pageSize is < 1 or > 50)
        {
            throw new ArgumentException("Page size must be between 1 and 50.", nameof(pageSize));
        }

        _ = await _communityRepository.GetCommunityByIdAsync(communityId)
            ?? throw new ArgumentException("Community not found", nameof(communityId));

        var skip = (pageNumber - 1) * pageSize;
        var posts = await _postRepository.GetByCommunityIdAsync(communityId, skip, pageSize + 1);

        var hasMore = posts.Count > pageSize;
        if (hasMore)
        {
            posts = posts.Take(pageSize).ToList();
        }

        return new GetPostsResponse
        {
            Posts = posts.Select(p => p.ToModel()).ToList(),
            PageNumber = pageNumber,
            HasMore = hasMore
        };
    }

    public async Task<GetPostsResponse> GetByUserAsync(int userId, int pageNumber, int pageSize)
    {
        if (pageNumber < 1)
        {
            throw new ArgumentException("Page number must be at least 1.", nameof(pageNumber));
        }

        if (pageSize is < 1 or > 50)
        {
            throw new ArgumentException("Page size must be between 1 and 50.", nameof(pageSize));
        }

        _ = await _userRepository.GetUserByIdAsync(userId)
            ?? throw new ArgumentException("Community not found", nameof(userId));

        var skip = (pageNumber - 1) * pageSize;
        var posts = await _postRepository.GetByUserIdAsync(userId, skip, pageSize + 1);

        var hasMore = posts.Count > pageSize;
        if (hasMore)
        {
            posts = posts.Take(pageSize).ToList();
        }

        return new GetPostsResponse
        {
            Posts = posts.Select(p => p.ToModel()).ToList(),
            PageNumber = pageNumber,
            HasMore = hasMore
        };
    }

    public async Task<PostReactionResponse> ReactAsync(int postId, int userId, string reactionType)
    {
        if (string.IsNullOrWhiteSpace(reactionType))
            throw new ArgumentException("Reaction type required", nameof(reactionType));

        var post = await _postRepository.GetByIdAsync(postId) ?? throw new ArgumentException("Post not found", nameof(postId));
        var user = await _userRepository.GetUserByIdAsync(userId) ?? throw new ArgumentException("User not found", nameof(userId));

        var reaction = new PostReaction
        {
            PostId = postId,
            UserId = userId,
            ReactionType = reactionType.Trim().ToLowerInvariant(),
            CreatedAt = DateTime.UtcNow
        };

        await _postRepository.UpsertReactionAsync(reaction);
        var total = await _postRepository.CountReactionsAsync(postId);

        return new PostReactionResponse
        {
            PostId = postId,
            UserId = userId,
            ReactionType = reaction.ReactionType,
            CreatedAt = reaction.CreatedAt,
            TotalReactions = total
        };
    }

    public async Task<PostCommentDto> CommentAsync(int postId, int userId, string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Content required", nameof(content));

        if (content.Length > 1000)
            throw new ArgumentException("Content too long", nameof(content));

        var post = await _postRepository.GetByIdAsync(postId) ?? throw new ArgumentException("Post not found", nameof(postId));
        var user = await _userRepository.GetUserByIdAsync(userId) ?? throw new ArgumentException("User not found", nameof(userId));

        var comment = new PostComment
        {
            PostId = postId,
            UserId = userId,
            Content = content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        comment = await _postRepository.AddCommentAsync(comment);

        return new PostCommentDto
        {
            Id = comment.Id,
            PostId = postId,
            UserId = userId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            AuthorName = user.FullName ?? user.Username
        };
    }
}

