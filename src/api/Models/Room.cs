using NetTopologySuite.Geometries;

namespace Fpm.Api.Models;

public sealed class Room
{
  public int RoomId { get; set; }

  public Polygon Geometry { get; set; } = default!;

  public string Name { get; set; } = "";

  public string? Usage { get; set; }

  public string? Notes { get; set; }
}
