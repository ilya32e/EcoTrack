#!/usr/bin/env powershell
# EcoTrack - Frontend Startup Script

Write-Host "🚀 EcoTrack Frontend - Starting Vite Dev Server" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "$PSScriptRoot\node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if API is running
Write-Host "🔍 Checking if API is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API is running on http://127.0.0.1:8000" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  API is NOT running on http://127.0.0.1:8000" -ForegroundColor Red
    Write-Host "Start the API first with: powershell .\start-api.ps1" -ForegroundColor Yellow
    Write-Host ""
}

# Start frontend
Write-Host ""
Write-Host "🌐 Starting Vite dev server..." -ForegroundColor Green
Write-Host ">>> npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Debug panel: http://localhost:5173/debug" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Keep this window open. The frontend is now live." -ForegroundColor Yellow
Write-Host ""

npm run dev
