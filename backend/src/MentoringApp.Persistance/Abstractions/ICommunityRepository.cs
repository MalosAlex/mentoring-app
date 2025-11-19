using MentoringApp.Persistance.Entities;

namespace MentoringApp.Persistance.Abstractions;

public interface ICommunityRepository
{
    Task AddAsync(string name, string description);
    Task<List<Community>> GetAsync();
    Task<Community> GetCommunityByIdAsync(int id);
    Task SaveChangesAsync();
}
