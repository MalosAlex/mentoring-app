using MentoringApp.Persistance.Models;

namespace MentoringApp.Persistance.Abstractions;

public interface ICatsRepository
{
    Task<List<CatResponse>> GetCats(int count);
}