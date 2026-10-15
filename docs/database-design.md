# Database Design

## Relationships
- One User has many Goals
- One Goal has many TaskItems
- Deleting a Goal deletes its TaskItems (cascade delete)

## Users
| Column | Type | Notes |
|---|---|---|
| Id | int | Primary key |
| Name | string | Required |
| Email | string | Required, unique |
| PasswordHash | string | Required |
| CreatedAt | datetime | Auto set |

## Goals
| Column | Type | Notes |
|---|---|---|
| Id | int | Primary key |
| UserId | int | Foreign key to Users |
| Title | string | Required |
| Description | string | Optional |
| Deadline | datetime | Optional |
| CreatedAt | datetime | Auto set |

## TaskItems
| Column | Type | Notes |
|---|---|---|
| Id | int | Primary key |
| GoalId | int | Foreign key to Goals |
| Title | string | Required |
| Description | string | Optional |
| Priority | enum | Low, Medium, High |
| EstimatedHours | decimal | Optional |
| Status | enum | Todo, InProgress, Done |
| DueDate | datetime | Optional |
| SortOrder | int | Order of tasks |