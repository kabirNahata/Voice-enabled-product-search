namespace Domain.Entities;

public class Transcript
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "stt" or "tts"
    public string? Language { get; set; }
    public float? Confidence { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Session Session { get; set; } = null!;
}