import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilePanelComponent } from '../file-panel/file-panel.component';
import { EditPanelComponent } from '../edit-panel/edit-panel.component';
import { IconPanelComponent } from '../icon-panel/icon-panel.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FilePanelComponent,
    EditPanelComponent,
    IconPanelComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  activeTab: 'file' | 'edit' | 'icons' = 'file';

  //Mobile Warning
  isSmallScreen = false;
  dismissedWarning = false;

  setTab(tab: 'file' | 'edit' | 'icons') {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  dismissWarning() {
    this.dismissedWarning = true;
  }

  private checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 768;
  }

  constructor() {
    this.checkScreenSize();

    const savedTab = localStorage.getItem('activeTab') as 'file' | 'edit' | 'icons' | null;
    if (savedTab) {
      this.activeTab = savedTab;
    }
  }
}
