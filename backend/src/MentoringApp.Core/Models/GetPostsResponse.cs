namespace MentoringApp.Core.Models;

public class GetPostsResponse
{
    public List<PostResponse> Posts { get; set; } = new();
    public int PageNumber { get; set; }
    public bool HasMore { get; set; }
}

