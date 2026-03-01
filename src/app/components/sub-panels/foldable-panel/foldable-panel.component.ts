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
    const block = this.buildBlock();
    navigator.clipboard.writeText(block);
  }

  buildBlock() {
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
