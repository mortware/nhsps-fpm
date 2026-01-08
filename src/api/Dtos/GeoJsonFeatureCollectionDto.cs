using NetTopologySuite.Geometries;

namespace Fpm.Api.Dtos;

public sealed record GeoJsonFeatureCollectionDto<TProperties>(
  string Type,
  IReadOnlyList<GeoJsonFeatureDto<TProperties>> Features
);

public sealed record GeoJsonFeatureDto<TProperties>(
  string Type,
  Geometry Geometry,
  TProperties Properties
);

public sealed record GeoJsonRoomPropertiesDto(
  int RoomId,
  string Name,
  string? Usage,
  string? Notes
);
