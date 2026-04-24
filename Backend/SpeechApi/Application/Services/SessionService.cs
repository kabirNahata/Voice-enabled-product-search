using Application.Common;
using Application.DTOs;
using Application.Mappers;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class SessionService(ISessionRepository sessionRepository) : ISessionService
{
    public async Task<IEnumerable<Session>> GetAllSessionsAsync()
    {
        return await sessionRepository.GetAllAsync();
    }

    public async Task<Session?> GetSessionByIdAsync(Guid id)
    {
        return await sessionRepository.GetByIdAsync(id);
    }

    public async Task<Session> CreateSessionAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new AppValidationException("Session name cannot be empty.");

        var session = new Session { Name = name.Trim() };
        return await sessionRepository.CreateAsync(session);
    }

    public async Task DeleteSessionAsync(Guid id)
    {
        var session = await sessionRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Session {id} not found.");

        await sessionRepository.DeleteAsync(id);
    }
}