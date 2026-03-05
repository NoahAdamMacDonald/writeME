import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-foldable-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './foldable-panel.component.html',
  styleUrl: './foldable-panel.component.css',
})
export class FoldablePanelComponent implements OnInit {
  editor = inject(EditorStateService);

  summary: string = '';
  lines: string[] = [''];

  showWarning = false;
  warningMessage = '';

  //Values used for existing blocks
  editing = false;
  originalStart = 0;
  originalEnd = 0;

  addLine() {
    this.lines.push('');
  }

  //Remove line but most always keep one
  removeLine(index: number) {
    if (this.lines.length > 1) {
      this.lines.splice(index, 1);
    }
  }

  insert() {
    if (!this.validate()) return;

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
    if (!this.validate()) return;

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

  //Handle Existing Blocks
  private loadExistingBlock() {
    const content = this.editor.content;
    const cursor = this.editor.selectionStart;

    const start = content.lastIndexOf('<details>', cursor);
    const end = content.indexOf('</details>', cursor);

    //Not selecting a block
    if (start === -1 || end === -1) return;

    const block = content.slice(start, end + 10);

    const summaryMatch = block.match(/<summary>(.*?)<\/summary>/s);
    const lineMatches = [...block.matchAll(/<p>(.*?)<\/p>/gs)];

    //Not a foldable block
    if (!summaryMatch) return;

    this.summary = summaryMatch[1].trim();
    this.lines = lineMatches.map((match) => match[1].trim());

    this.editing = true;
    this.originalStart = start;
    this.originalEnd = end + 10;
  }

  save() {
    if (!this.validate()) return;

    const block = this.buildBlock();

    this.editor.applyMarkdown(() => {
      const content = this.editor.content;
      const newContent =
        content.slice(0, this.originalStart) +
        block +
        content.slice(this.originalEnd);

      const newStart = this.originalStart + block.length;
      const newEnd = newStart;

      return { newContent, newStart, newEnd };
    });

    this.editor.setSidebarTab('edit');
  }

  deleteExistingBlock() {
    this.editor.applyMarkdown(() => {
      const content = this.editor.content;

      const newContent =
        content.slice(0, this.originalStart) + content.slice(this.originalEnd);

      return {
        newContent,
        newStart: this.originalStart,
        newEnd: this.originalStart,
      };
    });

    this.editor.setSidebarTab('edit');
  }

  //Helper Functions
  private validate(): boolean {
    if (!this.summary.trim()) {
      this.showError('Summary cannot be empty');
      return false;
    }

    if (this.lines.length === 1) {
      if (!this.lines[0].trim()) {
        this.showError('Content cannot be empty');
        return false;
      }
      return true;
    }

    const hasEmptyLine = this.lines.some((line) => !line.trim());
    if (hasEmptyLine) {
      this.showError('Content cannot have empty lines');
      return false;
    }

    return true;
  }

  buildBlock(): string {
    return `<details>
      <summary>${this.summary}</summary>
      ${this.lines.map((line) => ' <p>' + line + '</p>').join('\n')}
    </details>
    `;
  }

  trackByIndex(index: number) {
    return index;
  }

  ngOnInit() {
    this.loadExistingBlock();
  }
}
