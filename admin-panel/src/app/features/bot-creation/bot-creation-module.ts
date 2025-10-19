import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { BotCreationGuideComponent } from './bot-creation-guide/bot-creation-guide.component';
import { BotTokenInputComponent } from './bot-token-input/bot-token-input.component';
import { BotManagementComponent } from './bot-management/bot-management.component';
import { BotSettingsComponent } from './bot-settings/bot-settings.component';
import { QrCodeGeneratorComponent } from './qr-code-generator/qr-code-generator.component';
import { TelegramWebappComponent } from './telegram-webapp/telegram-webapp.component';
import { WebappPageComponent } from './webapp-page/webapp-page.component';
import { ServiceCreationGuideComponent } from './service-creation-guide/service-creation-guide.component';
import { SlotsCreationGuideComponent } from './slots-creation-guide/slots-creation-guide.component';
import { PostBotCreationGuideComponent } from './post-bot-creation-guide/post-bot-creation-guide.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { botCreationRoutes } from './bot-creation-routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(botCreationRoutes),
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    TranslatePipe,
    // Standalone components
    BotCreationGuideComponent,
    BotTokenInputComponent,
    BotManagementComponent,
    BotSettingsComponent,
    QrCodeGeneratorComponent,
    TelegramWebappComponent,
    WebappPageComponent,
    ServiceCreationGuideComponent,
    SlotsCreationGuideComponent,
    PostBotCreationGuideComponent
  ]
})
export class BotCreationModule { }
