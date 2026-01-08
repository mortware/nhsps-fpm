using NetTopologySuite.Geometries;

namespace Fpm.Api.Dtos;

public sealed record RoomDto(
  int RoomId,
  Polygon Geometry,
  string Name,
  string? Usage,
  string? Notes
);
