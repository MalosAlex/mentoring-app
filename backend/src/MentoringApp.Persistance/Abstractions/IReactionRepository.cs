using MentoringApp.Persistance.Entities;

namespace MentoringApp.Persistance.Abstractions;

public interface IReactionRepository
{
    Task<Reaction?> GetByPostAndUserAsync(int postId, int userId);
    Task<int> CountByPostAsync(int postId);
    Task AddAsync(Reaction reaction);
    Task UpdateAsync(Reaction reaction);
}