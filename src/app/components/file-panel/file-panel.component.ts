import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-file-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-panel.component.html',
  styleUrl: './file-panel.component.css'
})
export class FilePanelComponent {
  editorStateService = inject(EditorStateService);

  successMessage = '';
  showSuccess = false;

  private showConfirmation(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 2000);
  }

  //Import Handling
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
      const converted = this.editorStateService.convertCodeToEmoji(text);

      this.editorStateService.setContent(converted);

      this.showConfirmation(`File imported Successfully: ${file.name}`);
    };
    reader.readAsText(file);
  }

  //Export Handling
  exportFile() {
    const raw = this.editorStateService.content;
    const converted = this.editorStateService.convertEmojiToCode(raw);

    const blob = new Blob([converted], {type: 'text/markdown'});
    const url= URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();

    URL.revokeObjectURL(url);
    this.showConfirmation('File exported Successfully');
  }

  //Clipboard Handling
  async copyToClipboard() {
    const raw = this.editorStateService.content;
    const converted = this.editorStateService.convertEmojiToCode(raw);

    await navigator.clipboard.writeText(converted);

    this.showConfirmation('Content copied to clipboard');
  }
}
