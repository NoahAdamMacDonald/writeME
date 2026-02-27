import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-file-panel',
  standalone: true,
  imports: [],
  templateUrl: './file-panel.component.html',
  styleUrl: './file-panel.component.css'
})
export class FilePanelComponent {
  editorStateService = inject(EditorStateService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  importFile() {
    this.fileInput.nativeElement.click();
  }

  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if(!file) return;

    const reader = new FileReader();
    reader.onload=()=>{
      const text = reader.result as string;
      this.editorStateService.setContent(text);
    };
    reader.readAsText(file);
  }

  exportFile() {
    const content = this.editorStateService.getContent();
    const blob = new Blob([content], {type: 'text/markdown'});
    const url= URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();

    URL.revokeObjectURL(url);
  }

  async copyToClipboard() {
    const content = this.editorStateService.getContent();
    await navigator.clipboard.writeText(content);
  } 
}
