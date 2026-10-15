using System.ComponentModel.DataAnnotations;
using TaskPlanner.Api.Models;

namespace TaskPlanner.Api.DTOs;

public class TaskSaveDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    [Range(0, 1000)]
    public decimal? EstimatedHours { get; set; }

    public DateTime? DueDate { get; set; }

    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;
}

public class TaskStatusDto
{
    public TaskItemStatus Status { get; set; }
}

public class TaskResponseDto
{
    public int Id { get; set; }
    public int GoalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; }
    public decimal? EstimatedHours { get; set; }
    public TaskItemStatus Status { get; set; }
    public DateTime? DueDate { get; set; }
    public int SortOrder { get; set; }
}