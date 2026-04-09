$Token = "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"
$RepoUrl = "https://yorikelesey-dot:$Token@github.com/yorikelesey-dot/minebridgesSITE.git"

Write-Host "Preparing files..."
git add .
git commit -m "Premium glassmorphism UI update"

Write-Host ""
Write-Host "Configuring remote access..."
git remote remove origin 2>$null
git remote add origin $RepoUrl

Write-Host ""
Write-Host "Pushing to GitHub (force update)..."
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Repository has been updated." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Push failed." -ForegroundColor Red
    Write-Host "Please check if your token has 'Contents: Read and write' permissions." -ForegroundColor Yellow
}
