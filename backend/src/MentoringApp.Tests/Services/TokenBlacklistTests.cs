using System.Text;
using MentoringApp.Core.Services;
using Microsoft.Extensions.Caching.Distributed;
using NSubstitute;
using NUnit.Framework;

namespace MentoringApp.Tests.Services
{
    [TestFixture]
    public class TokenBlacklistServiceTests
    {
        private IDistributedCache _cache;
        private TokenBlacklistService _service;

        [SetUp]
        public void Setup()
        {
            _cache = Substitute.For<IDistributedCache>();
            _service = new TokenBlacklistService(_cache);
        }

        [Test]
        public async Task BlacklistTokenAsync_WhenExpirationIsInFuture_ShouldAddToCache()
        {
            var token = "valid-token-123";
            var expiration = DateTime.UtcNow.AddMinutes(15); // Future time

            await _service.BlacklistTokenAsync(token, expiration);

            // We verify SetAsync because SetStringAsync is an extension method that calls SetAsync
            await _cache.Received(1).SetAsync(
                $"blacklist:{token}",                          // Key
                Arg.Is<byte[]>(b => Encoding.UTF8.GetString(b) == "revoked"), // Value check
                Arg.Is<DistributedCacheEntryOptions>(opts => opts.AbsoluteExpiration == expiration), // Options check
                Arg.Any<CancellationToken>()                    // Token
            );
        }

        [Test]
        public async Task BlacklistTokenAsync_WhenTokenIsAlreadyExpired_ShouldNotAddToCache()
        {
            var token = "expired-token-456";
            var expiration = DateTime.UtcNow.AddMinutes(-1); // Past time

            // Act
            await _service.BlacklistTokenAsync(token, expiration);

            // Should verify that SetAsync was NEVER called
            await _cache.DidNotReceive().SetAsync(
                Arg.Any<string>(),
                Arg.Any<byte[]>(),
                Arg.Any<DistributedCacheEntryOptions>(),
                Arg.Any<CancellationToken>()
            );
        }

        [Test]
        public async Task IsTokenBlacklistedAsync_WhenTokenExistsInCache_ShouldReturnTrue()
        {
            var token = "blacklisted-token";
            var cacheKey = $"blacklist:{token}";
            var cachedValue = Encoding.UTF8.GetBytes("revoked");

            // Mock GetAsync to return bytes (simulating cache hit)
            _cache.GetAsync(cacheKey, Arg.Any<CancellationToken>())
                  .Returns(cachedValue);

            var result = await _service.IsTokenBlacklistedAsync(token);

            Assert.That(result, Is.True);
            await _cache.Received(1).GetAsync(cacheKey, Arg.Any<CancellationToken>());
        }

        [Test]
        public async Task IsTokenBlacklistedAsync_WhenTokenDoesNotExistInCache_ShouldReturnFalse()
        {
            var token = "clean-token";
            var cacheKey = $"blacklist:{token}";

            // Mock GetAsync to return null (simulating cache miss)
            _cache.GetAsync(cacheKey, Arg.Any<CancellationToken>())
                  .Returns((byte[]?)null);

            var result = await _service.IsTokenBlacklistedAsync(token);

            Assert.That(result, Is.False);
        }
    }
}