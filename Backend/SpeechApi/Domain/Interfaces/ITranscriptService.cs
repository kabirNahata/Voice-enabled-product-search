using Domain.Entities;

namespace Domain.Interfaces;

public interface ITranscriptService
{
    Task<IEnumerable<Transcript>> GetBySessionIdAsync(Guid sessionId);
    Task<Transcript> CreateTranscriptAsync(Transcript transcript);
    Task DeleteTranscriptAsync(Guid id);
}