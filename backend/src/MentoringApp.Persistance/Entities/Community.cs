namespace MentoringApp.Persistance.Entities;

public class Community
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public List<User> Users { get; set; }
}
