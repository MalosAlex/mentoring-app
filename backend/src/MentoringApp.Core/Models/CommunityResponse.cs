namespace MentoringApp.Core.Models;

public class CommunityResponse
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsJoined { get; set; }
    public int memberCount { get; set; }
}
