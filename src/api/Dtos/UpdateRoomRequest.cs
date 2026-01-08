namespace Fpm.Api.Dtos;

public sealed record UpdateRoomRequest(
  string Name,
  string? Usage,
  string? Notes
);
