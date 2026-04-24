using Application.DTOs;
using Domain.Entities;

namespace Application.Mappers;

public static class TranscriptMapper
{
    public static TranscriptResponse ToResponse(Transcript transcript) =>
        new(
            transcript.Id,
            transcript.SessionId,
            transcript.Text,
            transcript.Type,
            transcript.Language,
            transcript.Confidence,
            transcript.CreatedAt
        );

    public static Transcript ToEntity(CreateTranscriptRequest request) =>
        new()
        {
            SessionId = request.SessionId,
            Text = request.Text,
            Type = request.Type,
            Language = request.Language,
            Confidence = request.Confidence,
        };
}