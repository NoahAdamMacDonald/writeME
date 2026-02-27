import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-edit-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-panel.component.html',
  styleUrl: './edit-panel.component.css',
})
export class EditPanelComponent {
  editor = inject(EditorStateService);

  private apply(
    fn: (
      content: string,
      start: number,
      end: number,
    ) => { newContent: string; newStart: number; newEnd: number },
  ) {
    this.editor.applyMarkdown(fn);
  }

  // -------------------------
  // BASIC WRAPPERS (bold, italic, strike, inline code)
  // -------------------------
  wrap(wrapper: string) {
    this.apply((content, start, end) => {
      const selected = content.slice(start, end);
      const newContent =
        content.slice(0, start) +
        wrapper +
        selected +
        wrapper +
        content.slice(end);

      return {
        newContent,
        newStart: start + wrapper.length,
        newEnd: end + wrapper.length,
      };
    });
  }

  // -------------------------
  // HEADINGS
  // -------------------------
  applyHeading(level: number) {
    const prefix = '#'.repeat(level) + ' ';
    this.apply((content, start, end) => {
      const before = content.slice(0, start);
      const selected = content.slice(start, end);
      const after = content.slice(end);

      const newContent = before + prefix + selected + after;

      return {
        newContent,
        newStart: start + prefix.length,
        newEnd: end + prefix.length,
      };
    });
  }

  // -------------------------
  // ALERTS
  // -------------------------
  insertAlert(type: string) {
    this.apply((content, start, end) => {
      const selected = content.slice(start, end) || 'Alert text here';
      const block = `> [!${type}]\n> ${selected}\n`;

      const newContent = content.slice(0, start) + block + content.slice(end);

      return {
        newContent,
        newStart: start + block.length,
        newEnd: start + block.length,
      };
    });
  }

  // -------------------------
  // LISTS
  // -------------------------
  insertList(prefix: string) {
    this.apply((content, start, end) => {
      const selected = content.slice(start, end) || 'List item';
      const lines = selected
        .split('\n')
        .map((line) => prefix + line)
        .join('\n');

      const newContent = content.slice(0, start) + lines + content.slice(end);

      return {
        newContent,
        newStart: start,
        newEnd: start + lines.length,
      };
    });
  }

  // -------------------------
  // LINK
  // -------------------------
  insertLink() {
    this.apply((content, start, end) => {
      const selected = content.slice(start, end) || 'link text';
      const link = `[${selected}](https://example.com)`;

      const newContent = content.slice(0, start) + link + content.slice(end);

      return {
        newContent,
        newStart: start + 1,
        newEnd: start + 1 + selected.length,
      };
    });
  }

  // -------------------------
  // INLINE CODE
  // -------------------------
  inlineCode() {
    this.wrap('`');
  }

  // -------------------------
  // CODE BLOCK
  // -------------------------
  insertCodeBlock() {
    this.apply((content, start, end) => {
      const selected = content.slice(start, end) || 'code';
      const block = '```\n' + selected + '\n```\n';

      const newContent = content.slice(0, start) + block + content.slice(end);

      return {
        newContent,
        newStart: start + 4,
        newEnd: start + 4 + selected.length,
      };
    });
  }
}
