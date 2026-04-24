using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TranscriptRepository(AppDbContext db) : ITranscriptRepository
{
    public async Task<IEnumerable<Transcript>> GetBySessionIdAsync(Guid sessionId)
    {
        return await db.Transcripts
            .AsNoTracking()
            .Where(t => t.SessionId == sessionId)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Transcript> CreateAsync(Transcript transcript)
    {
        db.Transcripts.Add(transcript);
        await db.SaveChangesAsync();
        return transcript;
    }

    public async Task DeleteAsync(Guid id)
    {
        await db.Transcripts
            .Where(t => t.Id == id)
            .ExecuteDeleteAsync();
    }
}