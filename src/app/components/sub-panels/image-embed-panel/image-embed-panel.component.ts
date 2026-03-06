import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-image-embed-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './image-embed-panel.component.html',
  styleUrl: './image-embed-panel.component.css',
})
export class ImageEmbedPanelComponent implements OnInit {
  editor = inject(EditorStateService);

  imageUrl = '';
  previewUrl = '';

  editing = false;
  originalStart = 0;
  originalEnd = 0;

  showWarning = false;
  warningMessage = '';

  private showError(msg: string) {
    this.warningMessage = msg;
    this.showWarning = true;
    setTimeout(() => (this.showWarning = false), 2000);
  }

  //helper functions
  private validate(): boolean {
    if (!this.imageUrl.trim()) {
      this.showError('Image URL cannot be empty');
      return false;
    }
    return true;
  }

  updatePreview() {
    this.previewUrl = this.imageUrl.trim();
  }

  //new image
  insert() {
    if (!this.validate()) return;

    const block = `![image](${this.imageUrl.trim()})`;

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

  // Existing image
  loadExistingImage() {
    const content = this.editor.content;
    const cursor = this.editor.selectionStart;

    const start = content.lastIndexOf('![', cursor);
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

    this.imageUrl = url;
    this.previewUrl = url;

    this.editing = true;
    this.originalStart = start;
    this.originalEnd = closeParen + 1;
  }

  save() {
    if (!this.validate()) return;

    const block = `![image](${this.imageUrl.trim()})`;

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

  deleteExistingImage() {
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
    this.loadExistingImage();
  }
}
