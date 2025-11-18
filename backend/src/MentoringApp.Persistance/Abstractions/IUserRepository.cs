using MentoringApp.Persistance.Entities;

namespace MentoringApp.Persistance.Abstractions;

public interface IUserRepository
{
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByUsernameAsync(string username);
    Task AddUserAsync(User user);
}