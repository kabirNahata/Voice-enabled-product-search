using Domain.Entities;

namespace Domain.Interfaces;

public interface ISessionService
{
    Task<IEnumerable<Session>> GetAllSessionsAsync();
    Task<Session?> GetSessionByIdAsync(Guid id);
    Task<Session> CreateSessionAsync(string name);
    Task DeleteSessionAsync(Guid id);
}