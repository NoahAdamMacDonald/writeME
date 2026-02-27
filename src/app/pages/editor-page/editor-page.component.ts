import { Component, HostListener } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { EditorComponent } from "../../components/editor/editor.component";

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [SidebarComponent, EditorComponent],
  templateUrl: './editor-page.component.html',
  styleUrl: './editor-page.component.css'
})
export class EditorPageComponent {
  sidebarWidth = 240;
  resizing = false;

  startResizing(event: MouseEvent) {
    event.preventDefault();
    this.resizing = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if(!this.resizing) return;

    const newSidebarWidth = event.clientX;

    const min=240;                 //Min Width allowed
    const max=window.innerWidth/2; //Max Width allowed

    this.sidebarWidth = Math.min(Math.max(min, newSidebarWidth), max);
  }

  @HostListener('document:mouseup')
  stopResizing() {
    this.resizing = false;
  }

}
