# GitHub Actions Setup pro VertiGo-SaaS

Tento dokument popisuje nastavení automatického deploymentu pomocí GitHub Actions.

## Předpoklady

1. Server je připraven pomocí `00-initial-server-setup.sh`
2. Aplikace jsou nasazeny a běží
3. SSL certifikáty jsou vydány

## Krok 1: Vytvoření SSH klíče pro deployment

Na serveru (root@dvi12.vas-server.cz):

```bash
# Vytvořit SSH klíč specificky pro GitHub Actions
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "github-actions-deploy"

# Přidat veřejný klíč do authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Nastavit správná oprávnění
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_deploy

# Zobrazit privátní klíč (zkopírujte do GitHub Secrets)
cat ~/.ssh/github_deploy
```

## Krok 2: Přidání Secrets do GitHub

1. Jděte do repozitáře na GitHubu: https://github.com/LucaBras1/VertiGo-SaaS
2. Klikněte na **Settings** → **Secrets and variables** → **Actions**
3. Klikněte na **New repository secret**

### Povinné secrets:

| Secret Name | Description | Hodnota |
|-------------|-------------|---------|
| `VPS_SSH_KEY` | Privátní SSH klíč | Obsah souboru `~/.ssh/github_deploy` |

### Volitelné secrets (pro notifikace):

| Secret Name | Description |
|-------------|-------------|
| `SLACK_WEBHOOK_URL` | URL pro Slack notifikace |
| `DISCORD_WEBHOOK_URL` | URL pro Discord notifikace |

## Krok 3: Ověření

Po nastavení secrets:

1. Proveďte jakoukoliv změnu v kódu
2. Pushněte do `main` branch
3. Sledujte záložku **Actions** na GitHubu

## Workflow vysvětlení

Soubor `.github/workflows/deploy.yml` obsahuje:

### Build Job
- Checkout kódu
- Instalace Node.js a pnpm
- Instalace dependencies
- Type check
- Build všech aplikací
- Spuštění testů

### Deploy Job
- SSH připojení k serveru
- Git pull
- Instalace dependencies
- Prisma generate a migrace
- Build
- PM2 reload

## Manuální spuštění

Workflow lze spustit i manuálně:

1. Jděte na **Actions** → **Deploy to Production**
2. Klikněte na **Run workflow**
3. Vyberte typ deploymentu:
   - `full` - Kompletní deployment (default)
   - `quick` - Rychlý restart bez buildu

## Troubleshooting

### SSH připojení selhává

```bash
# Na serveru zkontrolujte logy
tail -f /var/log/auth.log

# Ověřte oprávnění
ls -la ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Build selhává

```bash
# Na serveru zkontrolujte PM2 logy
pm2 logs --lines 100

# Zkontrolujte dostupnou paměť
free -h

# Zkontrolujte místo na disku
df -h
```

### Prisma migrace selhává

```bash
# SSH na server
ssh root@dvi12.vas-server.cz

# Přejděte do projektu
cd /var/www/vertigo-saas

# Zkontrolujte připojení k DB
cd packages/database
pnpm prisma db pull

# Nebo resetujte a pushněte schema
pnpm prisma db push --force-reset
```

## Rollback

Pro rollback na předchozí verzi:

```bash
ssh root@dvi12.vas-server.cz
cd /var/www/vertigo-saas

# Zobrazit historii commitů
git log --oneline -10

# Vrátit se na konkrétní commit
git checkout [COMMIT_HASH]

# Rebuild
pnpm install
pnpm run build
pm2 reload all
```

## Bezpečnostní poznámky

- SSH klíč pro deployment by měl být **bez passphrase**
- Klíč by měl mít **minimální oprávnění** (pouze pro tento repozitář)
- Nikdy neukládejte secrets přímo v kódu
- Secrets v GitHub jsou šifrovány a nelze je zobrazit po uložení
