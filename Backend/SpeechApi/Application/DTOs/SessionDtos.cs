namespace Application.DTOs;

public record CreateSessionRequest(string Name);

public record SessionResponse(
    Guid Id,
    string Name,
    DateTime CreatedAt,
    IEnumerable<TranscriptResponse>? Transcripts = null
);