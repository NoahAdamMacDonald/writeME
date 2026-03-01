import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-link-url-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './link-url-panel.component.html',
  styleUrl: './link-url-panel.component.css',
})
export class LinkUrlPanelComponent implements OnInit {
  editor = inject(EditorStateService);

  text = '';
  url = '';

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

  //Helper Functions
  private validate(): boolean {
    if (!this.text.trim()) {
      this.showError('Link text cannot be empty');
      return false;
    }
    if (!this.url.trim()) {
      this.showError('URL cannot be empty');
      return false;
    }
    return true;
  }


  /**
   * Normalizes a URL by adding https as a default and adding .com to the end if it is not a full URL path.
   * @param url The URL to normalize.
   * @returns The normalized URL.
   */
  private normalizeUrl(url: string): string {
    const trimmed = url.trim();

    //add https as a default
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // add a .com as a default if not full url path
    if (
      trimmed.includes('.') ||
      trimmed.includes('/') ||
      trimmed.includes('#') ||
      trimmed.includes('?')
    ) {
      return 'https://' + trimmed;
    }

    return 'https://' + trimmed + '.com';
  }

  //Handle Existing Link
  loadExistingLink() {
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

    this.text = content.slice(start + 1, closeBracket);
    this.url = content.slice(openParen + 1, closeParen);

    this.editing = true;
    this.originalStart = start;
    this.originalEnd = closeParen + 1;
  }

  insert() {
    if (!this.validate()) return;

    const normalizedUrl = this.normalizeUrl(this.url);
    const block = `[${this.text}](${normalizedUrl})`;

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

  save() {
    if (!this.validate()) return;

    const normalizedUrl = this.normalizeUrl(this.url);
    const block = `[${this.text}](${normalizedUrl})`;

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
    this.loadExistingLink();
  }
}
