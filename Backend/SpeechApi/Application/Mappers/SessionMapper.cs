using Application.DTOs;
using Domain.Entities;

namespace Application.Mappers;

public static class SessionMapper
{
    public static SessionResponse ToResponse(Session session) =>
        new(
            session.Id,
            session.Name,
            session.CreatedAt,
            session.Transcripts?.Select(TranscriptMapper.ToResponse)
        );

    public static Session ToEntity(CreateSessionRequest request) =>
        new()
        {
            Name = request.Name,
        };
}