namespace MentoringApp.Persistance.Entities;

public class User
{
    public int Id {get; set;}
    public string FullName {get; set;}
    public string Username {get; set;}
    public string Email {get; set;}
    public string PasswordHash {get; set;}

    public List<Community> Communities { get; set; } = new();
    public List<Post> Posts { get; set; } = new();
}