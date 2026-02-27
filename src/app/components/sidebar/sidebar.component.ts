import { Component } from '@angular/core';

import { FilePanelComponent } from '../file-panel/file-panel.component';
import { EditPanelComponent } from '../edit-panel/edit-panel.component';
import { IconPanelComponent } from '../icon-panel/icon-panel.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FilePanelComponent, EditPanelComponent, IconPanelComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  activeTab: 'file' | 'edit' |'icons' = 'file';

  setTab(tab: 'file' | 'edit' | 'icons') {
    this.activeTab = tab;
  }
}
