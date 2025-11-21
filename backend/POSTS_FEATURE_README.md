# Posts Feature Implementation Notes

This document summarizes the backend work completed for Alex's posts-related sprint items.

## Summary of Changes

- Added `Post` entity, EF Core configuration, repository, service abstraction and business logic.
- Implemented `PostsController` with authenticated endpoints:
  - `GET /api/communities/{communityId}/posts?pageNumber=&pageSize=` returns paginated posts ordered by recency.
  - `POST /api/communities/{communityId}/posts` accepts a caption and optional media upload (JPEG/PNG/GIF/WEBP/MP4), persists the post and stores uploaded files under `wwwroot/uploads`.
- Created DTOs (`CreatePostRequest`, `PostResponse`, etc.) and API binding model (`CreatePostForm`).
- Registered new services in DI containers across API/Core/Persistence layers.
- Added EF Core migration `20251121121500_AddPosts` that creates the `Posts` table (FKs to `Users` and `Communities`, default UTC timestamps, length constraints).
- Stored uploads path in source control (`wwwroot/uploads/.gitkeep`) to ensure the directory exists across environments.

## Outstanding Actions

- **Apply database migration:** run `dotnet tool run dotnet-ef database update --project backend/src/MentoringApp.Persistance/MentoringApp.Persistance.csproj --startup-project backend/src/MentoringApp.API/MentoringApp.API.csproj` once a .NET SDK that supports `net10.0` is available. (The current environment only ships .NET 9.0.308, which blocks automated builds/migration generation.)
- **Serve uploaded media:** if the frontend needs to access uploaded files directly from the API, wire up `app.UseStaticFiles()` (or an alternative CDN/storage) in a future change.

## Testing

Due to missing .NET 10 SDK on this machine, `dotnet build`/`dotnet ef` could not be executed. The migration files were crafted manually based on the current EF Core model. Please run the command above in an environment with the correct SDK to validate and apply the schema changes.

