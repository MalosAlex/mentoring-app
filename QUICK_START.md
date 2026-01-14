# Quick Start Guide

A straightforward guide to getting the Mentoring App up and running.

## Prerequisites

- [.NET SDK 10.0](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or later)
- SQL Server (Express, LocalDB, or Developer Edition)

## Step 1: Database Configuration

Update the connection string in the backend to point to your SQL Server instance:

1. Open `backend/src/MentoringApp.API/appsettings.json` (and `appsettings.Development.json`).
2. Update the `DefaultConnection` string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=MentoringApp;Integrated Security=True;TrustServerCertificate=True;"
}
```

*Common Server Names: `localhost\SQLEXPRESS`, `(localdb)\MSSQLLocalDB`, or `.` for default instance.*

## Step 2: Set Up Backend

1. Navigate to the API project directory:
   ```powershell
   cd backend\src\MentoringApp.API
   ```

2. Apply database migrations:
   ```powershell
   dotnet ef database update --project ..\MentoringApp.Persistance
   ```

3. Start the backend:
   ```powershell
   dotnet run
   ```
   *The backend will run on: http://localhost:5216*

## Step 3: Set Up Frontend

1. Open a **new terminal** and navigate to the frontend directory:
   ```powershell
   cd frontend\mentoring-app
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the development server:
   ```powershell
   npm run dev
   ```
   *The frontend will run on: http://localhost:3000*

## Summary of URLs

- **Frontend:** http://localhost:3000
- **API Base:** http://localhost:5216/api
- **Swagger UI:** http://localhost:5216/swagger/index.html

## Project Structure

- `backend/src/`
  - `MentoringApp.API/`: API Controllers and Configuration.
  - `MentoringApp.Core/`: Business logic, Services, and Models.
  - `MentoringApp.Persistance/`: Database Context, Entities, and Migrations.
- `frontend/mentoring-app/`: Next.js application.
