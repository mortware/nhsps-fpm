# Floorplan Manager (FPM) - Artefact

Minimal full-stack starter for a **Floorplan/Room** viewer/editor:

- Backend: .NET Web API (REST)
- DB: PostgreSQL + PostGIS
- Frontend: React (Web application)

## Prereqs

- .NET SDK 10+
- Node.js 20+
- Docker Desktop (recommended) or PostgreSQL with PostGIS enabled

## 1) Create the database schema

### Option A (recommended): Docker PostGIS (fast)

Use the helper script (recommended):

```powershell
./dev-db.ps1 up
./dev-db.ps1 init
```

Or run Docker commands directly.

Start a local PostGIS container:

```powershell
docker run -d --name fpm-postgis -p 5432:5432 \
	-e POSTGRES_PASSWORD=postgres \
	-e POSTGRES_DB=fpm \
	-v fpm_pgdata:/var/lib/postgresql/data \
	postgis/postgis:16-3.4
```

Initialize schema + seed data from [src/api/db/init.sql](src/api/db/init.sql):

```powershell
Get-Content -Raw .\src\api\db\init.sql | docker exec -i fpm-postgis psql -U postgres -d fpm
```

If port `5432` is already in use, change `-p 5432:5432` to something like `-p 5433:5432` and update the API connection string port.

Stop/remove later:

```powershell
docker stop fpm-postgis
docker rm fpm-postgis
```

### Option B: Local Postgres install

Create a database (example: `fpm`) and enable PostGIS, then run:

```sql
\i src/api/db/init.sql
```

## 2) Configure the API connection string

Set an environment variable (recommended):

PowerShell:

```powershell
$env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=fpm;Username=postgres;Password=postgres"
```

Or edit `src/api/appsettings.Development.json`.

## 3) Run the API

```powershell
dotnet run --project src/api
```

API will listen on `http://localhost:5085` by default.

Try:

- `GET http://localhost:5085/api/rooms`
- `GET http://localhost:5085/api/rooms/1`

## 4) Run the client

```powershell
cd src/client
npm install
npm run dev
```

The dev server proxies `/api/*` to the API.

## One-command dev (DB + API + client)

```powershell
./dev.ps1 up
```

To stop just the DB container:

```powershell
./dev.ps1 down
```

## Scope and limitations

- The artefact is intentionally scoped to a single building.
- Spatial geometry is treated as read-only; only room metadata can be updated.
- Authentication and authorisation are not implemented.
- Performance evaluation is qualitative and based on local execution.

These limitations are deliberate and are discussed in the accompanying report
as architectural trade-offs appropriate to an exploratory artefact.

## Evaluation checklist (for assessors)

The following steps can be used to verify the artefact against the functional and non-functional requirements described in the report:

1. Start the database and API (Sections 1–3 above).
2. Start the client (Section 4 above).
3. Load the client UI and confirm:
   - Rooms are retrieved and rendered correctly.
   - Selecting a room displays its attributes.
4. Update a room’s metadata (name, usage, or notes) and confirm:
   - Invalid payloads are rejected by the API.
   - Valid updates are persisted and returned correctly.
5. Confirm geometry cannot be modified through the API.

These steps provide evidence for functional correctness, data integrity,
and security baseline evaluation as discussed in Task 2.
