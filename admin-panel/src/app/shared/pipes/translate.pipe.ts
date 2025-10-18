import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../../core/services/i18n.service';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;
  private currentValue: string = '';

  constructor(private i18nService: I18nService) {
    this.subscription = this.i18nService.currentLanguage$.subscribe(() => {
      // Trigger change detection when language changes
    });
  }

  transform(key: string): string {
    return this.i18nService.translate(key);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
