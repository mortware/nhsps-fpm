using Fpm.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Fpm.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
  public DbSet<Room> Rooms => Set<Room>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.Entity<Room>(entity =>
    {
      entity.ToTable("rooms");
      entity.HasKey(x => x.RoomId);

      entity.Property(x => x.RoomId)
        .HasColumnName("room_id");

      entity.Property(x => x.Geometry)
        .HasColumnName("geometry")
        .HasColumnType("geometry(Polygon,4326)")
        .IsRequired();

      entity.Property(x => x.Name)
        .HasColumnName("name")
        .HasMaxLength(200)
        .IsRequired();

      entity.Property(x => x.Usage)
        .HasColumnName("usage")
        .HasMaxLength(200);

      entity.Property(x => x.Notes)
        .HasColumnName("notes")
        .HasMaxLength(2000);
    });
  }
}
