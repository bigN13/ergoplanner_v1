using System;
using System.Threading;
using System.Threading.Tasks;

namespace Ergoplanner.Application.Common.Interfaces;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default) where T : class;
    Task<bool> RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
    Task<T?> GetOrCreateAsync<T>(
        string key,
        Func<Task<T?>> factory,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default) where T : class;
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
}