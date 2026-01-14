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

        return post.ToModel(request.UserId);
    }

    public async Task<GetPostsResponse> GetByCommunityAsync(int communityId, int pageNumber, int pageSize, int? currentUserId = null)
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
            Posts = posts.Select(p => p.ToModel(currentUserId)).ToList(),
            PageNumber = pageNumber,
            HasMore = hasMore
        };
    }

    public async Task<PostResponse> GetByIdAsync(int postId, int? currentUserId = null)
    {
        var post = await _postRepository.GetByIdAsync(postId) 
            ?? throw new ArgumentException("Post not found", nameof(postId));

        return post.ToModel(currentUserId);
    }

    public async Task<PostReactionResponse> ReactAsync(int postId, int userId, string reactionType)
    {
        if (string.IsNullOrWhiteSpace(reactionType))
            throw new ArgumentException("Reaction type required", nameof(reactionType));

        var post = await _postRepository.GetByIdAsync(postId) ?? throw new ArgumentException("Post not found", nameof(postId));
        var user = await _userRepository.GetUserByIdAsync(userId) ?? throw new ArgumentException("User not found", nameof(userId));

        // Check if user is a member of the community
        var community = await _communityRepository.GetCommunityByIdAsync(post.CommunityId);
        var isMember = community?.Users?.Any(u => u.Id == userId) ?? false;
        if (!isMember)
        {
            throw new InvalidOperationException("User must join the community before reacting.");
        }

        var existing = await _postRepository.GetReactionAsync(postId, userId);
        bool isLikedNow;
        
        if (existing != null && existing.ReactionType.Equals(reactionType.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            // Toggle off if same reaction
            await _postRepository.DeleteReactionAsync(existing);
            isLikedNow = false;
        }
        else
        {
            var reaction = new PostReaction
            {
                PostId = postId,
                UserId = userId,
                ReactionType = reactionType.Trim().ToLowerInvariant(),
                CreatedAt = DateTime.UtcNow
            };
            await _postRepository.UpsertReactionAsync(reaction);
            isLikedNow = true;
        }

        var total = await _postRepository.CountReactionsAsync(postId);

        return new PostReactionResponse
        {
            PostId = postId,
            UserId = userId,
            ReactionType = reactionType.Trim().ToLowerInvariant(),
            CreatedAt = DateTime.UtcNow,
            TotalReactions = total,
            IsLiked = isLikedNow
        };
    }

    public async Task<PostReactionResponse> ReactToCommentAsync(int commentId, int userId, string reactionType)
    {
        if (string.IsNullOrWhiteSpace(reactionType))
            throw new ArgumentException("Reaction type required", nameof(reactionType));

        var comment = await _postRepository.GetCommentByIdAsync(commentId) ?? throw new ArgumentException("Comment not found", nameof(commentId));
        var user = await _userRepository.GetUserByIdAsync(userId) ?? throw new ArgumentException("User not found", nameof(userId));

        var existing = await _postRepository.GetCommentReactionAsync(commentId, userId);
        bool isLikedNow;
        
        if (existing != null && existing.ReactionType.Equals(reactionType.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            await _postRepository.DeleteCommentReactionAsync(existing);
            isLikedNow = false;
        }
        else
        {
            var reaction = new CommentReaction
            {
                CommentId = commentId,
                UserId = userId,
                ReactionType = reactionType.Trim().ToLowerInvariant(),
                CreatedAt = DateTime.UtcNow
            };
            await _postRepository.UpsertCommentReactionAsync(reaction);
            isLikedNow = true;
        }

        var total = await _postRepository.CountCommentReactionsAsync(commentId);

        return new PostReactionResponse
        {
            PostId = commentId, // Reusing PostReactionResponse for comment reactions
            UserId = userId,
            ReactionType = reactionType.Trim().ToLowerInvariant(),
            CreatedAt = DateTime.UtcNow,
            TotalReactions = total,
            IsLiked = isLikedNow
        };
    }

    public async Task<PostCommentDto> CommentAsync(int postId, int userId, string content, int? parentCommentId = null)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Content required", nameof(content));

        if (content.Length > 1000)
            throw new ArgumentException("Content too long", nameof(content));

        var post = await _postRepository.GetByIdAsync(postId) ?? throw new ArgumentException("Post not found", nameof(postId));
        var user = await _userRepository.GetUserByIdAsync(userId) ?? throw new ArgumentException("User not found", nameof(userId));

        // Check if user is a member of the community
        var community = await _communityRepository.GetCommunityByIdAsync(post.CommunityId);
        var isMember = community?.Users?.Any(u => u.Id == userId) ?? false;
        if (!isMember)
        {
            throw new InvalidOperationException("User must join the community before commenting.");
        }

        var comment = new PostComment
        {
            PostId = postId,
            UserId = userId,
            Content = content.Trim(),
            CreatedAt = DateTime.UtcNow,
            ParentCommentId = parentCommentId
        };

        comment = await _postRepository.AddCommentAsync(comment);

        return comment.ToDto();
    }
}

