using MentoringApp.Persistance.Models;

namespace MentoringApp.Core.Models;

public class GetCatsResponse
{
    public List<CatResponse> Cats { get; set; }
}
