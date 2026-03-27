import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  settingsService = inject(SettingsService);

  toggleTheme() {
    this.settingsService.toggleTheme();
  }

  get isDarkMode() {
    return this.settingsService.isDarkMode;
  }
}
