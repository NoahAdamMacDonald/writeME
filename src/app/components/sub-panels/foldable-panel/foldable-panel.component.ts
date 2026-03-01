import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-foldable-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './foldable-panel.component.html',
  styleUrl: './foldable-panel.component.css'
})
export class FoldablePanelComponent {
  editor = inject(EditorStateService);

  summary: string = '';
  lines: string[] = [''];

  showWarning = false;
  warningMessage = '';

  addLine() {
    this.lines.push('');
  }

  //Remove line but most always keep one
  removeLine(index: number) {
    if(this.lines.length > 1) {
      this.lines.splice(index, 1);
    }
  }

  deleteAll() {
    this.summary = '';
    this.lines = [''];
  }

  insert() {
    if(!this.validate()) return;

    const block = this.buildBlock();

    this.editor.applyMarkdown(() => {
      const content = this.editor.content;
      const start = this.editor.selectionStart;
      const end = this.editor.selectionEnd;

      const newContent = content.slice(0, start) + block + content.slice(end);
      const newStart = start + block.length;
      const newEnd = newStart;

      return { newContent, newStart, newEnd };
    });

    this.editor.setSidebarTab('edit');
  }

  copyToClipboard() {
    if(!this.validate()) return;

    const block = this.buildBlock();
    navigator.clipboard.writeText(block);
  }

  private showError(message: string) {
    this.warningMessage = message;
    this.showWarning = true;
    setTimeout(() => {
      this.showWarning = false;
    }, 2000);
  }

  private validate() : boolean {
    if(!this.summary.trim()) {
      this.showError('Summary cannot be empty');
      return false;
    }

    if(this.lines.length===1) {
      if(!this.lines[0].trim()) {
        this.showError('Content cannot be empty');
        return false;
      }
      return true;
    }

    const hasEmptyLine = this.lines.some(line => !line.trim());
    if(hasEmptyLine) {
      this.showError('Content cannot have empty lines');
      return false;
    }

    return true;
  }

  buildBlock() : string {
    return `<details>
      <summary>${this.summary}</summary>
      ${this.lines.map(line=>' <p>'+line+'</p>').join('\n')}
    </details>
    `;
  }

  trackByIndex(index: number) {
    return index;
  }
}
