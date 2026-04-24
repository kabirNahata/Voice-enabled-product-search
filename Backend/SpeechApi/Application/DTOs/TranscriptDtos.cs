namespace Application.DTOs;

public record CreateTranscriptRequest(
    Guid SessionId,
    string Text,
    string Type,
    string? Language,
    float? Confidence
);

public record TranscriptResponse(
    Guid Id,
    Guid SessionId,
    string Text,
    string Type,
    string? Language,
    float? Confidence,
    DateTime CreatedAt
);