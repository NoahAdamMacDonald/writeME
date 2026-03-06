import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

//Panels
import { FilePanelComponent } from '../file-panel/file-panel.component';
import { EditPanelComponent } from '../edit-panel/edit-panel.component';
import { IconPanelComponent } from '../icon-panel/icon-panel.component';

//Sub-panels
import { FoldablePanelComponent } from '../sub-panels/foldable-panel/foldable-panel.component';
import { LinkUrlPanelComponent } from '../sub-panels/link-url-panel/link-url-panel.component';
import { LinkSectionPanelComponent } from '../sub-panels/link-section-panel/link-section-panel.component';
import { ImageEmbedPanelComponent } from '../sub-panels/image-embed-panel/image-embed-panel.component';
import { CodeBlockPanelComponent } from '../sub-panels/code-block-panel/code-block-panel.component';
import { TablePanelComponent } from '../sub-panels/table-panel/table-panel.component';

import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FilePanelComponent,
    EditPanelComponent,
    IconPanelComponent,
    FoldablePanelComponent,
    LinkUrlPanelComponent,
    LinkSectionPanelComponent,
    CodeBlockPanelComponent,
    TablePanelComponent,
    ImageEmbedPanelComponent
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
    this.editor.setSidebarTab(tab);
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

  constructor(public editor: EditorStateService) {
    this.checkScreenSize();

    const savedTab = localStorage.getItem('activeTab') as
      | 'file'
      | 'edit'
      | 'icons'
      | null;
    if (savedTab) {
      editor.setSidebarTab(savedTab);
    }
  }
}
