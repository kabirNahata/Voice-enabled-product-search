using Application.DTOs;
using Application.Mappers;
using Application.Common;
using Domain.Interfaces;

namespace SpeechApi.Endpoints;

public static class SessionEndpoints
{
    public static void MapSessionEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/sessions").WithTags("Sessions");

        group.MapGet("/", async (ISessionService service) =>
        {
            var sessions = await service.GetAllSessionsAsync();
            return Results.Ok(sessions.Select(SessionMapper.ToResponse));
        });

        group.MapGet("/{id:guid}", async (Guid id, ISessionService service) =>
        {
            var session = await service.GetSessionByIdAsync(id);
            return session is null
                ? Results.NotFound()
                : Results.Ok(SessionMapper.ToResponse(session));
        });

        group.MapPost("/", async (CreateSessionRequest request, ISessionService service) =>
        {
            try
            {
                var session = await service.CreateSessionAsync(request.Name);
                var response = SessionMapper.ToResponse(session);
                return Results.Created($"/api/sessions/{session.Id}", response);
            }
            catch (AppValidationException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });

        group.MapDelete("/{id:guid}", async (Guid id, ISessionService service) =>
        {
            try
            {
                await service.DeleteSessionAsync(id);
                return Results.NoContent();
            }
            catch (NotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
        });
    }
}