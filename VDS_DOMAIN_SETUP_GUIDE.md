# Руководство по подключению домена к VDS серверу

Это подробное руководство поможет вам подключить купленный домен к VDS серверу и настроить веб-сайт для доступа по этому домену.

## Содержание

1. [Предварительные требования](#предварительные-требования)
2. [Настройка DNS записей](#настройка-dns-записей)
3. [Настройка сервера](#настройка-сервера)
4. [Установка и настройка Nginx](#установка-и-настройка-nginx)
5. [Установка SSL сертификата](#установка-ssl-сертификата)
6. [Деплой приложения](#деплой-приложения)
7. [Проверка и устранение неполадок](#проверка-и-устранение-неполадок)

## Предварительные требования

- Купленный домен (например, yourdomain.com)
- VDS/VPS сервер с Ubuntu/Debian или CentOS
- Root доступ к серверу (через SSH)
- Базовые знания работы с командной строкой Linux

## Настройка DNS записей

### Шаг 1: Получение IP адреса сервера

Узнайте IP адрес вашего VDS сервера. Обычно он указан в панели управления хостинг-провайдера.

```bash
# Если вы уже подключены к серверу, можете узнать IP так:
curl ifconfig.me
# или
ip addr show
```

### Шаг 2: Настройка DNS в панели управления доменом

Войдите в панель управления доменом у вашего регистратора (например, Namecheap, GoDaddy, REG.RU) и настройте следующие DNS записи:

#### A-записи:

```
Тип: A
Имя: @
Значение: ВАШ_IP_АДРЕС_СЕРВЕРА
TTL: 3600

Тип: A
Имя: www
Значение: ВАШ_IP_АДРЕС_СЕРВЕРА
TTL: 3600
```

#### Альтернативно, если у вас есть поддомены:

```
Тип: A
Имя: *
Значение: ВАШ_IP_АДРЕС_СЕРВЕРА
TTL: 3600
```

### Шаг 3: Проверка распространения DNS

DNS изменения могут занять от нескольких минут до 48 часов. Проверить можно так:

```bash
# Проверка A-записи
nslookup yourdomain.com
# или
dig yourdomain.com

# Онлайн инструменты:
# - whatsmydns.net
# - dnschecker.org
```

## Настройка сервера

### Шаг 1: Подключение к серверу

```bash
ssh root@ВАШ_IP_АДРЕС_СЕРВЕРА
# или если у вас есть пользователь:
ssh username@ВАШ_IP_АДРЕС_СЕРВЕРА
```

### Шаг 2: Обновление системы

```bash
# Ubuntu/Debian:
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL:
sudo yum update -y
# или для новых версий:
sudo dnf update -y
```

### Шаг 3: Установка необходимых пакетов

```bash
# Ubuntu/Debian:
sudo apt install -y curl wget git nginx nodejs npm certbot python3-certbot-nginx

# CentOS/RHEL:
sudo yum install -y curl wget git nginx nodejs npm
# Для CentOS может потребоваться добавить EPEL репозиторий:
sudo yum install -y epel-release
```

### Шаг 4: Настройка файрвола

```bash
# Ubuntu/Debian (ufw):
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# CentOS/RHEL (firewalld):
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Установка и настройка Nginx

### Шаг 1: Создание конфигурации для вашего сайта

```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Добавьте следующую конфигурацию:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name yourdomain.com www.yourdomain.com;

    root /var/www/yourdomain.com;
    index index.html index.htm index.nginx-debian.html;

    # Для Node.js приложения (если используете):
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Для статических файлов:
    # location / {
    #     try_files $uri $uri/ =404;
    # }

    # Логирование
    access_log /var/log/nginx/yourdomain.com.access.log;
    error_log /var/log/nginx/yourdomain.com.error.log;
}
```

### Шаг 2: Активация конфигурации

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Шаг 3: Создание директории для сайта

```bash
sudo mkdir -p /var/www/yourdomain.com
sudo chown -R $USER:$USER /var/www/yourdomain.com
sudo chmod -R 755 /var/www/yourdomain.com
```

## Установка SSL сертификата

### Использование Let's Encrypt (рекомендуется)

```bash
# Получение SSL сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматическое обновление сертификата
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Проверка SSL

```bash
# Проверка статуса сертификата
sudo certbot certificates

# Тест автообновления
sudo certbot renew --dry-run
```

## Деплой приложения

### Вариант 1: Сборка и деплой Node.js приложения

```bash
# Клонирование репозитория
cd /var/www/yourdomain.com
git clone ВАШ_РЕПОЗИТОРИЙ .

# Установка зависимостей
npm install

# Сборка продакшн версии
npm run build

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Запуск приложения
pm2 start npm --name "yourdomain-app" -- start

# Автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

### Вариант 2: Статический сайт

```bash
# Копирование файлов сайта
cd /var/www/yourdomain.com
# Загрузите ваши файлы через scp, git или другим способом

# Обновление конфигурации Nginx для статических файлов
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Для статического сайта измените секцию location:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

# Кэширование статических файлов
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Автоматический деплой с помощью GitHub Actions

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VDS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /var/www/yourdomain.com
            git pull origin main
            npm ci
            npm run build
            pm2 restart yourdomain-app
```

## Проверка и устранение неполадок

### Проверка статуса служб

```bash
# Статус Nginx
sudo systemctl status nginx

# Статус приложения (если используете PM2)
pm2 status
pm2 logs yourdomain-app

# Проверка портов
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Логи для отладки

```bash
# Логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/yourdomain.com.error.log

# Системные логи
sudo journalctl -u nginx -f
```

### Распространенные проблемы

#### 1. Сайт недоступен по домену

**Проверьте:**

- DNS записи корректно настроены
- Файрвол разрешает подключения на порты 80 и 443
- Nginx запущен и слушает нужные порты

```bash
# Проверка DNS
nslookup yourdomain.com

# Проверка портов
sudo ss -tlnp | grep :80
```

#### 2. SSL сертификат не работает

**Проверьте:**

- Домен корректно указан в конфигурации Nginx
- Сертификат не истек

```bash
# Проверка сертификата
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

#### 3. 502 Bad Gateway ошибка

**Причины:**

- Приложение не запущено
- Неверный порт в конфигурации Nginx
- Приложение упало

```bash
# Проверка приложения
pm2 status
pm2 restart yourdomain-app
```

### Мониторинг и безопасность

#### Настройка базового мониторинга

```bash
# Установка htop для мониторинга ресурсов
sudo apt install htop

# Настройка логротации
sudo nano /etc/logrotate.d/yourdomain
```

Добавьте:

```
/var/www/yourdomain.com/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

#### Базовая безопасность

```bash
# Изменение SSH порта
sudo nano /etc/ssh/sshd_config
# Измените Port 22 на другой номер

# Отключение root логина по SSH
# PermitRootLogin no

# Перезапуск SSH
sudo systemctl restart sshd

# Установка fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Заключение

После выполнения всех шагов ваш сайт должен быть доступен по адресу https://yourdomain.com.

Не забудьте:

- Регулярно обновлять систему и приложение
- Делать резервные копии
- Мониторить производительность
- Обновлять SSL сертификаты (с Let's Encrypt это происходит автоматически)

Если у вас возникли проблемы, проверьте логи и используйте команды диагностики, указанные в разделе "Проверка и устранение неполадок".
