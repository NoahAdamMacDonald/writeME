import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-link-section-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './link-section-panel.component.html',
  styleUrl: './link-section-panel.component.css',
})
export class LinkSectionPanelComponent implements OnInit {
  editor = inject(EditorStateService);

  text = '';
  anchor = '';

  editing = false;
  originalStart = 0;
  originalEnd = 0;

  showWarning = false;
  warningMessage = '';

  builtInAnchors = ['#top'];
  headingAnchors: string[] = [];

  private showError(msg: string) {
    this.warningMessage = msg;
    this.showWarning = true;
    setTimeout(() => (this.showWarning = false), 2000);
  }

  //Helper Functions
  private validate(): boolean {
    if (!this.text.trim()) {
      this.showError('Link text cannot be empty');
      return false;
    }
    if (!this.anchor.trim()) {
      this.showError('You must select a section');
      return false;
    }
    return true;
  }

  extractHeadings() {
    const content = this.editor.content;
    const lines = content.split('\n');

    this.headingAnchors = lines
      .filter((line) => line.trim().match(/^#{1,6}\s+/))
      .map((line) => {
        const heading = line.replace(/^#{1,6}\s+/, '').trim();
        return (
          '#' +
          heading
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
        );
      });
  }

  insert() {
    if (!this.validate()) return;

    const block = `[${this.text}](${this.anchor})`;

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

  //Handle Existing Link
  loadExistingSectionLink() {
    const content = this.editor.content;
    const cursor = this.editor.selectionStart;

    const start = content.lastIndexOf('[', cursor);
    const closeBracket = content.indexOf(']', start);
    const openParen = content.indexOf('(', closeBracket);
    const closeParen = content.indexOf(')', openParen);

    if (
      start === -1 ||
      closeBracket === -1 ||
      openParen === -1 ||
      closeParen === -1
    )
      return;
    if (cursor < start || cursor > closeParen) return;

    const url = content.slice(openParen + 1, closeParen);
    if (!url.startsWith('#')) return;

    this.text = content.slice(start + 1, closeBracket);
    this.anchor = url;

    this.editing = true;
    this.originalStart = start;
    this.originalEnd = closeParen + 1;
  }

  save() {
    if (!this.validate()) return;

    const block = `[${this.text}](${this.anchor})`;

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

  deleteExistingLink() {
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

  ngOnInit() {
    this.extractHeadings();
    this.loadExistingSectionLink();
  }
}
