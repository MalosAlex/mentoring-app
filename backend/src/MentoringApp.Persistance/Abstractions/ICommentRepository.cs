using MentoringApp.Persistance.Entities;

namespace MentoringApp.Persistance.Abstractions;

public interface ICommentRepository
{
    Task AddAsync(Comment comment);
}