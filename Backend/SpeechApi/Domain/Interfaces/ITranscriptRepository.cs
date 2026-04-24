using Domain.Entities;

namespace Domain.Interfaces;

public interface ITranscriptRepository
{
    Task<IEnumerable<Transcript>> GetBySessionIdAsync(Guid sessionId);
    Task<Transcript> CreateAsync(Transcript transcript);
    Task DeleteAsync(Guid id);
}