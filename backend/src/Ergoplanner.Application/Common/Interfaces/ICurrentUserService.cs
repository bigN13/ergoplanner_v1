using System.Collections.Generic;

namespace Ergoplanner.Application.Common.Interfaces;

/// <summary>
/// Service for accessing current user information
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Get the current user's ID
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// Get the current user's email
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Get the current user's username
    /// </summary>
    string? UserName { get; }

    /// <summary>
    /// Get the current user's roles
    /// </summary>
    IEnumerable<string> Roles { get; }

    /// <summary>
    /// Check if the current user is authenticated
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Check if the current user has a specific role
    /// </summary>
    bool IsInRole(string role);

    /// <summary>
    /// Get a specific claim value for the current user
    /// </summary>
    string? GetClaimValue(string claimType);
}