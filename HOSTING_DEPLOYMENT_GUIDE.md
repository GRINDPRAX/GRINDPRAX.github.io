# Гайд по деплою приложения на хостинг в России

Данное руководство поможет развернуть ваше приложение на различных хостинг-провайдерах, доступных в России.

## Подготовка к деплою

### 1. Проверьте готовность проекта

```bash
# Установите зависимости
npm install

# Проверьте сборку
npm run build

# Запустите тесты (если есть)
npm test

# Проверьте запуск продакшн сервера локально
npm start
```

### 2. Подготовьте файлы для деплоя

Убедитесь, что у вас есть:

- `package.json` с правильными скриптами
- `.env` файл с переменными окружения (если нужно)
- `README.md` с инструкциями
- Все необходимые файлы в git репозитории

## Варианты хостинга в России

### 1. Timeweb (timeweb.ru) ⭐ Рекомендуется

**Преимущества:**

- Российский хостинг-провайдер
- Поддержка Node.js
- Удобная панель управления
- Хорошая техподдержка на русском языке

**Инструкция по деплою:**

1. **Регистрация и заказ:**

   - Зайдите на [timeweb.ru](https://timeweb.ru)
   - Закажите VDS/VPS или хостинг с поддержкой Node.js

2. **Подключение по SSH:**

   ```bash
   ssh root@your-server-ip
   ```

3. **Установка Node.js:**

   ```bash
   # Обновление системы
   apt update && apt upgrade -y

   # Установка Node.js (рекомендуется LTS версия)
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   apt-get install -y nodejs

   # Проверка установки
   node --version
   npm --version
   ```

4. **Загрузка проекта:**

   ```bash
   # Клонирование из GitHub
   git clone https://github.com/yourusername/yourproject.git
   cd yourproject

   # Или загрузка через SCP
   scp -r ./your-project root@your-server-ip:/var/www/
   ```

5. **Установка зависимостей и сборка:**

   ```bash
   npm install
   npm run build
   ```

6. **Настройка PM2 для управления процессом:**

   ```bash
   # Установка PM2
   npm install -g pm2

   # Запуск приложения
   pm2 start npm --name "faceit-app" -- start

   # Настройка автозапуска
   pm2 startup
   pm2 save
   ```

7. **Настройка Nginx (опционально):**

   ```bash
   # Установка Nginx
   apt install nginx -y

   # Создание конфигурации
   nano /etc/nginx/sites-available/faceit
   ```

   Конфигурация Nginx:

   ```nginx
   server {
       listen 80;
       server_name your-domain.ru;

       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Активация конфигурации
   ln -s /etc/nginx/sites-available/faceit /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

### 2. REG.RU

**Преимущества:**

- Крупный российский регистратор и хостинг-провайдер
- Поддержка Node.js на VPS
- Интеграция с доменами

**Инструкция аналогична Timeweb**, но через панель управления REG.RU.

### 3. Beget.ru

**Особенности:**

- Бюджетный вариант
- Ограниченная поддержка Node.js на шаред-хостинге
- Рекомендуется VPS

### 4. RuVDS.com

**Преимущества:**

- Широкий выбор тарифов VPS
- Дата-центры в России
- Техподдержка 24/7

## Деплой через Docker (универсальный способ)

### 1. Создайте Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Открываем порт
EXPOSE 8080

# Запускаем приложение
CMD ["npm", "start"]
```

### 2. Создайте docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    volumes:
      - ./users.json:/app/users.json
      - ./matches.json:/app/matches.json
      - ./chat.json:/app/chat.json
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### 3. Деплой на любом VPS

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Запуск ��риложения
docker-compose up -d
```

## Настройка SSL сертификата

### Через Let's Encrypt (бесплатно)

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Получение сертификата
certbot --nginx -d your-domain.ru

# Автоматическое обновление
crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Настройка мониторинга

### 1. Логирование

```bash
# Просмотр логов PM2
pm2 logs

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. Мониторинг ресурсов

```bash
# Установка htop
apt install htop -y

# Мониторинг PM2
pm2 monit
```

## Автоматический деплой через GitHub Actions

### 1. Создайте .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.7
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/your-project
            git pull origin main
            npm ci --only=production
            npm run build
            pm2 restart faceit-app
```

### 2. Настройте секреты в GitHub

В настройках репозитория добавьте:

- `HOST` - IP адрес сервера
- `USERNAME` - имя пользователя для SSH
- `SSH_KEY` - приватный SSH ключ

## Резервное копирование

### 1. Скрипт бэкапа

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/home/backups"
PROJECT_DIR="/var/www/your-project"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Бэкап базы данных (JSON файлы)
tar -czf $BACKUP_DIR/database_$DATE.tar.gz $PROJECT_DIR/*.json

# Бэкап всего проекта
tar -czf $BACKUP_DIR/project_$DATE.tar.gz $PROJECT_DIR

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 2. Автоматический бэкап

```bash
# Добавьте в crontab
crontab -e

# Ежедневный бэкап в 3:00
0 3 * * * /path/to/backup.sh
```

## Рекомендации по безопасности

### 1. Настройка файрвола

```bash
# UFW (Ubuntu)
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Или iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

### 2. Обновления безопасности

```bash
# Автоматические обновления
apt install unattended-upgrades -y
dpkg-reconfigure unattended-upgrades
```

### 3. Защита SSH

```bash
# Отключение входа под root
nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no

systemctl restart ssh
```

## Troubleshooting

### Частые проблемы и решения:

1. **Приложение не запускается:**

   ```bash
   # Проверьте логи
   pm2 logs
   # Проверьте порт
   netstat -tulpn | grep 8080
   ```

2. **Ошибки прав доступа:**

   ```bash
   chown -R www-data:www-data /var/www/your-project
   chmod -R 755 /var/www/your-project
   ```

3. **Проблемы с Nginx:**

   ```bash
   nginx -t
   systemctl status nginx
   tail -f /var/log/nginx/error.log
   ```

4. **Нехватка памяти:**
   ```bash
   # Добавление swap
   fallocate -l 1G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```

## Стоимость хостинга

### Примерные цены (2024):

- **Timeweb VPS:** от 200₽/месяц
- **REG.RU VPS:** от 300₽/месяц
- **Beget VPS:** от 150₽/месяц
- **RuVDS:** от 250₽/месяц

### Рекомендуемая конфигурация:

- **CPU:** 1-2 ядра
- **RAM:** 1-2 GB
- **Диск:** 20-40 GB SSD
- **Трафик:** безлимитный

---

**Важно:** Всегда тестируйте деплой на тестовом сервере перед запуском в продакшн!
