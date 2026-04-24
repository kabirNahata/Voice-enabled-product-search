using Application.DTOs;
using Application.Mappers;
using Application.Common;
using Domain.Interfaces;

namespace SpeechApi.Endpoints;

public static class TranscriptEndpoints
{
    public static void MapTranscriptEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/transcripts").WithTags("Transcripts");

        group.MapGet("/session/{sessionId:guid}", async (Guid sessionId, ITranscriptService service) =>
        {
            var transcripts = await service.GetBySessionIdAsync(sessionId);
            return Results.Ok(transcripts.Select(TranscriptMapper.ToResponse));
        });

        group.MapPost("/", async (CreateTranscriptRequest request, ITranscriptService service) =>
        {
            try
            {
                var entity = TranscriptMapper.ToEntity(request);
                var saved = await service.CreateTranscriptAsync(entity);
                var response = TranscriptMapper.ToResponse(saved);
                return Results.Created($"/api/transcripts/{saved.Id}", response);
            }
            catch (NotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (AppValidationException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });

        group.MapDelete("/{id:guid}", async (Guid id, ITranscriptService service) =>
        {
            await service.DeleteTranscriptAsync(id);
            return Results.NoContent();
        });
    }
}