import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-youtube-embed-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './youtube-embed-panel.component.html',
  styleUrl: './youtube-embed-panel.component.css',
})
export class YoutubeEmbedPanelComponent implements OnInit {
  editor = inject(EditorStateService);

  rawInput = '';
  videoId = '';
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

  private validate(): boolean {
    if (!this.videoId.trim()) {
      this.showError('You must enter a valid YouTube URL or video ID');
      return false;
    }
    return true;
  }

  // Extract YouTube ID from any format
  private extractVideoId(input: string): string {
    input = input.trim();

    // Direct ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

    // Full URLs
    const patterns = [
      /v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const p of patterns) {
      const match = input.match(p);
      if (match) return match[1];
    }

    return '';
  }

  updatePreview() {
    this.videoId = this.extractVideoId(this.rawInput);
    this.previewUrl = this.videoId
      ? `https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg`
      : '';
  }

  insert() {
    if (!this.validate()) return;

    const block =
      `[![Video](https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg)]` +
      `(https://www.youtube.com/watch?v=${this.videoId})`;

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

  loadExistingYoutubeEmbed() {
    const content = this.editor.content;
    const cursor = this.editor.selectionStart;

    const start = content.lastIndexOf('[![Video]', cursor);
    if (start === -1) return;

    const closeParen = content.indexOf(')', start);
    if (closeParen === -1) return;

    const block = content.slice(start, closeParen + 1);

    const match = block.match(/vi\/([a-zA-Z0-9_-]{11})/);
    if (!match) return;

    const id = match[1];

    this.rawInput = id;
    this.videoId = id;
    this.previewUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

    this.editing = true;
    this.originalStart = start;
    this.originalEnd = closeParen + 1;
  }

  save() {
    if (!this.validate()) return;

    const block =
      `[![Video](https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg)]` +
      `(https://www.youtube.com/watch?v=${this.videoId})`;

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

  deleteExistingYoutubeEmbed() {
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
    this.loadExistingYoutubeEmbed();
  }
}
