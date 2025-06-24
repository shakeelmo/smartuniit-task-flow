@echo off
echo ========================================
echo SmartUniit Local Database Setup
echo ========================================
echo.

echo Checking Docker status...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not accessible.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running. Starting PostgreSQL container...
echo.

echo Stopping existing container if any...
docker stop smartuniit-postgres >nul 2>&1
docker rm smartuniit-postgres >nul 2>&1

echo Starting PostgreSQL container...
docker run --name smartuniit-postgres ^
    -e POSTGRES_PASSWORD=smartuniit123 ^
    -e POSTGRES_DB=smartuniit_db ^
    -e POSTGRES_USER=postgres ^
    -p 5432:5432 ^
    -d postgres:15

if %errorlevel% neq 0 (
    echo ERROR: Failed to start PostgreSQL container.
    pause
    exit /b 1
)

echo.
echo Waiting for PostgreSQL to start...
timeout /t 10 /nobreak >nul

echo.
echo Setting up database schema...
docker exec -i smartuniit-postgres psql -U postgres -d smartuniit_db < setup-local-db.sql

if %errorlevel% neq 0 (
    echo ERROR: Failed to set up database schema.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database setup completed successfully!
echo ========================================
echo.
echo Database Details:
echo - Host: localhost (192.168.1.30)
echo - Port: 5432
echo - Database: smartuniit_db
echo - Username: postgres
echo - Password: smartuniit123
echo.
echo Connection URL: postgresql://postgres:smartuniit123@localhost:5432/smartuniit_db
echo.
echo Next steps:
echo 1. Update your application configuration
echo 2. Test the connection
echo.
pause 