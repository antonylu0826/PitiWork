# Gemini Code Assistant Project Overview

## 1. Project Overview

This project is a web application with a React/Next.js frontend and a .NET DevExpress XAF Web API backend. Authentication is managed centrally via Keycloak.

- **Frontend**: A modern, responsive user interface built with Next.js and Material-UI (MUI).
- **Backend**: A robust, data-centric API service powered by DevExpress XAF (eXpressApp Framework).
- **Authentication**: Secure authentication and authorization handled by Keycloak. The React application acts as a public client, while the .NET API validates JWTs issued by Keycloak.

## 2. Technology Stack

- **Frontend**:
    - Framework: Next.js 15 / React 19
    - Language: TypeScript
    - UI Library: Material-UI (MUI) v7
    - Package Manager: pnpm
    - Authentication Client: `@react-keycloak/web`, `keycloak-js`
- **Backend**:
    - Framework: ASP.NET Core
    - ORM/Application Framework: DevExpress XAF
    - Language: C#
    - Authentication: JWT Bearer Token validation
- **Authentication Server**:
    - Keycloak

## 3. Project Structure

```
/
├── Modules/                  # DevExpress XAF Modules
├── PitiWork.Blazor.Server/   # Blazor Server project (likely for admin UI)
├── PitiWork.WebApi/          # .NET Backend API (DevExpress XAF)
│   ├── PitiWork.WebApi.csproj
│   └── ...
├── pitiwork-react/           # React/Next.js Frontend
│   ├── src/
│   ├── package.json          # Frontend dependencies and scripts
│   ├── pnpm-lock.yaml        # pnpm lock file
│   └── next.config.mjs
├── keycloak_setting.md       # Keycloak client configuration details
└── GEMINI.md                 # This file
```

## 4. Key Configurations

### Frontend (pitiwork-react)

- **Keycloak Config**: The settings for the React client are detailed in `keycloak_setting.md`.
    - **Client ID**: `react`
    - **Root URL**: `http://localhost:3000/`
    - **Client Authenticator**: `client-secret`

### Backend (PitiWork.WebApi)

- **Authentication**: The API is configured to validate JWTs. The authority and audience should correspond to the Keycloak realm and client ID. This is typically configured in `appsettings.json` and `Startup.cs` or `Program.cs`.

## 5. Development Workflow

### Frontend (pitiwork-react)

The following commands should be run from the `pitiwork-react/` directory.

- **Install Dependencies**:
  ```bash
  pnpm install
  ```

- **Run Development Server**:
  Starts the Next.js app in development mode with HTTPS at `https://localhost:3000`.
  ```bash
  pnpm dev
  ```

- **Build for Production**:
  ```bash
  pnpm build
  ```

- **Run Production Server**:
  ```bash
  pnpm start
  ```

- **Linting & Formatting**:
  ```bash
  # Check for linting errors
  pnpm lint

  # Fix linting errors
  pnpm lint:fix

  # Check code formatting
  pnpm format:check

  # Fix code formatting
  pnpm format:write
  ```

### Backend (PitiWork.WebApi)

- **Run Development Server**:
  Use Visual Studio to open the `.sln` file and run the `PitiWork.WebApi` project. This will typically start the backend service on the port configured in `Properties/launchSettings.json`.
