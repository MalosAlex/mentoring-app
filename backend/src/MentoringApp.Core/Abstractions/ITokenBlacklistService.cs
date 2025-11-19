namespace MentoringApp.Core.Abstractions;

public interface ITokenBlacklistService
{
    Task BlacklistTokenAsync(string token, DateTime expiration);
    Task<bool> IsTokenBlacklistedAsync(string token);
}