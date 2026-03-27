import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';

import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-file-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-panel.component.html',
  styleUrl: './file-panel.component.css',
})
export class FilePanelComponent {
  editor = inject(EditorStateService);
  ai = inject(AiService);

  successMessage = '';
  showSuccess = false;

  warningMessage = '';
  showWarning = false;

  //helper functions
  private showConfirmation(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 2000);
  }

  private showError(msg: string) {
    this.warningMessage = msg;
    this.showWarning = true;
    setTimeout(() => (this.showWarning = false), 2000);
  }

  //Import Handling
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  importFile() {
    this.fileInput.nativeElement.click();
  }
  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const converted = this.editor.convertCodeToEmoji(text);

      this.editor.setContent(converted);

      this.showConfirmation(`File imported Successfully: ${file.name}`);
    };
    reader.readAsText(file);
  }

  //Export Handling
  exportFile() {
    const raw = this.editor.content;
    const converted = this.editor.convertEmojiToCode(raw);

    const blob = new Blob([converted], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();

    URL.revokeObjectURL(url);
    this.showConfirmation('File exported Successfully');
  }

  //Clipboard Handling
  async copyToClipboard() {
    const raw = this.editor.content;
    const converted = this.editor.convertEmojiToCode(raw);

    await navigator.clipboard.writeText(converted);

    this.showConfirmation('Content copied to clipboard');
  }

  //AI features
  async formatWithAI() {
    try {
      this.editor.saveOriginalBeforeFormat();

      const raw = this.editor.content;
      const markdown = await this.ai.formatToMarkdown(raw);

      this.editor.saveLastAiFormatted(markdown);
      this.editor.setContent(markdown, true);

      this.showConfirmation('Content formatted with AI');
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  async regenerateFormatting() {
    try {
      if (!this.editor.originalBeforeFormat) {
        this.showError('No original content to regenerate from');
        return;
      }

      const markdown = await this.ai.formatToMarkdown(
        this.editor.originalBeforeFormat,
      );

      this.editor.saveLastAiFormatted(markdown);
      this.editor.setContent(markdown, true);

      this.showConfirmation('Formatting regenerated');
    } catch {
      this.showError('Failed to regenerate formatting');
    }
  }

  revertFormatting() {
    if (!this.editor.originalBeforeFormat) {
      this.showError('Nothing to revert');
      return;
    }

    this.editor.revertToOriginal();
    this.showConfirmation('Reverted to original content');
  }
}
