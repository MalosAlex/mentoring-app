namespace MentoringApp.Core.Models;

public class AddCommentRequest
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Text { get; set; } = string.Empty;
}