using System.ComponentModel.DataAnnotations;

namespace TaskPlanner.Api.DTOs;

public class GoalSaveDto
{
    [Required, MinLength(5), MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DateTime? Deadline { get; set; }
}

public class GoalResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TaskCount { get; set; }
    public int DoneCount { get; set; }
}