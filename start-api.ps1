#!/usr/bin/env powershell
# EcoTrack - Complete Startup Script
# This script automates the setup and startup of all components

param(
    [Switch]$ResetDB = $false
)

Write-Host "🚀 EcoTrack - Complete Startup" -ForegroundColor Cyan

# Check if virtual environment exists
$venvPath = "$PSScriptRoot\.venv\Scripts\Activate.ps1"
if (-not (Test-Path $venvPath)) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Yellow
& $venvPath

# Reset database if requested
if ($ResetDB) {
    Write-Host "🗑️  Resetting database..." -ForegroundColor Yellow
    Remove-Item -Force -ErrorAction SilentlyContinue "$PSScriptRoot\ecotrack.db"
    Remove-Item -Force -ErrorAction SilentlyContinue "$PSScriptRoot\test.db"
}

# Check if admin exists
Write-Host "👤 Checking for admin user..." -ForegroundColor Yellow
$adminCheck = python -c "
from app.db.session import SessionLocal
from app.models.user import User
db = SessionLocal()
admin = db.query(User).filter(User.role == 'admin').first()
db.close()
print('EXISTS' if admin else 'MISSING')
" 2>$null

if ($adminCheck -eq "MISSING") {
    Write-Host "⚠️  No admin user found. Creating one..." -ForegroundColor Yellow
    Write-Host ""
    python scripts/create_admin.py
    Write-Host ""
}

# Start API server
Write-Host "🌐 Starting API server..." -ForegroundColor Green
Write-Host ">>> uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Server will run on: http://0.0.0.0:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "Health check: http://127.0.0.1:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Keep this window open. Open another terminal for the frontend." -ForegroundColor Yellow
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
