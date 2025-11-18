using MentoringApp.Core.Models;

namespace MentoringApp.Core.Abstractions;

public interface IUserService
{
    Task RegisterUserAsync(RegisterRequest request);
}