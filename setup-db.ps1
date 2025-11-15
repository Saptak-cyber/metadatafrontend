# Database Setup Script for Windows PowerShell

Write-Host "🚀 Setting up File Manager Dashboard databases..." -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgInstalled) {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "Or use Docker: docker run --name postgres-metadata -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=metadata_db -p 5432:5432 -d postgres:14" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ PostgreSQL found" -ForegroundColor Green
    Write-Host "Creating database 'metadata_db'..." -ForegroundColor Yellow
    # Try to create database (may fail if already exists, that's OK)
    psql -U postgres -c "CREATE DATABASE metadata_db;" 2>$null
    Write-Host "✅ PostgreSQL setup complete" -ForegroundColor Green
    Write-Host ""
}

# Check if MongoDB is installed
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoInstalled = Get-Command mongod -ErrorAction SilentlyContinue
if (-not $mongoInstalled) {
    Write-Host "❌ MongoDB not found!" -ForegroundColor Red
    Write-Host "Install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
    Write-Host "Or use Docker: docker run --name mongo-metadata -p 27017:27017 -d mongo:5" -ForegroundColor Cyan
    Write-Host "Or use MongoDB Atlas (free cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ MongoDB found" -ForegroundColor Green
    Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
    Start-Service MongoDB -ErrorAction SilentlyContinue
    Write-Host "✅ MongoDB setup complete" -ForegroundColor Green
    Write-Host ""
}

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your database credentials" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
