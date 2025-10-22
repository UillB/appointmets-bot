import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'ru' | 'he';

export interface Translations {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<Language>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: { [lang in Language]: Translations } = {
    en: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.appointments': 'Appointments',
      'nav.services': 'Services',
      'nav.organizations': 'Organizations',
      'nav.botManagement': 'Bot Management',
      'nav.slots': 'Slots',
      'nav.settings': 'Settings',
      
      // Dashboard
      'dashboard.welcome': 'Welcome back',
      'dashboard.refresh': 'Refresh',
      'dashboard.stats.totalAppointments': 'Total Appointments',
      'dashboard.stats.todayAppointments': 'Today\'s Appointments',
      'dashboard.stats.weekAppointments': 'This Week',
      'dashboard.stats.pendingAppointments': 'Pending',
      'dashboard.stats.totalServices': 'Total Services',
      'dashboard.stats.activeServices': 'Active Services',
      'dashboard.stats.totalRevenue': 'Total Revenue',
      'dashboard.stats.todayRevenue': 'Today\'s Revenue',
      
      // Dashboard Quick Access
      'dashboard.quickAccess.appointments.title': 'Appointments',
      'dashboard.quickAccess.appointments.description': 'Manage bookings',
      'dashboard.quickAccess.services.title': 'Services',
      'dashboard.quickAccess.services.description': 'Configure offerings',
      'dashboard.quickAccess.organizations.title': 'Organizations',
      'dashboard.quickAccess.organizations.description': 'Manage locations',
      'dashboard.quickAccess.settings.title': 'Settings',
      'dashboard.quickAccess.settings.description': 'System configuration',
      'dashboard.quickAccess.today': 'today',
      'dashboard.quickAccess.available': 'available',
      'dashboard.quickAccess.active': 'active',
      'dashboard.quickAccess.account': 'Account',
      
      // Dashboard Statistics
      'dashboard.statistics.title': 'Statistics & Overview',
      'dashboard.statistics.viewAll': 'View All',
      'dashboard.statistics.totalAppointments': 'Total Appointments',
      'dashboard.statistics.todayBookings': 'Today\'s Bookings',
      'dashboard.statistics.pendingApprovals': 'Pending Approvals',
      'dashboard.statistics.activeServices': 'Active Services',
      'dashboard.statistics.thisWeek': 'for this week',
      'dashboard.statistics.scheduledToday': 'Scheduled for today',
      'dashboard.statistics.awaitingConfirmation': 'Awaiting confirmation',
      'dashboard.statistics.availableForBooking': 'Available for booking',
      
      // Dashboard Calendar
      'dashboard.calendar.title': 'Calendar',
      
      // Dashboard Appointments
      'dashboard.appointments.newAppointment': 'New Appointment',
      'dashboard.appointments.noAppointments': 'No appointments scheduled',
      
      // Calendar
      'calendar.appointments': 'Appointments',
      'calendar.noAppointments': 'No appointments for this date',
      'calendar.recentAppointments': 'Recent Appointments',
      
      // Actions
      'actions.bookAppointment': 'Book Appointment',
      'actions.viewSlots': 'View Slots',
      'actions.manageServices': 'Manage Services',
      'actions.settings': 'Settings',
      'actions.quickActions': 'Quick Actions',
      
      // Status
      'status.confirmed': 'Confirmed',
      'status.pending': 'Pending',
      'status.cancelled': 'Cancelled',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.clear': 'Clear',
      'common.view': 'View',
      'common.create': 'Create',
      'common.update': 'Update',
      'common.minutes': 'minutes',
      'common.online': 'Online',
      'common.all': 'All',
      'common.actions': 'Actions',
      
      // User
      'user.profile': 'Profile',
      'user.logout': 'Logout',
      'user.organization': 'Organization',
      
      // Theme
      'theme.light': 'Light Theme',
      'theme.dark': 'Dark Theme',
      'theme.auto': 'Auto',
      'theme.toggle': 'Toggle Theme',
      
      // Organizations
      'organizations.title': 'Organizations',
      'organizations.subtitle': 'Manage your organizations and their settings',
      'organizations.create': 'Create Organization',
      'organizations.edit': 'Edit Organization',
      'organizations.name': 'Organization Name',
      'organizations.avatar': 'Avatar URL',
      'organizations.avatarHint': 'Enter a URL to an image for the organization avatar',
      'organizations.avatarPreview': 'Avatar Preview',
      'organizations.users': 'Users',
      'organizations.services': 'Services',
      'organizations.created': 'Created',
      'organizations.empty.title': 'No Organizations',
      'organizations.empty.message': 'You don\'t have any organizations yet. Create your first organization to get started.',
      'organizations.noUsers': 'No users in this organization',
      'organizations.noServices': 'No services in this organization',
      
      // Services
      'services.title': 'Services',
      'services.subtitle': 'Manage your services and their settings',
      'services.create': 'Create Service',
      'services.edit': 'Edit Service',
      'services.name': 'Service Name',
      'services.nameRu': 'Service Name (Russian)',
      'services.nameEn': 'Service Name (English)',
      'services.nameHe': 'Service Name (Hebrew)',
      'services.description': 'Description',
      'services.descriptionRu': 'Description (Russian)',
      'services.descriptionEn': 'Description (English)',
      'services.descriptionHe': 'Description (Hebrew)',
      'services.duration': 'Duration',
      'services.durationMin': 'Duration (minutes)',
      'services.organization': 'Organization',
      'services.slots': 'Time Slots',
      'services.appointments': 'Appointments',
      'services.created': 'Created',
      'services.empty.title': 'No Services',
      'services.empty.message': 'You don\'t have any services yet. Create your first service to get started.',
      'services.noSlots': 'No time slots for this service',
      'services.noAppointments': 'No appointments for this service',
      'services.durationFormat': '{hours}h {minutes}m',
      'services.durationHours': '{hours}h',
      'services.durationMinutes': '{minutes}m',
      
      // Appointments
      'appointments.title': 'Appointments',
      'appointments.subtitle': 'Manage appointments and bookings',
      'appointments.create': 'New Appointment',
      
      // Appointments Summary
      'appointments.summary.total': 'All time bookings',
      'appointments.summary.confirmed': 'Successfully confirmed',
      'appointments.summary.pending': 'Awaiting confirmation',
      'appointments.summary.cancelled': 'Cancelled bookings',
      
      // Appointments Search
      'appointments.search.placeholder': 'Search by client ID or service...',
      
      // Appointments Pagination
      'appointments.pagination.showing': 'Showing',
      'appointments.pagination.of': 'of',
      'appointments.pagination.appointments': 'appointments',
      'appointments.edit': 'Edit Appointment',
      'appointments.cancel': 'Cancel Appointment',
      'appointments.details.title': 'Appointment Details',
      'appointments.details.status': 'Status',
      'appointments.details.service': 'Service',
      'appointments.details.time': 'Time',
      'appointments.details.client': 'Client',
      'appointments.details.appointmentId': 'Appointment ID',
      'appointments.details.serviceName': 'Service Name',
      'appointments.details.description': 'Description',
      'appointments.details.duration': 'Duration',
      'appointments.details.date': 'Date',
      'appointments.details.startTime': 'Start Time',
      'appointments.details.endTime': 'End Time',
      'appointments.details.chatId': 'Chat ID',
      'appointments.details.bookingDate': 'Booking Date',
      'appointments.details.id': 'ID',
      'appointments.details.slotId': 'Slot ID',
      'appointments.details.changeStatus': 'Change Status',
      'appointments.status.confirmed': 'Confirmed',
      'appointments.status.pending': 'Pending',
      'appointments.status.cancelled': 'Cancelled',
      'appointments.filters.status': 'Status',
      'appointments.filters.service': 'Service',
      'appointments.filters.date': 'Date',
      'appointments.table.id': 'ID',
      'appointments.table.service': 'Service',
      'appointments.table.datetime': 'Date & Time',
      'appointments.table.client': 'Client',
      'appointments.table.status': 'Status',
      'appointments.noData.title': 'No Appointments',
      'appointments.noData.message': 'You don\'t have any appointments yet. Create your first appointment to get started.',
      'appointments.form.steps.service': 'Service',
      'appointments.form.steps.date': 'Date & Time',
      'appointments.form.steps.client': 'Client Info',
      'appointments.form.service': 'Service',
      'appointments.form.date': 'Date',
      'appointments.form.time': 'Time',
      'appointments.form.duration': 'Duration',
      'appointments.form.chatId': 'Chat ID',
      'appointments.form.availableSlots': 'Available Time Slots',
      'appointments.form.noSlots': 'No available slots for this date',
      'appointments.form.summary': 'Appointment Summary',
      'appointments.form.create': 'Create Appointment',
      'appointments.form.errors.serviceRequired': 'Please select a service',
      'appointments.form.errors.dateRequired': 'Please select a date',
      'appointments.form.errors.chatIdRequired': 'Please enter a chat ID',
      'appointments.form.errors.chatIdInvalid': 'Chat ID must contain only numbers',
      
      // Settings
      'settings.title': 'Settings',
      'settings.subtitle': 'Manage your account and system preferences',
      'settings.profile.title': 'User Profile',
      'settings.profile.subtitle': 'Manage your personal information',
      'settings.system.title': 'System Settings',
      'settings.system.subtitle': 'Configure system preferences',
      'settings.profile.name': 'Full Name',
      'settings.profile.email': 'Email Address',
      'settings.profile.role': 'Role',
      'settings.profile.organization': 'Organization',
      'settings.profile.createdAt': 'Member Since',
      'settings.profile.lastLogin': 'Last Login',
      'settings.profile.changePassword': 'Change Password',
      'settings.profile.currentPassword': 'Current Password',
      'settings.profile.newPassword': 'New Password',
      'settings.profile.confirmPassword': 'Confirm Password',
      'settings.profile.updateProfile': 'Update Profile',
      'settings.profile.updatePassword': 'Update Password',
      'settings.system.language': 'Language',
      'settings.system.theme': 'Theme',
      'settings.system.notifications': 'Notifications',
      'settings.system.emailNotifications': 'Email Notifications',
      'settings.system.pushNotifications': 'Push Notifications',
      'settings.system.timezone': 'Timezone',
      'settings.system.dateFormat': 'Date Format',
      'settings.system.timeFormat': 'Time Format',
      'settings.system.autoRefresh': 'Auto Refresh',
      'settings.system.refreshInterval': 'Refresh Interval (seconds)',
      'settings.system.saveSettings': 'Save Settings',
      'settings.profile.success': 'Profile updated successfully',
      'settings.profile.error': 'Failed to update profile',
      'settings.password.success': 'Password updated successfully',
      'settings.password.error': 'Failed to update password',
      'settings.password.mismatch': 'Passwords do not match',
      'settings.password.weak': 'Password is too weak',
      'settings.system.success': 'Settings saved successfully',
      'settings.system.error': 'Failed to save settings'
    },
    ru: {
      // Navigation
      'nav.dashboard': 'Панель управления',
      'nav.appointments': 'Записи',
      'nav.services': 'Услуги',
      'nav.organizations': 'Организации',
      'nav.botManagement': 'Управление ботом',
      'nav.slots': 'Слоты',
      'nav.settings': 'Настройки',
      
      // Dashboard
      'dashboard.welcome': 'Добро пожаловать',
      'dashboard.refresh': 'Обновить',
      'dashboard.stats.totalAppointments': 'Всего записей',
      'dashboard.stats.todayAppointments': 'Записи на сегодня',
      'dashboard.stats.weekAppointments': 'На этой неделе',
      'dashboard.stats.pendingAppointments': 'Ожидают',
      'dashboard.stats.totalServices': 'Всего услуг',
      'dashboard.stats.activeServices': 'Активные услуги',
      'dashboard.stats.totalRevenue': 'Общий доход',
      'dashboard.stats.todayRevenue': 'Доход за сегодня',
      
      // Dashboard Quick Access
      'dashboard.quickAccess.appointments.title': 'Записи',
      'dashboard.quickAccess.appointments.description': 'Управление записями',
      'dashboard.quickAccess.services.title': 'Услуги',
      'dashboard.quickAccess.services.description': 'Настройка услуг',
      'dashboard.quickAccess.organizations.title': 'Организации',
      'dashboard.quickAccess.organizations.description': 'Управление локациями',
      'dashboard.quickAccess.settings.title': 'Настройки',
      'dashboard.quickAccess.settings.description': 'Конфигурация системы',
      'dashboard.quickAccess.today': 'сегодня',
      'dashboard.quickAccess.available': 'доступно',
      'dashboard.quickAccess.active': 'активно',
      'dashboard.quickAccess.account': 'Аккаунт',
      
      // Dashboard Statistics
      'dashboard.statistics.title': 'Статистика и обзор',
      'dashboard.statistics.viewAll': 'Посмотреть все',
      'dashboard.statistics.totalAppointments': 'Всего записей',
      'dashboard.statistics.todayBookings': 'Записи на сегодня',
      'dashboard.statistics.pendingApprovals': 'Ожидают подтверждения',
      'dashboard.statistics.activeServices': 'Активные услуги',
      'dashboard.statistics.thisWeek': 'на этой неделе',
      'dashboard.statistics.scheduledToday': 'Запланировано на сегодня',
      'dashboard.statistics.awaitingConfirmation': 'Ожидают подтверждения',
      'dashboard.statistics.availableForBooking': 'Доступно для записи',
      
      // Dashboard Calendar
      'dashboard.calendar.title': 'Календарь',
      
      // Dashboard Appointments
      'dashboard.appointments.newAppointment': 'Новая запись',
      'dashboard.appointments.noAppointments': 'Нет запланированных записей',
      
      // Calendar
      'calendar.appointments': 'Записи',
      'calendar.noAppointments': 'Нет записей на эту дату',
      'calendar.recentAppointments': 'Последние записи',
      
      // Actions
      'actions.bookAppointment': 'Записаться',
      'actions.viewSlots': 'Посмотреть слоты',
      'actions.manageServices': 'Управление услугами',
      'actions.settings': 'Настройки',
      'actions.quickActions': 'Быстрые действия',
      
      // Status
      'status.confirmed': 'Подтверждено',
      'status.pending': 'Ожидает',
      'status.cancelled': 'Отменено',
      
      // Common
      'common.loading': 'Загрузка...',
      'common.error': 'Ошибка',
      'common.save': 'Сохранить',
      'common.cancel': 'Отмена',
      'common.delete': 'Удалить',
      'common.edit': 'Редактировать',
      'common.add': 'Добавить',
      'common.search': 'Поиск',
      'common.filter': 'Фильтр',
      'common.clear': 'Очистить',
      'common.view': 'Просмотр',
      'common.create': 'Создать',
      'common.update': 'Обновить',
      'common.minutes': 'минут',
      'common.online': 'Онлайн',
      'common.all': 'Все',
      'common.actions': 'Действия',
      
      // User
      'user.profile': 'Профиль',
      'user.logout': 'Выйти',
      'user.organization': 'Организация',
      
      // Theme
      'theme.light': 'Светлая тема',
      'theme.dark': 'Темная тема',
      'theme.auto': 'Авто',
      'theme.toggle': 'Переключить тему',
      
      // Organizations
      'organizations.title': 'Организации',
      'organizations.subtitle': 'Управление организациями и их настройками',
      'organizations.create': 'Создать организацию',
      'organizations.edit': 'Редактировать организацию',
      'organizations.name': 'Название организации',
      'organizations.avatar': 'URL аватара',
      'organizations.avatarHint': 'Введите URL изображения для аватара организации',
      'organizations.avatarPreview': 'Предпросмотр аватара',
      'organizations.users': 'Пользователи',
      'organizations.services': 'Услуги',
      'organizations.created': 'Создано',
      'organizations.empty.title': 'Нет организаций',
      'organizations.empty.message': 'У вас пока нет организаций. Создайте первую организацию, чтобы начать работу.',
      'organizations.noUsers': 'В этой организации нет пользователей',
      'organizations.noServices': 'В этой организации нет услуг',
      
      // Services
      'services.title': 'Услуги',
      'services.subtitle': 'Управление услугами и их настройками',
      'services.create': 'Создать услугу',
      'services.edit': 'Редактировать услугу',
      'services.name': 'Название услуги',
      'services.nameRu': 'Название услуги (Русский)',
      'services.nameEn': 'Название услуги (Английский)',
      'services.nameHe': 'Название услуги (Иврит)',
      'services.description': 'Описание',
      'services.descriptionRu': 'Описание (Русский)',
      'services.descriptionEn': 'Описание (Английский)',
      'services.descriptionHe': 'Описание (Иврит)',
      'services.duration': 'Продолжительность',
      'services.durationMin': 'Продолжительность (минуты)',
      'services.organization': 'Организация',
      'services.slots': 'Временные слоты',
      'services.appointments': 'Записи',
      'services.created': 'Создано',
      'services.empty.title': 'Нет услуг',
      'services.empty.message': 'У вас пока нет услуг. Создайте первую услугу, чтобы начать работу.',
      'services.noSlots': 'Нет временных слотов для этой услуги',
      'services.noAppointments': 'Нет записей для этой услуги',
      'services.durationFormat': '{hours}ч {minutes}м',
      'services.durationHours': '{hours}ч',
      'services.durationMinutes': '{minutes}м',
      
      // Appointments
      'appointments.title': 'Записи',
      'appointments.subtitle': 'Управление записями и бронированием',
      'appointments.create': 'Новая запись',
      
      // Appointments Summary
      'appointments.summary.total': 'Всего записей',
      'appointments.summary.confirmed': 'Успешно подтверждены',
      'appointments.summary.pending': 'Ожидают подтверждения',
      'appointments.summary.cancelled': 'Отмененные записи',
      
      // Appointments Search
      'appointments.search.placeholder': 'Поиск по ID клиента или услуге...',
      
      // Appointments Pagination
      'appointments.pagination.showing': 'Показано',
      'appointments.pagination.of': 'из',
      'appointments.pagination.appointments': 'записей',
      'appointments.edit': 'Редактировать запись',
      'appointments.cancel': 'Отменить запись',
      'appointments.details.title': 'Детали записи',
      'appointments.details.status': 'Статус',
      'appointments.details.service': 'Услуга',
      'appointments.details.time': 'Время',
      'appointments.details.client': 'Клиент',
      'appointments.details.appointmentId': 'ID записи',
      'appointments.details.serviceName': 'Название услуги',
      'appointments.details.description': 'Описание',
      'appointments.details.duration': 'Продолжительность',
      'appointments.details.date': 'Дата',
      'appointments.details.startTime': 'Время начала',
      'appointments.details.endTime': 'Время окончания',
      'appointments.details.chatId': 'ID чата',
      'appointments.details.bookingDate': 'Дата бронирования',
      'appointments.details.id': 'ID',
      'appointments.details.slotId': 'ID слота',
      'appointments.details.changeStatus': 'Изменить статус',
      'appointments.status.confirmed': 'Подтверждено',
      'appointments.status.pending': 'Ожидает',
      'appointments.status.cancelled': 'Отменено',
      'appointments.filters.status': 'Статус',
      'appointments.filters.service': 'Услуга',
      'appointments.filters.date': 'Дата',
      'appointments.table.id': 'ID',
      'appointments.table.service': 'Услуга',
      'appointments.table.datetime': 'Дата и время',
      'appointments.table.client': 'Клиент',
      'appointments.table.status': 'Статус',
      'appointments.noData.title': 'Нет записей',
      'appointments.noData.message': 'У вас пока нет записей. Создайте первую запись, чтобы начать работу.',
      'appointments.form.steps.service': 'Услуга',
      'appointments.form.steps.date': 'Дата и время',
      'appointments.form.steps.client': 'Информация о клиенте',
      'appointments.form.service': 'Услуга',
      'appointments.form.date': 'Дата',
      'appointments.form.time': 'Время',
      'appointments.form.duration': 'Продолжительность',
      'appointments.form.chatId': 'ID чата',
      'appointments.form.availableSlots': 'Доступные временные слоты',
      'appointments.form.noSlots': 'Нет доступных слотов на эту дату',
      'appointments.form.summary': 'Сводка записи',
      'appointments.form.create': 'Создать запись',
      'appointments.form.errors.serviceRequired': 'Пожалуйста, выберите услугу',
      'appointments.form.errors.dateRequired': 'Пожалуйста, выберите дату',
      'appointments.form.errors.chatIdRequired': 'Пожалуйста, введите ID чата',
      'appointments.form.errors.chatIdInvalid': 'ID чата должен содержать только цифры',
      
      // Settings
      'settings.title': 'Настройки',
      'settings.subtitle': 'Управление аккаунтом и системными настройками',
      'settings.profile.title': 'Профиль пользователя',
      'settings.profile.subtitle': 'Управление личной информацией',
      'settings.system.title': 'Системные настройки',
      'settings.system.subtitle': 'Настройка системных предпочтений',
      'settings.profile.name': 'Полное имя',
      'settings.profile.email': 'Адрес электронной почты',
      'settings.profile.role': 'Роль',
      'settings.profile.organization': 'Организация',
      'settings.profile.createdAt': 'Участник с',
      'settings.profile.lastLogin': 'Последний вход',
      'settings.profile.changePassword': 'Изменить пароль',
      'settings.profile.currentPassword': 'Текущий пароль',
      'settings.profile.newPassword': 'Новый пароль',
      'settings.profile.confirmPassword': 'Подтвердить пароль',
      'settings.profile.updateProfile': 'Обновить профиль',
      'settings.profile.updatePassword': 'Обновить пароль',
      'settings.system.language': 'Язык',
      'settings.system.theme': 'Тема',
      'settings.system.notifications': 'Уведомления',
      'settings.system.emailNotifications': 'Уведомления по email',
      'settings.system.pushNotifications': 'Push уведомления',
      'settings.system.timezone': 'Часовой пояс',
      'settings.system.dateFormat': 'Формат даты',
      'settings.system.timeFormat': 'Формат времени',
      'settings.system.autoRefresh': 'Автообновление',
      'settings.system.refreshInterval': 'Интервал обновления (секунды)',
      'settings.system.saveSettings': 'Сохранить настройки',
      'settings.profile.success': 'Профиль успешно обновлен',
      'settings.profile.error': 'Не удалось обновить профиль',
      'settings.password.success': 'Пароль успешно обновлен',
      'settings.password.error': 'Не удалось обновить пароль',
      'settings.password.mismatch': 'Пароли не совпадают',
      'settings.password.weak': 'Пароль слишком слабый',
      'settings.system.success': 'Настройки успешно сохранены',
      'settings.system.error': 'Не удалось сохранить настройки'
    },
    he: {
      // Navigation
      'nav.dashboard': 'לוח בקרה',
      'nav.appointments': 'תורים',
      'nav.services': 'שירותים',
      'nav.organizations': 'ארגונים',
      'nav.botManagement': 'ניהול בוט',
      'nav.slots': 'חלונות זמן',
      'nav.settings': 'הגדרות',
      
      // Dashboard
      'dashboard.welcome': 'ברוכים הבאים',
      'dashboard.refresh': 'רענן',
      'dashboard.stats.totalAppointments': 'סה"כ תורים',
      'dashboard.stats.todayAppointments': 'תורים להיום',
      'dashboard.stats.weekAppointments': 'השבוע',
      'dashboard.stats.pendingAppointments': 'ממתינים',
      'dashboard.stats.totalServices': 'סה"כ שירותים',
      'dashboard.stats.activeServices': 'שירותים פעילים',
      'dashboard.stats.totalRevenue': 'סה"כ הכנסות',
      'dashboard.stats.todayRevenue': 'הכנסות להיום',
      
      // Dashboard Quick Access
      'dashboard.quickAccess.appointments.title': 'תורים',
      'dashboard.quickAccess.appointments.description': 'ניהול תורים',
      'dashboard.quickAccess.services.title': 'שירותים',
      'dashboard.quickAccess.services.description': 'הגדרת שירותים',
      'dashboard.quickAccess.organizations.title': 'ארגונים',
      'dashboard.quickAccess.organizations.description': 'ניהול מיקומים',
      'dashboard.quickAccess.settings.title': 'הגדרות',
      'dashboard.quickAccess.settings.description': 'תצורת מערכת',
      'dashboard.quickAccess.today': 'היום',
      'dashboard.quickAccess.available': 'זמין',
      'dashboard.quickAccess.active': 'פעיל',
      'dashboard.quickAccess.account': 'חשבון',
      
      // Dashboard Statistics
      'dashboard.statistics.title': 'סטטיסטיקה וסקירה',
      'dashboard.statistics.viewAll': 'הצג הכל',
      'dashboard.statistics.totalAppointments': 'סה"כ תורים',
      'dashboard.statistics.todayBookings': 'תורים להיום',
      'dashboard.statistics.pendingApprovals': 'ממתינים לאישור',
      'dashboard.statistics.activeServices': 'שירותים פעילים',
      'dashboard.statistics.thisWeek': 'השבוע',
      'dashboard.statistics.scheduledToday': 'מתוזמנים להיום',
      'dashboard.statistics.awaitingConfirmation': 'ממתינים לאישור',
      'dashboard.statistics.availableForBooking': 'זמין להזמנה',
      
      // Dashboard Calendar
      'dashboard.calendar.title': 'לוח שנה',
      
      // Dashboard Appointments
      'dashboard.appointments.newAppointment': 'תור חדש',
      'dashboard.appointments.noAppointments': 'אין תורים מתוזמנים',
      
      // Calendar
      'calendar.appointments': 'תורים',
      'calendar.noAppointments': 'אין תורים לתאריך זה',
      'calendar.recentAppointments': 'תורים אחרונים',
      
      // Actions
      'actions.bookAppointment': 'קביעת תור',
      'actions.viewSlots': 'צפייה בזמינות',
      'actions.manageServices': 'ניהול שירותים',
      'actions.settings': 'הגדרות',
      'actions.quickActions': 'פעולות מהירות',
      
      // Status
      'status.confirmed': 'אושר',
      'status.pending': 'ממתין',
      'status.cancelled': 'בוטל',
      
      // Common
      'common.loading': 'טוען...',
      'common.error': 'שגיאה',
      'common.save': 'שמור',
      'common.cancel': 'ביטול',
      'common.delete': 'מחק',
      'common.edit': 'ערוך',
      'common.add': 'הוסף',
      'common.search': 'חיפוש',
      'common.filter': 'סינון',
      'common.clear': 'נקה',
      'common.view': 'צפייה',
      'common.create': 'צור',
      'common.update': 'עדכן',
      'common.minutes': 'דקות',
      'common.online': 'מחובר',
      'common.all': 'הכל',
      'common.actions': 'פעולות',
      
      // User
      'user.profile': 'פרופיל',
      'user.logout': 'התנתק',
      'user.organization': 'ארגון',
      
      // Theme
      'theme.light': 'ערכת נושא בהירה',
      'theme.dark': 'ערכת נושא כהה',
      'theme.auto': 'אוטו',
      'theme.toggle': 'החלף ערכת נושא',
      
      // Organizations
      'organizations.title': 'ארגונים',
      'organizations.subtitle': 'ניהול ארגונים והגדרותיהם',
      'organizations.create': 'צור ארגון',
      'organizations.edit': 'ערוך ארגון',
      'organizations.name': 'שם הארגון',
      'organizations.avatar': 'כתובת תמונת פרופיל',
      'organizations.avatarHint': 'הזן כתובת תמונה לתמונת הפרופיל של הארגון',
      'organizations.avatarPreview': 'תצוגה מקדימה של תמונת הפרופיל',
      'organizations.users': 'משתמשים',
      'organizations.services': 'שירותים',
      'organizations.created': 'נוצר',
      'organizations.empty.title': 'אין ארגונים',
      'organizations.empty.message': 'אין לך ארגונים עדיין. צור את הארגון הראשון שלך כדי להתחיל.',
      'organizations.noUsers': 'אין משתמשים בארגון זה',
      'organizations.noServices': 'אין שירותים בארגון זה',
      
      // Services
      'services.title': 'שירותים',
      'services.subtitle': 'ניהול שירותים והגדרותיהם',
      'services.create': 'צור שירות',
      'services.edit': 'ערוך שירות',
      'services.name': 'שם השירות',
      'services.nameRu': 'שם השירות (רוסית)',
      'services.nameEn': 'שם השירות (אנגלית)',
      'services.nameHe': 'שם השירות (עברית)',
      'services.description': 'תיאור',
      'services.descriptionRu': 'תיאור (רוסית)',
      'services.descriptionEn': 'תיאור (אנגלית)',
      'services.descriptionHe': 'תיאור (עברית)',
      'services.duration': 'משך זמן',
      'services.durationMin': 'משך זמן (דקות)',
      'services.organization': 'ארגון',
      'services.slots': 'זמני פנויים',
      'services.appointments': 'תורים',
      'services.created': 'נוצר',
      'services.empty.title': 'אין שירותים',
      'services.empty.message': 'אין לך שירותים עדיין. צור את השירות הראשון שלך כדי להתחיל.',
      'services.noSlots': 'אין זמנים פנויים לשירות זה',
      'services.noAppointments': 'אין תורים לשירות זה',
      'services.durationFormat': '{hours}ש {minutes}ד',
      'services.durationHours': '{hours}ש',
      'services.durationMinutes': '{minutes}ד',
      
      // Appointments
      'appointments.title': 'תורים',
      'appointments.subtitle': 'ניהול תורים והזמנות',
      'appointments.create': 'תור חדש',
      
      // Appointments Summary
      'appointments.summary.total': 'סה"כ תורים',
      'appointments.summary.confirmed': 'אושרו בהצלחה',
      'appointments.summary.pending': 'ממתינים לאישור',
      'appointments.summary.cancelled': 'תורים מבוטלים',
      
      // Appointments Search
      'appointments.search.placeholder': 'חיפוש לפי מזהה לקוח או שירות...',
      
      // Appointments Pagination
      'appointments.pagination.showing': 'מציג',
      'appointments.pagination.of': 'מתוך',
      'appointments.pagination.appointments': 'תורים',
      'appointments.edit': 'ערוך תור',
      'appointments.cancel': 'בטל תור',
      'appointments.details.title': 'פרטי התור',
      'appointments.details.status': 'סטטוס',
      'appointments.details.service': 'שירות',
      'appointments.details.time': 'זמן',
      'appointments.details.client': 'לקוח',
      'appointments.details.appointmentId': 'מזהה תור',
      'appointments.details.serviceName': 'שם השירות',
      'appointments.details.description': 'תיאור',
      'appointments.details.duration': 'משך זמן',
      'appointments.details.date': 'תאריך',
      'appointments.details.startTime': 'שעת התחלה',
      'appointments.details.endTime': 'שעת סיום',
      'appointments.details.chatId': 'מזהה צ\'אט',
      'appointments.details.bookingDate': 'תאריך הזמנה',
      'appointments.details.id': 'מזהה',
      'appointments.details.slotId': 'מזהה חלון זמן',
      'appointments.details.changeStatus': 'שנה סטטוס',
      'appointments.status.confirmed': 'אושר',
      'appointments.status.pending': 'ממתין',
      'appointments.status.cancelled': 'בוטל',
      'appointments.filters.status': 'סטטוס',
      'appointments.filters.service': 'שירות',
      'appointments.filters.date': 'תאריך',
      'appointments.table.id': 'מזהה',
      'appointments.table.service': 'שירות',
      'appointments.table.datetime': 'תאריך ושעה',
      'appointments.table.client': 'לקוח',
      'appointments.table.status': 'סטטוס',
      'appointments.noData.title': 'אין תורים',
      'appointments.noData.message': 'אין לך תורים עדיין. צור את התור הראשון שלך כדי להתחיל.',
      'appointments.form.steps.service': 'שירות',
      'appointments.form.steps.date': 'תאריך ושעה',
      'appointments.form.steps.client': 'מידע לקוח',
      'appointments.form.service': 'שירות',
      'appointments.form.date': 'תאריך',
      'appointments.form.time': 'זמן',
      'appointments.form.duration': 'משך זמן',
      'appointments.form.chatId': 'מזהה צ\'אט',
      'appointments.form.availableSlots': 'חלונות זמן זמינים',
      'appointments.form.noSlots': 'אין חלונות זמן זמינים לתאריך זה',
      'appointments.form.summary': 'סיכום התור',
      'appointments.form.create': 'צור תור',
      'appointments.form.errors.serviceRequired': 'אנא בחר שירות',
      'appointments.form.errors.dateRequired': 'אנא בחר תאריך',
      'appointments.form.errors.chatIdRequired': 'אנא הזן מזהה צ\'אט',
      'appointments.form.errors.chatIdInvalid': 'מזהה צ\'אט חייב להכיל רק מספרים',
      
      // Settings
      'settings.title': 'הגדרות',
      'settings.subtitle': 'ניהול חשבון והעדפות מערכת',
      'settings.profile.title': 'פרופיל משתמש',
      'settings.profile.subtitle': 'ניהול מידע אישי',
      'settings.system.title': 'הגדרות מערכת',
      'settings.system.subtitle': 'הגדרת העדפות מערכת',
      'settings.profile.name': 'שם מלא',
      'settings.profile.email': 'כתובת דוא"ל',
      'settings.profile.role': 'תפקיד',
      'settings.profile.organization': 'ארגון',
      'settings.profile.createdAt': 'חבר מאז',
      'settings.profile.lastLogin': 'כניסה אחרונה',
      'settings.profile.changePassword': 'שנה סיסמה',
      'settings.profile.currentPassword': 'סיסמה נוכחית',
      'settings.profile.newPassword': 'סיסמה חדשה',
      'settings.profile.confirmPassword': 'אשר סיסמה',
      'settings.profile.updateProfile': 'עדכן פרופיל',
      'settings.profile.updatePassword': 'עדכן סיסמה',
      'settings.system.language': 'שפה',
      'settings.system.theme': 'ערכת נושא',
      'settings.system.notifications': 'התראות',
      'settings.system.emailNotifications': 'התראות דוא"ל',
      'settings.system.pushNotifications': 'התראות Push',
      'settings.system.timezone': 'אזור זמן',
      'settings.system.dateFormat': 'פורמט תאריך',
      'settings.system.timeFormat': 'פורמט זמן',
      'settings.system.autoRefresh': 'רענון אוטומטי',
      'settings.system.refreshInterval': 'מרווח רענון (שניות)',
      'settings.system.saveSettings': 'שמור הגדרות',
      'settings.profile.success': 'הפרופיל עודכן בהצלחה',
      'settings.profile.error': 'נכשל בעדכון הפרופיל',
      'settings.password.success': 'הסיסמה עודכנה בהצלחה',
      'settings.password.error': 'נכשל בעדכון הסיסמה',
      'settings.password.mismatch': 'הסיסמאות אינן תואמות',
      'settings.password.weak': 'הסיסמה חלשה מדי',
      'settings.system.success': 'ההגדרות נשמרו בהצלחה',
      'settings.system.error': 'נכשל בשמירת ההגדרות'
    }
  };

  constructor() {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('admin-language') as Language;
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguageSubject.next(savedLang);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('admin-language', language);
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    return this.translations[currentLang][key] || key;
  }

  getAvailableLanguages(): { code: Language; name: string; flag: string }[] {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'he', name: 'עברית', flag: '🇮🇱' }
    ];
  }
}
