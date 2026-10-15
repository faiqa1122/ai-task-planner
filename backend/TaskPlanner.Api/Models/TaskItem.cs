namespace TaskPlanner.Api.Models;

public class TaskItem
{
    public int Id { get; set; }
    public int GoalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public decimal? EstimatedHours { get; set; }
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;
    public DateTime? DueDate { get; set; }
    public int SortOrder { get; set; }

    public Goal? Goal { get; set; }
}