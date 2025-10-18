import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';

import { AuthService, User } from '../../core/services/auth';
import { I18nService, Language } from '../../core/services/i18n.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    TranslatePipe
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();
  
  currentUser: User | null = null;
  currentLanguage: Language = 'en';
  currentTheme: Theme = 'light';
  availableLanguages: { code: Language; name: string; flag: string }[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private i18nService: I18nService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    this.subscriptions.push(
      this.i18nService.currentLanguage$.subscribe(lang => {
        this.currentLanguage = lang;
      })
    );

    this.subscriptions.push(
      this.themeService.currentTheme$.subscribe(theme => {
        this.currentTheme = theme;
      })
    );

    this.availableLanguages = this.i18nService.getAvailableLanguages();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeIcon(): string {
    switch (this.currentTheme) {
      case 'light': return 'light_mode';
      case 'dark': return 'dark_mode';
      case 'auto': return 'brightness_auto';
      default: return 'brightness_6';
    }
  }

  onLanguageChange(language: Language): void {
    this.i18nService.setLanguage(language);
  }

  getCurrentLanguageFlag(): string {
    const currentLang = this.availableLanguages.find(lang => lang.code === this.currentLanguage);
    return currentLang?.flag || '🇺🇸';
  }

  getCurrentLanguageName(): string {
    const currentLang = this.availableLanguages.find(lang => lang.code === this.currentLanguage);
    return currentLang?.name || 'English';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
