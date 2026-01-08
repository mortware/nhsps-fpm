using Fpm.Api.Data;
using Fpm.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fpm.Api.Controllers;

[ApiController]
[Route("api/rooms")]
public sealed class RoomsController(AppDbContext db) : ControllerBase
{
  [HttpGet("geojson")]
  public async Task<ActionResult<GeoJsonFeatureCollectionDto<GeoJsonRoomPropertiesDto>>> GetAllAsGeoJson(CancellationToken cancellationToken)
  {
    var rooms = await db.Rooms
      .AsNoTracking()
      .OrderBy(r => r.RoomId)
      .Select(r => new RoomDto(r.RoomId, r.Geometry, r.Name, r.Usage, r.Notes))
      .ToListAsync(cancellationToken);

    var features = rooms
      .Select(r => new GeoJsonFeatureDto<GeoJsonRoomPropertiesDto>(
        Type: "Feature",
        Geometry: r.Geometry,
        Properties: new GeoJsonRoomPropertiesDto(r.RoomId, r.Name, r.Usage, r.Notes)
      ))
      .ToList();

    return Ok(new GeoJsonFeatureCollectionDto<GeoJsonRoomPropertiesDto>(Type: "FeatureCollection", Features: features));
  }

  [HttpGet]
  public async Task<ActionResult<IReadOnlyList<RoomDto>>> GetAll(CancellationToken cancellationToken)
  {
    var rooms = await db.Rooms
      .AsNoTracking()
      .OrderBy(r => r.RoomId)
      .Select(r => new RoomDto(r.RoomId, r.Geometry, r.Name, r.Usage, r.Notes))
      .ToListAsync(cancellationToken);

    return Ok(rooms);
  }

  [HttpGet("{roomId:int}")]
  public async Task<ActionResult<RoomDto>> GetById(int roomId, CancellationToken cancellationToken)
  {
    var room = await db.Rooms
      .AsNoTracking()
      .Where(r => r.RoomId == roomId)
      .Select(r => new RoomDto(r.RoomId, r.Geometry, r.Name, r.Usage, r.Notes))
      .SingleOrDefaultAsync(cancellationToken);

    if (room is null)
    {
      return NotFound(new ProblemDetails
      {
        Title = "Room not found",
        Status = StatusCodes.Status404NotFound,
        Detail = $"No room with id {roomId} exists."
      });
    }

    return Ok(room);
  }

  [HttpPut("{roomId:int}")]
  public async Task<IActionResult> Update(int roomId, [FromBody] UpdateRoomRequest request, CancellationToken cancellationToken)
  {
    if (string.IsNullOrWhiteSpace(request.Name))
    {
      return BadRequest(new ProblemDetails
      {
        Title = "Invalid request",
        Status = StatusCodes.Status400BadRequest,
        Detail = "name is required"
      });
    }

    if (request.Name.Length > 200)
    {
      return BadRequest(new ProblemDetails
      {
        Title = "Invalid request",
        Status = StatusCodes.Status400BadRequest,
        Detail = "name must be <= 200 characters"
      });
    }

    if (request.Usage is { Length: > 200 })
    {
      return BadRequest(new ProblemDetails
      {
        Title = "Invalid request",
        Status = StatusCodes.Status400BadRequest,
        Detail = "usage must be <= 200 characters"
      });
    }

    if (request.Notes is { Length: > 2000 })
    {
      return BadRequest(new ProblemDetails
      {
        Title = "Invalid request",
        Status = StatusCodes.Status400BadRequest,
        Detail = "notes must be <= 2000 characters"
      });
    }

    var room = await db.Rooms.SingleOrDefaultAsync(r => r.RoomId == roomId, cancellationToken);
    if (room is null)
    {
      return NotFound(new ProblemDetails
      {
        Title = "Room not found",
        Status = StatusCodes.Status404NotFound,
        Detail = $"No room with id {roomId} exists."
      });
    }

    room.Name = request.Name;
    room.Usage = request.Usage;
    room.Notes = request.Notes;

    await db.SaveChangesAsync(cancellationToken);

    // Return 200 OK with the updated RoomDto
    var updatedRoomDto = new RoomDto(room.RoomId, room.Geometry, room.Name, room.Usage, room.Notes);
    return Ok(updatedRoomDto);
  }
}
