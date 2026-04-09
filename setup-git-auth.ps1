# Скрипт для настройки Git аутентификации с GitHub

Write-Host "=== Настройка Git аутентификации ===" -ForegroundColor Cyan

# Шаг 1: Настройка email и имени
Write-Host "`n[1/5] Настройка email и имени пользователя..." -ForegroundColor Yellow
git config --global user.email "yorikelesey@gmail.com"
git config --global user.name "yorikelesey-dot"
Write-Host "✓ Email: yorikelesey@gmail.com" -ForegroundColor Green
Write-Host "✓ Name: yorikelesey-dot" -ForegroundColor Green

# Шаг 2: Настройка credential helper
Write-Host "`n[2/5] Настройка credential helper..." -ForegroundColor Yellow
git config --global credential.helper store
Write-Host "✓ Credential helper: store" -ForegroundColor Green

# Шаг 3: Очистка remote URL от старого токена
Write-Host "`n[3/5] Очистка remote URL..." -ForegroundColor Yellow
git remote set-url origin https://github.com/yorikelesey-dot/minebridgesSITE.git
Write-Host "✓ Remote URL очищен" -ForegroundColor Green

# Шаг 4: Инструкция по созданию нового токена
Write-Host "`n[4/5] ТРЕБУЕТСЯ ДЕЙСТВИЕ:" -ForegroundColor Red
Write-Host @"

Ваш текущий токен не работает. Нужно создать новый Personal Access Token:

1. Откройте: https://github.com/settings/tokens
2. Нажмите: Generate new token → Generate new token (classic)
3. Заполните:
   - Note: MineBridge Deploy Token
   - Expiration: No expiration (или выберите срок)
   - Выберите права: ✅ repo (полный доступ)
4. Нажмите: Generate token
5. СКОПИРУЙТЕ токен (показывается только один раз!)

"@ -ForegroundColor Yellow

$token = Read-Host "Вставьте новый токен сюда"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "✗ Токен не введён. Выход." -ForegroundColor Red
    exit 1
}

# Шаг 5: Сохранение токена
Write-Host "`n[5/5] Сохранение токена..." -ForegroundColor Yellow
$credLine = "https://yorikelesey-dot:$token@github.com"
$credLine | Set-Content "$env:USERPROFILE\.git-credentials" -Encoding UTF8
Write-Host "✓ Токен сохранён в ~/.git-credentials" -ForegroundColor Green

# Проверка последнего коммита
Write-Host "`n=== Проверка настроек ===" -ForegroundColor Cyan
$lastCommit = git log -1 --pretty=format:"%an <%ae>"
Write-Host "Последний коммит от: $lastCommit" -ForegroundColor White

# Тестовый push
Write-Host "`n=== Тестовый push ===" -ForegroundColor Cyan
Write-Host "Попытка push в GitHub..." -ForegroundColor Yellow

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ SUCCESS! Push выполнен успешно!" -ForegroundColor Green
    Write-Host "✓ Теперь Vercel должен успешно задеплоить проект" -ForegroundColor Green
    Write-Host "`nСледующие шаги:" -ForegroundColor Cyan
    Write-Host "1. Откройте Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. Найдите проект minebridgesSITE" -ForegroundColor White
    Write-Host "3. Нажмите Redeploy на последнем деплое" -ForegroundColor White
} else {
    Write-Host "`n✗ Push не удался. Проверьте:" -ForegroundColor Red
    Write-Host "- Токен скопирован полностью" -ForegroundColor Yellow
    Write-Host "- Токен имеет права 'repo'" -ForegroundColor Yellow
    Write-Host "- Токен не истёк" -ForegroundColor Yellow
}
