using MentoringApp.Core.Abstractions;
using Microsoft.Extensions.Caching.Distributed;

namespace MentoringApp.Core.Services;

public class TokenBlacklistService : ITokenBlacklistService
{
    private readonly IDistributedCache _cache;

    public TokenBlacklistService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task BlacklistTokenAsync(string token, DateTime expiration)
    {
        var timeToLive = expiration - DateTime.UtcNow;
        if (timeToLive.TotalSeconds > 0)
        {
            await _cache.SetStringAsync(
                $"blacklist:{token}",
                "revoked",
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpiration = expiration
                });
        }
    }

    public async Task<bool> IsTokenBlacklistedAsync(string token)
    {
        var value = await _cache.GetStringAsync($"blacklist:{token}");
        return value != null;
    }
}