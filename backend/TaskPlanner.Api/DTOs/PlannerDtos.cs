using System.ComponentModel.DataAnnotations;
using TaskPlanner.Api.Models;

namespace TaskPlanner.Api.DTOs;

public class GeneratePlanDto
{
    [Required, MinLength(5), MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DateTime? Deadline { get; set; }
}

public class PlannedTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public decimal? EstimatedHours { get; set; }
}

public class PlanPreviewDto
{
    public string GoalTitle { get; set; } = string.Empty;
    public List<PlannedTaskDto> Tasks { get; set; } = new();
}

public class SavePlanDto
{
    [Required]
    public GoalSaveDto Goal { get; set; } = new();

    [Required, MinLength(1), MaxLength(20)]
    public List<TaskSaveDto> Tasks { get; set; } = new();
}