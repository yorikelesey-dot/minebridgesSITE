# Инструкция по исправлению проблем с деплоем на Vercel

## Проблема
Vercel блокирует деплой с ошибкой: "Deployment Blocked: The deployment was blocked because the commit email could not be matched to a GitHub account."

Git выдаёт ошибку: "Invalid username or token. Password authentication is not supported."

## Решение

### Шаг 1: Создание Personal Access Token (PAT) на GitHub

1. Откройте браузер и перейдите на GitHub: https://github.com
2. Нажмите на свой аватар (правый верхний угол) → **Settings**
3. Прокрутите вниз в левом меню → **Developer settings** (самый низ)
4. Нажмите **Personal access tokens** → **Tokens (classic)**
5. Нажмите **Generate new token** → **Generate new token (classic)**
6. Заполните форму:
   - **Note**: `Vercel Deploy Token` (или любое название)
   - **Expiration**: `No expiration` (или выберите срок)
   - **Выберите права (scopes)**:
     - ✅ `repo` (полный доступ к приватным репозиториям)
     - ✅ `workflow` (если используете GitHub Actions)
7. Нажмите **Generate token** внизу страницы
8. **ВАЖНО**: Скопируйте токен и сохраните в безопасное место (он показывается только один раз!)
   - Токен выглядит так: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Шаг 2: Настройка Git Credential Manager (автоматическое сохранение токена)

Откройте PowerShell и выполните команды:

```powershell
# Включаем сохранение credentials в Windows Credential Manager
git config --global credential.helper manager-core

# Проверяем, что настройка применилась
git config --global credential.helper
```

Должно вывести: `manager-core`

---

### Шаг 3: Настройка правильного email для коммитов

```powershell
# Устанавливаем ваш verified email с GitHub
git config --global user.email "yorikelesey@gmail.com"
git config --global user.name "yorikelesey-dot"

# Проверяем настройки
git config --global user.email
git config --global user.name
```

---

### Шаг 4: Очистка старых credentials и повторная аутентификация

```powershell
# Удаляем старые сохранённые credentials для GitHub
git credential-manager delete https://github.com

# Переходим в папку вашего проекта (если ещё не там)
cd C:\путь\к\вашему\проекту\minebridgesSITE

# Проверяем remote URL
git remote -v
```

Должно показать:
```
origin  https://github.com/yorikelesey-dot/minebridgesSITE.git (fetch)
origin  https://github.com/yorikelesey-dot/minebridgesSITE.git (push)
```

---

### Шаг 5: Тестовый push с новым токеном

```powershell
# Создаём пустой коммит для теста
git commit --allow-empty -m "fix: update commit email for Vercel deployment"

# Пушим в репозиторий
git push origin main
```

**Что произойдёт:**
- Git попросит ввести username и password
- **Username**: введите `yorikelesey-dot` (ваш GitHub username)
- **Password**: вставьте ваш Personal Access Token (НЕ пароль от GitHub!)

После успешного push токен автоматически сохранится в Windows Credential Manager, и больше не нужно будет его вводить.

---

### Шаг 6: Проверка email в последнем коммите

```powershell
# Смотрим информацию о последнем коммите
git log -1 --pretty=format:"%an <%ae>"
```

Должно вывести: `yorikelesey-dot <yorikelesey@gmail.com>`

---

### Шаг 7: Проверка на GitHub

1. Откройте ваш репозиторий: https://github.com/yorikelesey-dot/minebridgesSITE
2. Перейдите во вкладку **Commits**
3. Убедитесь, что последний коммит показывает ваш аватар и username
4. Если аватар не показывается — email не привязан к аккаунту

---

### Шаг 8: Убедитесь, что email verified на GitHub

1. Перейдите на GitHub → **Settings** → **Emails**
2. Найдите `yorikelesey@gmail.com` в списке
3. Если рядом есть кнопка **Resend verification email** — нажмите её и подтвердите email
4. Убедитесь, что стоит галочка: ✅ **Keep my email addresses private** (можно оставить включённой)

---

### Шаг 9: Повторный деплой на Vercel

1. Откройте Vercel Dashboard: https://vercel.com/dashboard
2. Найдите ваш проект `minebridgesSITE`
3. Нажмите **Redeploy** на последнем деплое
4. Или сделайте новый push:

```powershell
git commit --allow-empty -m "chore: trigger Vercel deployment"
git push origin main
```

Vercel автоматически запустит новый деплой. Теперь ошибка "commit email could not be matched" должна исчезнуть.

---

## Обновление скрипта upload.ps1

Откройте файл `upload.ps1` и убедитесь, что он не переопределяет email:

```powershell
# Ваш текущий скрипт должен выглядеть примерно так:
git add .
git commit -m "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main
```

**НЕ добавляйте** в скрипт команды типа `git config user.email`, так как это может перезаписать глобальные настройки.

---

## Проверка сохранённых credentials

Если хотите проверить, что токен сохранён:

```powershell
# Открываем Windows Credential Manager
control /name Microsoft.CredentialManager
```

Или через командную строку:
```powershell
cmdkey /list | Select-String "github"
```

Должна быть запись типа: `git:https://github.com`

---

## Если проблема всё ещё есть

### Проверка 1: Email точно verified?
```powershell
# Откройте GitHub Settings → Emails
# Убедитесь, что yorikelesey@gmail.com помечен как "Verified"
```

### Проверка 2: Переподключите репозиторий на Vercel
1. Vercel Dashboard → Project Settings → Git
2. Нажмите **Disconnect** 
3. Нажмите **Connect Git Repository** снова
4. Выберите репозиторий `yorikelesey-dot/minebridgesSITE`

### Проверка 3: Проверьте настройки приватности email на GitHub
1. GitHub → Settings → Emails
2. Если включено "Keep my email addresses private", используйте noreply email:
   ```powershell
   git config --global user.email "yorikelesey-dot@users.noreply.github.com"
   ```
3. Сделайте новый коммит и push

---

## Итоговый чеклист

- ✅ Personal Access Token создан с правами `repo`
- ✅ `git config --global credential.helper manager-core`
- ✅ `git config --global user.email "yorikelesey@gmail.com"`
- ✅ Email verified на GitHub
- ✅ Старые credentials удалены: `git credential-manager delete https://github.com`
- ✅ Успешный push с новым токеном
- ✅ Последний коммит показывает правильный email: `git log -1 --pretty=format:"%ae"`
- ✅ Vercel redeploy запущен

---

## Полезные команды для будущего

```powershell
# Проверить текущий email
git config user.email

# Проверить последний коммит
git log -1 --pretty=format:"%an <%ae> - %s"

# Изменить email последнего коммита (если нужно)
git commit --amend --author="yorikelesey-dot <yorikelesey@gmail.com>" --no-edit
git push --force origin main

# Удалить сохранённый токен (если нужно обновить)
git credential-manager delete https://github.com
```

---

## Контакты для помощи

Если проблема не решилась:
1. Проверьте логи деплоя на Vercel
2. Откройте GitHub → Repository → Settings → Webhooks
3. Проверьте, что webhook от Vercel активен и получает события

Удачи с деплоем! 🚀
