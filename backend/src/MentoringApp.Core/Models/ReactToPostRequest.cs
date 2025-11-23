namespace MentoringApp.Core.Models;

public class ReactToPostRequest
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = "like";
}