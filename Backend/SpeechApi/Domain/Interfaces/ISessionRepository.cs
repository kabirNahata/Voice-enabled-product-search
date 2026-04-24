using Domain.Entities;

namespace Domain.Interfaces;

public interface ISessionRepository
{
    Task<IEnumerable<Session>> GetAllAsync();
    Task<Session?> GetByIdAsync(Guid id);
    Task<Session> CreateAsync(Session session);
    Task DeleteAsync(Guid id);
}