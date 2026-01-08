CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS rooms (
  room_id   SERIAL PRIMARY KEY,
  geometry  geometry(Polygon) NOT NULL,
  name      text NOT NULL,
  usage     text NULL,
  notes     text NULL
);

ALTER TABLE rooms
  ALTER COLUMN geometry TYPE geometry(Polygon)
  USING ST_SetSRID(geometry, 0);

-- Seed a simple planar floor layout if empty (local coordinate space, not WGS84)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM rooms) THEN
    INSERT INTO rooms (geometry, name, usage, notes)
    VALUES
      -- Reception / entrance block
      (ST_GeomFromText('POLYGON((0 0,0 18,22 18,22 0,0 0))'), 'Reception', 'Public', 'Main entrance'),
      (ST_GeomFromText('POLYGON((22 0,22 18,45 18,45 0,22 0))'), 'Waiting Area', 'Public', 'Seating capacity 12'),

      -- Corridor spine (jogged)
      (ST_GeomFromText('POLYGON((0 18,0 26,70 26,70 18,0 18))'), 'Corridor A', 'Circulation', NULL),
      (ST_GeomFromText('POLYGON((45 0,45 18,53 18,53 0,45 0))'), 'Corridor B', 'Circulation', 'Side passage'),

      -- Clinical / meeting spaces (top left)
      (ST_GeomFromText('POLYGON((0 26,0 48,25 48,25 26,0 26))'), 'Consult 1', 'Clinical', 'Handwash sink'),
      (ST_GeomFromText('POLYGON((25 26,25 48,48 48,48 26,25 26))'), 'Consult 2', 'Clinical', NULL),
      (ST_GeomFromText('POLYGON((48 26,48 48,70 48,70 26,48 26))'), 'Meeting Room', 'Admin', 'Projector fitted'),

      -- Core services block (right side)
      (ST_GeomFromText('POLYGON((70 18,70 48,95 48,95 18,70 18))'), 'Core', 'Service', 'Restricted access'),
      (ST_GeomFromText('POLYGON((95 18,95 33,110 33,110 18,95 18))'), 'WC 1', 'WC', 'Accessible'),
      (ST_GeomFromText('POLYGON((95 33,95 48,110 48,110 33,95 33))'), 'WC 2', 'WC', NULL),
      (ST_GeomFromText('POLYGON((110 18,110 48,120 48,120 18,110 18))'), 'Plant', 'Plant', 'Electrical cupboard'),

      -- Lower left “back office” wing (makes it feel like an L-shaped plan)
      (ST_GeomFromText('POLYGON((0 -22,0 0,28 0,28 -22,0 -22))'), 'Office A', 'Office', NULL),
      (ST_GeomFromText('POLYGON((28 -22,28 0,53 0,53 -22,28 -22))'), 'Office B', 'Office', NULL),
      (ST_GeomFromText('POLYGON((53 -22,53 0,70 0,70 -22,53 -22))'), 'Store', 'Storage', 'Cleaning supplies'),
      (ST_GeomFromText('POLYGON((70 -22,70 18,78 18,78 -22,70 -22))'), 'Stairs', 'Service', 'Fire door');

  END IF;
END $$;
