# Kompletní návod na deployment webu Divadlo Studna

Tento návod vás provede krok za krokem od nuly až po funkční web na vlastní doméně.

---

## Přehled kroků

1. [Přehled architektury](#1-přehled-architektury)
2. [Vytvoření SSH klíče](#2-vytvoření-ssh-klíče)
3. [Nastavení GitHub Secrets](#3-nastavení-github-secrets)
4. [Příprava VPS serveru](#4-příprava-vps-serveru)
5. [Nastavení DNS](#5-nastavení-dns)
6. [Spuštění deploye](#6-spuštění-deploye)
7. [Ověření funkčnosti](#7-ověření-funkčnosti)
8. [Řešení problémů](#8-řešení-problémů)

---

## 1. Přehled architektury

### Technologie
- **Frontend/Backend:** Next.js 14 (standalone mode)
- **Databáze:** SQLite (přes Prisma ORM)
- **Autentizace:** NextAuth.js
- **Process Manager:** PM2
- **Web Server:** Nginx (reverse proxy)
- **SSL:** Let's Encrypt (Certbot)

### Deployment flow
```
Push na GitHub main → GitHub Actions build → SCP na VPS → PM2 restart
```

### Struktura na VPS
```
/var/www/divadlostudna.cz/
├── standalone/          # Next.js aplikace
│   ├── .next/
│   ├── public/
│   ├── server.js
│   ├── .env
│   └── ecosystem.config.js
├── data/                # SQLite databáze (persistentní)
│   └── database.db
└── logs/                # Nginx logy
```

---

## 2. Vytvoření SSH klíče

SSH klíč umožňuje GitHub Actions bezpečně nahrát soubory na VPS.

### Na Windows (PowerShell nebo Git Bash)

**Krok 1:** Otevřete PowerShell nebo Git Bash

**Krok 2:** Vygenerujte SSH klíč:
```bash
ssh-keygen -t ed25519 -f $HOME/.ssh/github_deploy -C "github-deploy" -N ""
```

**Krok 3:** Zobrazí se:
```
Generating public/private ed25519 key pair.
Your identification has been saved in C:/Users/VAŠE_JMÉNO/.ssh/github_deploy
Your public key has been saved in C:/Users/VAŠE_JMÉNO/.ssh/github_deploy.pub
```

**Krok 4:** Zobrazte VEŘEJNÝ klíč (tento půjde na VPS):
```bash
cat $HOME/.ssh/github_deploy.pub
```
Výstup:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-deploy
```
**Zkopírujte celý tento řádek - budete ho potřebovat v kroku 4.**

**Krok 5:** Zobrazte PRIVÁTNÍ klíč (tento půjde do GitHub Secret):
```bash
cat $HOME/.ssh/github_deploy
```
Výstup:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAA...
-----END OPENSSH PRIVATE KEY-----
```
**Zkopírujte CELÝ výstup včetně BEGIN a END řádků.**

---

## 3. Nastavení GitHub Secrets

GitHub Secrets jsou tajné údaje pro automatický deploy.

### 3.1 Otevření nastavení secrets

1. Otevřete repozitář: **https://github.com/LucaBras1/divadlo-studna-web**
2. Klikněte na záložku **Settings** (nahoře)
3. V levém menu: **Security** → **Secrets and variables** → **Actions**

### 3.2 Přidání secrets

Pro každý secret:
1. Klikněte **New repository secret**
2. Vyplňte **Name** a **Secret**
3. Klikněte **Add secret**

### 3.3 Seznam všech secrets

| Name | Hodnota | Kde získat |
|------|---------|------------|
| `VPS_HOST` | IP adresa VPS | E-mail od VPS Centrum nebo administrace |
| `VPS_USER` | `root` | Obvykle root, případně jiný SSH uživatel |
| `VPS_PORT` | `22` | Standardní SSH port |
| `VPS_SSH_KEY` | Privátní klíč z kroku 2.5 | Celý obsah včetně BEGIN/END |
| `NEXTAUTH_SECRET` | Náhodný string | Viz níže |

### 3.4 Vygenerování NEXTAUTH_SECRET

V PowerShell nebo Git Bash:
```bash
openssl rand -base64 32
```
Nebo použijte: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

Výstup (příklad): `K7gNjP2mX9rQ1sT4vW6yZ8aB3cD5eF0hI2jL4kM6nO8=`

### 3.5 Kontrola - máte všechny secrets?

Po dokončení byste měli vidět:
- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`
- `NEXTAUTH_SECRET`

---

## 4. Příprava VPS serveru

### 4.1 Připojení k VPS

```bash
ssh root@VAS_VPS_HOST
```

Při prvním připojení napište `yes` pro potvrzení.

### 4.2 Přidání SSH klíče na VPS

```bash
# Vytvoření složky (pokud neexistuje)
mkdir -p ~/.ssh

# Otevření souboru
nano ~/.ssh/authorized_keys
```

**V editoru nano:**
1. Vložte VEŘEJNÝ klíč z kroku 2.4
2. `Ctrl+O` → uložit
3. `Enter` → potvrdit
4. `Ctrl+X` → zavřít

**Nastavte oprávnění:**
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 4.3 Stažení a spuštění setup scriptu

```bash
# Stažení
wget https://raw.githubusercontent.com/LucaBras1/divadlo-studna-web/main/setup-vps.sh

# Oprávnění
chmod +x setup-vps.sh

# Spuštění
sudo ./setup-vps.sh
```

**Co script udělá:**
- Vytvoří strukturu složek
- Nainstaluje Node.js 20
- Nainstaluje PM2
- Nakonfiguruje Nginx
- Nainstaluje Certbot
- Nastaví firewall
- Vytvoří .env template

### 4.4 Konfigurace .env na VPS

```bash
nano /var/www/divadlostudna.cz/standalone/.env
```

Upravte hodnoty:

```env
# Database
DATABASE_URL=file:/var/www/divadlostudna.cz/data/database.db

# NextAuth
NEXTAUTH_URL=https://divadlostudna.muzx.cz
NEXTAUTH_SECRET=VÁŠ_VYGENEROVANÝ_SECRET

# Site URL
NEXT_PUBLIC_SITE_URL=https://divadlostudna.muzx.cz

# SMTP (volitelné - lze nakonfigurovat v admin panelu)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=

# Cron security
CRON_SECRET=NÁHODNÝ_STRING_PRO_CRON

# Node
NODE_ENV=production
PORT=3000
```

Uložte: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 5. Nastavení DNS

### 5.1 Přidání A záznamu

V administraci VPS Centrum nebo u registrátora domény přidejte:

| Typ | Název | Hodnota | TTL |
|-----|-------|---------|-----|
| A | divadlostudna.muzx.cz | IP_VAŠEHO_VPS | 3600 |

**Poznámka:** DNS propagace může trvat až 24 hodin (obvykle méně).

### 5.2 Ověření DNS

```bash
ping divadlostudna.muzx.cz
```

Mělo by vrátit IP adresu vašeho VPS.

### 5.3 Získání SSL certifikátu

Na VPS spusťte:

```bash
sudo certbot --nginx -d divadlostudna.muzx.cz
```

**Průvodce:**
1. Zadejte e-mail (pro upozornění o expiraci)
2. Souhlaste s podmínkami: `Y`
3. Sdílení e-mailu: `N` (volitelné)

Certbot automaticky nakonfiguruje HTTPS.

### 5.4 Restart Nginx

```bash
sudo systemctl restart nginx
```

---

## 6. Spuštění deploye

### 6.1 Automatický deploy

Deploy se spustí automaticky při každém push do `main` větve.

### 6.2 Ruční spuštění

1. Jděte na: **https://github.com/LucaBras1/divadlo-studna-web/actions**
2. Klikněte na **Deploy to VPS**
3. Klikněte **Run workflow** → **Run workflow**

### 6.3 Sledování průběhu

- Zelená fajfka = úspěch
- Červený křížek = chyba (klikněte pro detaily)

---

## 7. Ověření funkčnosti

### 7.1 Kontrola webu

Otevřete v prohlížeči:
- **https://divadlostudna.muzx.cz**

### 7.2 Kontrola na VPS

```bash
# Status aplikace
pm2 status

# Logy aplikace
pm2 logs divadlo-studna

# Status Nginx
sudo systemctl status nginx
```

### 7.3 Test admin přístupu

1. Jděte na **https://divadlostudna.muzx.cz/admin**
2. Přihlaste se (první uživatel se vytvoří automaticky nebo přes seed)

### 7.4 Test SSL

Navštivte: **https://www.ssllabs.com/ssltest/analyze.html?d=divadlostudna.muzx.cz**

---

## 8. Řešení problémů

### GitHub Actions selhává

**Příčina:** Chybějící nebo špatné secrets

**Řešení:**
1. Zkontrolujte všechny secrets v GitHub
2. Ověřte, že SSH klíč je správně nakopírovaný (včetně BEGIN/END)

### Web se nezobrazuje (502 Bad Gateway)

**Příčina:** Aplikace neběží

**Řešení na VPS:**
```bash
pm2 status
cd /var/www/divadlostudna.cz/standalone
pm2 start ecosystem.config.js
pm2 logs divadlo-studna
```

### Databázové chyby

**Příčina:** Chybějící migrace nebo databáze

**Řešení na VPS:**
```bash
cd /var/www/divadlostudna.cz/standalone
npx prisma migrate deploy
npx prisma db push
```

### SSL certifikát nefunguje

**Řešení:**
```bash
sudo certbot --nginx -d divadlostudna.muzx.cz
sudo systemctl restart nginx
```

### Permission denied při SSH

**Řešení:**
```bash
# Na VPS
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## Checklist před spuštěním

### GitHub Secrets
- [ ] `VPS_HOST` nastaveno
- [ ] `VPS_USER` nastaveno
- [ ] `VPS_PORT` nastaveno
- [ ] `VPS_SSH_KEY` nastaveno
- [ ] `NEXTAUTH_SECRET` nastaveno

### VPS Server
- [ ] SSH klíč přidán do authorized_keys
- [ ] setup-vps.sh proběhl úspěšně
- [ ] .env soubor nakonfigurován
- [ ] DNS A záznam směřuje na VPS
- [ ] SSL certifikát nainstalován

### Deploy
- [ ] GitHub Actions workflow proběhl úspěšně
- [ ] Web dostupný na HTTPS
- [ ] Admin panel funkční

---

## Údržba

### Aktualizace aplikace
```bash
# Na VPS
cd /var/www/divadlostudna.cz/standalone
pm2 restart divadlo-studna
```

### Záloha databáze
```bash
cp /var/www/divadlostudna.cz/data/database.db /backup/database_$(date +%Y%m%d).db
```

### Obnovení SSL certifikátu
Certbot automaticky obnovuje certifikáty. Pro ruční obnovení:
```bash
sudo certbot renew
```

### Logy
```bash
# Aplikace
pm2 logs divadlo-studna

# Nginx
tail -f /var/www/divadlostudna.cz/logs/error.log
```

---

## Kontakty pro podporu

- **VPS Centrum:** https://www.vas-server.cz/podpora
- **GitHub Issues:** https://github.com/LucaBras1/divadlo-studna-web/issues
