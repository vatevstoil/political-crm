# GitHub Workflow — Синхронизация между 2 компютъра

## Концепция

```
Компютър 1 (разработка)          GitHub                Компютър 2 (данни)
─────────────────────            ──────            ─────────────────────
Пишеш код                          │               Работиш с базата данни
git push ──────────────────────→   │   git pull ←── Изтегляш нови функции
                                   │
  prisma/dev.db НЕ се качва ───────X
```

**Правило:** Само кодът пътува през GitHub. Данните (`dev.db`) остават локални.

---

## Компютър 1 — Разработка

### Ежедневен workflow

```bash
# Работиш по кода...

# Качване в GitHub
PUSH-TO-GITHUB.bat
# Пита те за описание на промяната
# git add -A → git commit → git push
```

### Ако работиш без .bat

```bash
cd political-crm
git add -A
git commit -m "feat: описание на промяната"
git push
```

### Добри commit messages

```bash
feat: нова функция за импорт от PDF
fix: поправка на търсене с кирилица
docs: обновена документация
refactor: изчистване на DirectoryClient
style: dark mode fixes за профилната страница
```

---

## Компютър 2 — Обновяване

### При нови функции

```bash
# Стоп на сървъра (Ctrl+C)

PULL-UPDATES.bat
# Автоматично:
#   git pull
#   npm install (само ако има нови пакети)
#   npx prisma migrate deploy (само ако има schema промени)

# Стартиране на сървъра
cd political-crm
npm run dev:test
```

### Ако `PULL-UPDATES.bat` не е наличен

```bash
cd political-crm
git pull
npm install          # само ако package.json е променен
npx prisma migrate deploy  # само ако schema.prisma е променен
npx prisma generate  # само ако schema.prisma е променен
npm run dev:test
```

---

## Компютър 2 — Начална настройка (еднократно)

### Автоматично

```bash
# От папката на Организацията (не political-crm!)
SETUP-COMPUTER2.bat
```

### Ръчно

```bash
# 1. Клониране
git clone https://github.com/vatevstoil/political-crm.git
cd political-crm

# 2. Инсталиране
npm install

# 3. Prisma
npx prisma generate

# 4. Копиране на базата данни (ВЕДНЪЖ от Компютър 1)
# Копирай: political-crm/prisma/dev.db → политически-crm/prisma/dev.db

# 5. Стартиране
npm run dev:test
```

---

## Копиране на базата данни

### USB метод

```
Компютър 1: political-crm\prisma\dev.db
→ USB флашка
→ Компютър 2: political-crm\prisma\dev.db
```

### Мрежа (ако са в една мрежа)

```powershell
# От Компютър 1 — сподели папката или използвай:
net share CRM=J:\Antigraviti\Organization\political-crm\prisma

# На Компютър 2:
copy \\COMPUTER1\CRM\dev.db C:\CRM\political-crm\prisma\dev.db
```

### Кога трябва да копираш базата?

| Ситуация | Нужно ли е копиране? |
|----------|---------------------|
| Нова схема (миграция) | **НЕ** — `prisma migrate deploy` я обновява |
| Нови данни въведени на Компютър 1 | **ДА** — данните не се синхронизират |
| Загубена база на Компютър 2 | **ДА** |
| Само код промени (UI, логика) | **НЕ** |

---

## Ако има конфликт (рядко)

```bash
# На Компютър 2 — ако има локални промени в кода
git stash          # запази временно
git pull           # изтегли новото
git stash pop      # върни временните промени
```

---

## Структура на файловете

```
J:\Antigraviti\Organization\
├── political-crm\               ← Основен проект
│   ├── PUSH-TO-GITHUB.bat       ← Компютър 1: качи в GitHub
│   ├── PULL-UPDATES.bat         ← Компютър 2: изтегли обновления
│   ├── prisma\
│   │   └── dev.db               ← НЕ в GitHub! Копира се ръчно.
│   └── ...
└── SETUP-COMPUTER2.bat          ← Компютър 2: еднократна настройка
```

---

## GitHub репо

- **URL:** https://github.com/vatevstoil/political-crm
- **Видимост:** Private
- **Клон:** main
- **Акаунт:** vatevstoil

---

## Проверка на синхронизацията

```bash
# Виж последните commits
git log --oneline -5

# Виж разлика с GitHub
git fetch
git status

# Виж кои файлове са се променили в последния pull
git diff HEAD@{1} HEAD --name-only
```
