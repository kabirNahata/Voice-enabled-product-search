using Application.Common;
using Application.Mappers;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class TranscriptService(
    ITranscriptRepository transcriptRepository,
    ISessionRepository sessionRepository
) : ITranscriptService
{
    public async Task<IEnumerable<Transcript>> GetBySessionIdAsync(Guid sessionId)
    {
        return await transcriptRepository.GetBySessionIdAsync(sessionId);
    }

    public async Task<Transcript> CreateTranscriptAsync(Transcript transcript)
    {
        // Validate session exists
        var session = await sessionRepository.GetByIdAsync(transcript.SessionId)
            ?? throw new NotFoundException($"Session {transcript.SessionId} not found.");

        // Validate type
        if (transcript.Type is not ("stt" or "tts"))
            throw new AppValidationException("Type must be 'stt' or 'tts'.");

        return await transcriptRepository.CreateAsync(transcript);
    }

    public async Task DeleteTranscriptAsync(Guid id)
    {
        await transcriptRepository.DeleteAsync(id);
    }
}