# Дизайн Спецификация: Gradient Modern UI

**Дата:** 2026-02-15  
**Проект:** Political CRM - UI Подобрение  
**Дизайн Подход:** Gradient Modern

## Общ преглед

Създаване на модерна, динамична дизайн система за Political CRM приложението с градиентна цветова палитра и студени цветове (синьо, лилаво, зелено).

## Цветова Палитра

### Основни Градиенти
- **Primary Gradient:** `linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)` - бутони, хедъри, основни акценти
- **Secondary Gradient:** `linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)` - специални CTA, важни действия
- **Text Gradient:** `linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)` - заглавия с ефект

### Функционални Цветове
- **Success/Active:** `#14B8A6` (Teal) - активен статус, успешни действия
- **Warning:** `#F59E0B` (Amber) - предупреждения
- **Error:** `#EF4444` (Red) - грешки, неактивен статус

### Неутрални Цветове
- **Background Light:** `#F0F9FF` - основен фон на страницата
- **Background Card:** `#FFFFFF` - карти, контейнери
- **Text Primary:** `#1E293B` (Slate 800) - основен текст
- **Text Secondary:** `#64748B` (Slate 500) - вторичен текст, етикети
- **Border:** `#E2E8F0` (Slate 200) - рамки, разделители

## Типография

### Шрифт
- **Семейство:** Inter (вече наличен чрез Geist от Next.js)
- **Заглавия:** Semibold (600), tight letter-spacing (-0.025em)
- **Текст:** Regular (400)

### Размери
- **H1:** 2rem (32px) - главни заглавия с градиентен текст
- **H2:** 1.5rem (24px) - секционни заглавия
- **H3:** 1.25rem (20px) - подзаглавия в карти
- **Body:** 1rem (16px) - основен текст
- **Small:** 0.875rem (14px) - етикети, мета информация
- **XS:** 0.75rem (12px) - баджове, статуси

## Компоненти

### 1. Layout

#### Header (Sticky)
- Градиентен фон: `bg-gradient-to-r from-blue-600 to-purple-600`
- Текст: бял
- Height: 64px
- Shadow при скрол: `shadow-lg`
- Съдържа: лого/име на приложението, навигация, потребителско меню

#### Sidebar (опционално)
- Фон: бял с дясна граница
- Ширина: 240px
- Активен линк: градиентен ляв border + лек фон

### 2. Person Card

```
Структура:
┌─────────────────────────────────────┐
│  ┌─────┐  [Роля Badge]             │
│  │Фото │                           │
│  └─────┘  Име                       │
│           #ID                       │
│  ─────────────────────────────────  │
│  📍 Град                            │
│  📱 Телефон                         │
│  ✉️ Имейл                          │
│  ─────────────────────────────────  │
│  [Виж профил →]    [🟢 Активен]    │
└─────────────────────────────────────┘
```

**Стил:**
- Фон: бял
- Рамка: `border border-slate-200`
- Сенки: `shadow-lg`
- Заобляне: `rounded-2xl` (16px)
- Padding: 24px
- Hover: `shadow-xl translateY(-4px)` transition 300ms

**Аватар:**
- Размер: 64x64px
- Заобляне: кръгъл
- Граница: градиентен ring (3px) вместо обикновен border
- Placeholder: градиентен фон с икона

**Роля Badge:**
- Фон: градиентен
- Текст: бял
- Padding: 4px 12px
- Заобляне: `rounded-full`

**Статус Индикатор:**
- Активен: `#14B8A6` (зелен)
- Неактивен: `#94A3B8` (сив)

### 3. Filter Bar

**Стил:**
- Фон: `bg-white/80 backdrop-blur-md`
- Рамка: `border border-slate-200`
- Сенки: `shadow-md`
- Заобляне: `rounded-2xl`
- Padding: 16px
- Gap между елементи: 12px

**Input Полета:**
- Фон: `bg-slate-50`
- Рамка: `border-slate-200`
- Focus: `ring-2 ring-blue-500 border-blue-500`
- Икони: градиентни (синьо → лилаво)

### 4. Бутони

#### Primary Button
```
BG: gradient (blue → purple)
Text: white
Padding: 12px 24px
Border-radius: rounded-full (9999px)
Shadow: shadow-md
Hover: brightness-110 + shadow-lg
Transition: all 200ms
```

#### Secondary Button
```
BG: white
Border: 2px gradient (blue → purple)
Text: gradient (blue → purple)
Padding: 12px 24px
Border-radius: rounded-full
Hover: bg-slate-50
```

#### Icon Button
```
Size: 40x40px
BG: transparent or white
Border-radius: rounded-xl
Hover: bg-slate-100
```

### 5. Таблица/Списък

- Хедър ред: `bg-gradient-to-r from-blue-50 to-purple-50`
- Редове: бели с hover `bg-slate-50`
- Граници: хоризонтални линии `border-slate-200`
- Активен ред: ляв border gradient

## Анимации и Transitions

### Hover Effects
- Карти: `transform: translateY(-4px)` + `shadow-xl`
- Бутони: `brightness(1.1)` + `scale(1.02)`
- Линкове: цвят промяна с transition

### Transitions
- Стандартна продължителност: 200-300ms
- Easing: `ease-out` или `cubic-bezier(0.4, 0, 0.2, 1)`

### Loading States
- Skeleton скелети с градиентен shimmer ефект
- Spinners в градиентни цветове

## Responsive Breakpoints

- **Mobile:** < 640px - една колона, компактен layout
- **Tablet:** 640px - 1024px - две колони
- **Desktop:** > 1024px - три/четири колони

## Страници за Имплементация

1. **Home Page** - нова начална страница с dashboard overview
2. **Directory Page** - подобрена картотека с новите компоненти
3. **Person Detail Page** - детайлна страница за човек
4. **Layout** - общ layout с header и навигация

## CSS Класове (Tailwind)

```css
/* Градиенти */
.gradient-primary { @apply bg-gradient-to-r from-blue-600 to-purple-600; }
.gradient-text { @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent; }

/* Карти */
.card { @apply bg-white rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1; }

/* Бутони */
.btn-primary { @apply px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:brightness-110; }

/* Input */
.input-gradient-icon { @apply text-blue-600; }
```

## Допълнителни Забележки

- Използвай CSS custom properties за цветове, за лесна поддръжка
- Поддържай dark mode като бъдеща възможност
- Всички градиенти да са 135° за консистентност
- Тествай контраста за accessibility (WCAG AA)
