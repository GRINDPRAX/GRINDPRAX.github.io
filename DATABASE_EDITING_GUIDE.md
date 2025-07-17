# Гайд по редактированию базы данных без использования админки

Данная система использует файловую базу данных на базе JSON файлов. Это позволяет легко редактировать данные напрямую без необходимости заходить в админку.

## Структура базы данных

### 1. Пользователи (`users.json`)

Файл содержит всех пользователей системы:

```json
{
  "users": [
    {
      "id": "1",
      "email": "demo@example.com",
      "nickname": "DemoUser",
      "password": "demo123",
      "avatar": "",
      "rating": 1250,
      "kd": 1.35,
      "registrationDate": "2024-01-15T10:30:00Z",
      "status": "Администратор",
      "level": 15,
      "wins": 45,
      "losses": 33,
      "totalMatches": 78,
      "lastLogin": "2025-07-17T15:44:55.773Z"
    }
  ]
}
```

**Поля пользователя:**

- `id` - уникальный идентификатор
- `email` - email адрес (уникальный)
- `nickname` - отображаемое имя
- `password` - пароль (в открытом виде, в реальном проекте должен быть хэширован)
- `avatar` - ссылка на аватар (может быть пустой)
- `rating` - рейтинг игрока
- `kd` - соотношение убийств к смертям
- `registrationDate` - дата регистрации в формате ISO
- `status` - статус игрока (см. возможные значения ниже)
- `level` - уровень игрока
- `wins` - количество побед
- `losses` - количество поражений
- `totalMatches` - общее количество матчей
- `lastLogin` - последний вход в систему

**Возможные статусы пользователей:**

- `"Новичок"` - для новых игроков
- `"Игрок"` - обычные игроки
- `"Опытный игрок"` - игроки со средним опытом
- `"Ветеран"` - опытные игроки
- `"Эксперт"` - очень опытные игроки
- `"Элитный игрок"` - элитные игроки
- `"Легенда"` - легендарные игроки
- `"Чемпион"` - чемпионы
- `"Администратор"` - администраторы системы

### 2. Матчи (`matches.json`)

Файл содержит все матчи:

```json
{
  "matches": [
    {
      "id": "1752764123456abcde",
      "name": "Турнир по CS2",
      "teamSize": 5,
      "maxPlayers": 10,
      "currentPlayers": ["1", "2", "3", "4"],
      "status": "waiting",
      "createdBy": "1",
      "createdAt": "2025-07-17T15:00:00.000Z",
      "results": null,
      "completedAt": null
    }
  ]
}
```

**Поля матча:**

- `id` - уникальный идентификатор
- `name` - название матча
- `teamSize` - размер команды (2-5 игроков)
- `maxPlayers` - максимальное количество игроков (teamSize \* 2)
- `currentPlayers` - массив ID игроков в матче
- `status` - статус матча: `"waiting"`, `"in_progress"`, `"completed"`
- `createdBy` - ID создателя матча
- `createdAt` - дата создания
- `results` - результаты матча (null если не завершен)
- `completedAt` - дата завершения матча

### 3. Чат (`chat.json`)

Файл содержит сообщения чата матчей:

```json
{
  "messages": [
    {
      "id": "1752764123456xyz",
      "matchId": "1752764123456abcde",
      "userId": "1",
      "userName": "DemoUser",
      "message": "Привет всем!",
      "timestamp": "2025-07-17T15:30:00.000Z"
    }
  ]
}
```

## Как редактировать данные

### Важные правила безопасности:

1. **ВСЕГДА делайте резервную копию** файлов перед редактированием
2. **Останавливайте сервер** перед редактированием файлов
3. **Проверяйте JSON синтаксис** после редактирования
4. **Сохраняйте файлы в UTF-8** кодировке

### Пошаговая инструкция:

#### 1. Остановка сервера

```bash
# Найдите процесс сервера
ps aux | grep node

# Остановите процесс (замените PID на ваш)
kill PID_ПРОЦЕССА

# Или если запущен через npm
npm stop
```

#### 2. Создание резервной копии

```bash
# Создайте папку для бэкапов
mkdir backups

# Скопируйте файлы БД
cp users.json backups/users_backup_$(date +%Y%m%d_%H%M%S).json
cp matches.json backups/matches_backup_$(date +%Y%m%d_%H%M%S).json
cp chat.json backups/chat_backup_$(date +%Y%m%d_%H%M%S).json
```

#### 3. Редактирование файлов

**Для редактирования используйте любой текстовый редактор:**

```bash
# Через nano
nano users.json

# Через vim
vim users.json

# Через VS Code
code users.json
```

#### 4. Проверка JSON синтаксиса

После редактирования обязательно проверьте корректность JSON:

```bash
# Проверка через python
python3 -m json.tool users.json > /dev/null && echo "JSON корректный" || echo "Ошибка в JSON"

# Проверка через node
node -e "JSON.parse(require('fs').readFileSync('users.json', 'utf8')); console.log('JSON корректный');"
```

#### 5. Запуск сервера

```bash
npm run dev
```

## Примеры типичных операций

### Добавление нового администратора

1. Откройте `users.json`
2. Найдите пользователя по email или nickname
3. Измените поле `"status"` на `"Администратор"`

```json
{
  "id": "2",
  "email": "newadmin@example.com",
  "nickname": "NewAdmin",
  "status": "Администратор"
}
```

### Изменение рейтинга игрока

```json
{
  "id": "3",
  "email": "player@example.com",
  "rating": 2000,
  "level": 25
}
```

### Удаление пользователя

1. Найдите пользователя в массиве `users`
2. Удалите весь объект пользователя
3. Убедитесь, что синтаксис JSON остался корректным (запятые, скобки)

### Сброс пароля

```json
{
  "id": "4",
  "email": "user@example.com",
  "password": "newpassword123"
}
```

### Удаление всех матчей

Откройте `matches.json` и замените содержимое на:

```json
{
  "matches": []
}
```

### Очистка чата

Откройте `chat.json` и замените содержимое на:

```json
{
  "messages": []
}
```

## Полезные команды для администрирования

### Поиск пользователя по email

```bash
grep -n "email_to_find" users.json
```

### Подсчет количества пользователей

```bash
grep -c '"id"' users.json
```

### Поиск администраторов

```bash
grep -B5 -A5 "Администратор" users.json
```

### Просмотр активных матчей

```bash
grep -B3 -A3 '"waiting"' matches.json
```

## Восстановление из резервной копии

Если что-то пошло не так:

```bash
# Остановите сервер
kill PID_ПРОЦЕССА

# Восстановите из бэкапа
cp backups/users_backup_YYYYMMDD_HHMMSS.json users.json

# Запустите сервер
npm run dev
```

## Автоматизация бэкапов

Создайте скрипт для автоматического создания бэкапов:

```bash
#!/bin/bash
# save as backup.sh

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

cp users.json $BACKUP_DIR/users_$DATE.json
cp matches.json $BACKUP_DIR/matches_$DATE.json
cp chat.json $BACKUP_DIR/chat_$DATE.json

echo "Backup created at $DATE"

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "*.json" -mtime +30 -delete
```

Сделайте скрипт исполняемым и добавьте в cron:

```bash
chmod +x backup.sh

# Добавьте в crontab для ежедневного бэкапа в 2:00
0 2 * * * /path/to/your/project/backup.sh
```

## Мониторинг изменений

Для отслеживания изменений в файлах можно использовать:

```bash
# Установите inotify-tools
sudo apt-get install inotify-tools

# Мониторинг изменений в реальном времени
inotifywait -m -e modify users.json matches.json chat.json
```

---

**Важно:** При работе с продакшн системой рекомендуется использовать полноценную базу данных (PostgreSQL, MongoDB) вместо файловой системы для лучшей производительности и надежности.
