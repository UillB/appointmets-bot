# TWA Components Documentation

## Обзор

Набор компонентов для оптимизации Angular приложения для Telegram Web App (TWA). Компоненты обеспечивают мобильную оптимизацию и интеграцию с Telegram Web App API.

## Компоненты

### 1. TwaBaseComponent

Базовый компонент-обертка для TWA страниц.

**Использование:**
```typescript
<app-twa-base>
  <!-- Ваш контент -->
</app-twa-base>
```

**Особенности:**
- Автоматическое определение Telegram Web App
- Поддержка тем Telegram (светлая/темная)
- Универсальный хедер с датой/временем
- Индикатор статуса TWA
- Загрузочные состояния

### 2. TwaMobileCardComponent

Мобильная карточка для отображения данных.

**Использование:**
```typescript
<app-twa-mobile-card
  [title]="'Заголовок'"
  [subtitle]="'Подзаголовок'"
  [icon]="'build'"
  [status]="'active'"
  [content]="contentArray"
  [actions]="actionsArray"
  (cardClick)="onCardClick()"
  (actionClick)="onActionClick($event)">
</app-twa-mobile-card>
```

**Входные параметры:**
- `title`: Заголовок карточки
- `subtitle`: Подзаголовок
- `icon`: Иконка (Material Icons)
- `iconClass`: CSS класс для иконки
- `status`: Статус карточки
- `content`: Массив контента для отображения
- `actions`: Массив действий
- `footer`: Текст в футере

### 3. TwaListComponent

Компонент для отображения списков с мобильной оптимизацией.

**Использование:**
```typescript
<app-twa-list
  [title]="'Список услуг'"
  [items]="services"
  [loading]="loading"
  [filters]="filterOptions"
  [showCreateButton]="true"
  (itemClick)="onItemClick($event)"
  (createClick)="onCreateClick()">
</app-twa-list>
```

**Входные параметры:**
- `title`: Заголовок списка
- `subtitle`: Подзаголовок
- `items`: Массив элементов
- `loading`: Состояние загрузки
- `filters`: Массив фильтров
- `showCreateButton`: Показать кнопку создания
- `showLoadMore`: Показать кнопку "Загрузить еще"

### 4. TwaNavigationComponent

Навигационный компонент для TWA.

**Использование:**
```typescript
<app-twa-navigation
  [navItems]="navigationItems"
  [showFab]="true"
  [showBackButton]="true"
  (navItemClick)="onNavClick($event)"
  (backClick)="onBackClick()">
</app-twa-navigation>
```

**Входные параметры:**
- `navItems`: Массив элементов навигации
- `showNavBar`: Показать навигационную панель
- `showFab`: Показать плавающую кнопку действия
- `showBackButton`: Показать кнопку "Назад"

## Примеры использования

### Создание TWA страницы услуг

```typescript
@Component({
  template: `
    <app-twa-base>
      <app-twa-list
        [title]="'Услуги'"
        [items]="services"
        [loading]="loading"
        [showCreateButton]="true"
        (itemClick)="onServiceClick($event)"
        (createClick)="onCreateService()">
      </app-twa-list>

      <app-twa-navigation
        [navItems]="navItems"
        (navItemClick)="onNavClick($event)">
      </app-twa-navigation>
    </app-twa-base>
  `
})
export class ServicesTwaComponent {
  services = [
    {
      title: 'Консультация',
      subtitle: 'Организация',
      icon: 'build',
      status: 'active',
      content: [
        { icon: 'schedule', text: '5 слотов' },
        { icon: 'event', text: '12 записей' }
      ],
      actions: [
        { text: 'Просмотр', icon: 'visibility', action: 'view' },
        { text: 'Редактировать', icon: 'edit', action: 'edit' }
      ]
    }
  ];

  navItems = [
    { id: 'dashboard', label: 'Главная', icon: 'dashboard' },
    { id: 'services', label: 'Услуги', icon: 'build', active: true }
  ];
}
```

## Стилизация

### CSS переменные для тем

```css
.twa-container.telegram-theme {
  --primary-color: var(--tg-theme-button-color, #0088cc);
  --text-color: var(--tg-theme-text-color, #000);
  --bg-color: var(--tg-theme-bg-color, #ffffff);
  --secondary-bg-color: var(--tg-theme-secondary-bg-color, #f8f9fa);
}
```

### Мобильная оптимизация

Все компоненты автоматически адаптируются под мобильные устройства:

```css
@media (max-width: 768px) {
  .twa-mobile-card {
    padding: 12px;
    margin-bottom: 12px;
  }
}
```

## Интеграция с Telegram Web App

### Инициализация

```typescript
constructor(private telegramWebAppService: TelegramWebAppService) {}

ngOnInit() {
  this.isInTelegram = this.telegramWebAppService.isInTelegram;
  this.currentUser = this.telegramWebAppService.currentUser;
}
```

### Обработка событий

```typescript
@HostListener('window:universal-refresh')
onUniversalRefresh() {
  // Обновление данных при нажатии кнопки обновления
  this.loadData();
}
```

## Лучшие практики

1. **Используйте TwaBaseComponent** как обертку для всех TWA страниц
2. **Настройте навигацию** с помощью TwaNavigationComponent
3. **Используйте мобильные карточки** для отображения данных
4. **Обрабатывайте события** универсального обновления
5. **Тестируйте на реальных мобильных устройствах**

## Отладка

Для отладки TWA компонентов:

```typescript
console.log('TWA Status:', this.telegramWebAppService.isInTelegram);
console.log('User Data:', this.telegramWebAppService.currentUser);
console.log('Theme:', this.telegramWebAppService.theme);
```
