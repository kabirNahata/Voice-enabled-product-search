using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class SessionRepository(AppDbContext db) : ISessionRepository
{
    public async Task<IEnumerable<Session>> GetAllAsync()
    {
        return await db.Sessions
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<Session?> GetByIdAsync(Guid id)
    {
        return await db.Sessions
            .Include(s => s.Transcripts
                .OrderBy(t => t.CreatedAt))
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Session> CreateAsync(Session session)
    {
        db.Sessions.Add(session);
        await db.SaveChangesAsync();
        return session;
    }

    public async Task DeleteAsync(Guid id)
    {
        await db.Sessions
            .Where(s => s.Id == id)
            .ExecuteDeleteAsync();
    }
}