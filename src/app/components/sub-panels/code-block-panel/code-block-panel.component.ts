import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';
import { TextEditingService } from '../../../services/text-editing.service';

import languageData from '../../../../assets/languages.json';
import hljs from 'highlight.js/lib/common';

@Component({
  selector: 'app-code-block-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-block-panel.component.html',
  styleUrl: './code-block-panel.component.css',
})
export class CodeBlockPanelComponent implements OnInit {
  editor = inject(EditorStateService);
  textEdit = inject(TextEditingService);

  language = 'plaintext';
  code = '';
  highlightedCode = '';

  editing = false;
  originalStart = 0;
  originalEnd = 0;

  showWarning = false;
  warningMessage = '';

  languages: string[] = languageData;

  private showError(msg: string) {
    this.warningMessage = msg;
    this.showWarning = true;
    setTimeout(() => (this.showWarning = false), 2000);
  }

  private validate(): boolean {
    if (!this.code.trim()) {
      this.showError('Code cannot be empty');
      return false;
    }
    return true;
  }

  private buildBlock(): string {
    const fence = this.code.includes('```') ? '````' : '```';

    if (this.language === 'json') {
      try {
        const parsed = JSON.parse(this.code);
        this.code = JSON.stringify(parsed, null, 2);
      } catch {}
    }

    return `${fence}${this.language}
${this.code}
${fence}
`;
  }

  updateHighlight() {
    const lang = this.language || 'plaintext';

    try {
      if (hljs.getLanguage(lang)) {
        this.highlightedCode = hljs.highlight(this.code, {
          language: lang,
        }).value;
      } else {
        this.highlightedCode = hljs.highlightAuto(this.code).value;
      }
    } catch {
      this.highlightedCode = this.code;
    }
  }

  syncScroll(event: any) {
    const ta = event.target as HTMLTextAreaElement;
    const pre = ta.previousElementSibling as HTMLElement;

    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
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

      return { newContent, newStart, newEnd: newStart };
    });

    this.editor.setSidebarTab('edit');
  }

  loadExistingCodeBlock() {
    const content = this.editor.content;
    const cursor = this.editor.selectionStart;

    const startFence = content.lastIndexOf('```', cursor);
    const endFence = content.indexOf('```', startFence + 3);

    if (startFence === -1 || endFence === -1) return;
    if (cursor < startFence || cursor > endFence + 3) return;

    const firstLineEnd = content.indexOf('\n', startFence);
    const lang = content.slice(startFence + 3, firstLineEnd).trim();
    const codeBody = content.slice(firstLineEnd + 1, endFence);

    this.language = lang || 'plaintext';
    this.code = codeBody;

    this.editing = true;
    this.originalStart = startFence;
    this.originalEnd = endFence + 3;

    this.updateHighlight();
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

      return { newContent, newStart, newEnd: newStart };
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

  // Edit Functions
  handleKey(event: KeyboardEvent) {
    const ta = event.target as HTMLTextAreaElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (event.key === 'Tab') {
      event.preventDefault();

      const result = event.shiftKey
        ? this.textEdit.handleShiftTab(this.code, start, end)
        : this.textEdit.handleTab(this.code, start, end);

      this.code = result.content;
      this.updateHighlight();

      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = result.cursor;
      });

      return;
    }

    if (['(', '[', '{', '"', "'"].includes(event.key)) {
      event.preventDefault();

      const result = this.textEdit.handleAutoClose(
        this.code,
        start,
        end,
        event.key,
      );

      this.code = result.content;
      this.updateHighlight();

      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = result.cursor;
      });

      return;
    }

    if (event.key === 'Backspace') {
      const result = this.textEdit.handleBackspace(this.code, start, end);

      if (result.content !== this.code) {
        event.preventDefault();
        this.code = result.content;
        this.updateHighlight();

        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = result.cursor;
        });
      }
    }
  }

  ngOnInit() {
    console.log('python:', hljs.getLanguage('python'));
    this.loadExistingCodeBlock();
    this.updateHighlight();
  }
}
