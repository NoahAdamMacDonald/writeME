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

  showWarning = false;
  warningMessage = '';

  private warn(msg: string) {
    this.warningMessage = msg;
    this.showWarning = true;
    setTimeout(() => (this.showWarning = false), 2000);
  }

  private applyMarkdownAction(
    transform: (
      content: string,
      start: number,
      end: number,
    ) => { newContent: string; newStart: number; newEnd: number },
  ) {
    const content = this.editor.content;
    let { selectionStart, selectionEnd } = this.editor;

    const active = document.activeElement;
    if (selectionStart === selectionEnd) {
      if (active instanceof HTMLTextAreaElement) {
        const start = selectionStart;
        const before = content.slice(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        const lineEnd = content.indexOf('\n', start);
        const end = lineEnd === -1 ? content.length : lineEnd;

        return this.editor.applyMarkdown((c) => transform(c, lineStart, end));
      }

      const lineIndex = this.editor.lastKnownLine - 1;
      const lines = content.split('\n');

      if (lineIndex >= 0 && lineIndex < lines.length) {
        const lineStart =
          content.split('\n').slice(0, lineIndex).join('\n').length +
          (lineIndex > 0 ? 1 : 0);

        const lineEnd = lineStart + lines[lineIndex].length;

        return this.editor.applyMarkdown((c) =>
          transform(c, lineStart, lineEnd),
        );
      }

      this.warn('No text selected or cursor position found.');
      return;
    }

    return this.editor.applyMarkdown((c) =>
      transform(c, selectionStart, selectionEnd),
    );
  }


  // MARKDOWN ACTIONS
  wrap(wrapper: string) {
    this.applyMarkdownAction((content, start, end) => {
      const selected = content.slice(start, end);

      const before = content.slice(0, start);
      const after = content.slice(end);

      const hasLeft = before.endsWith(wrapper);
      const hasRight = after.startsWith(wrapper);

      if (hasLeft && hasRight) {
        const newContent =
          before.slice(0, before.length - wrapper.length) +
          selected +
          after.slice(wrapper.length);

        const newStart = start - wrapper.length;
        const newEnd = end - wrapper.length;

        return { newContent, newStart, newEnd };
      }

      const newContent = before + wrapper + selected + wrapper + after;

      const newStart = start + wrapper.length;
      const newEnd = end + wrapper.length;

      return { newContent, newStart, newEnd };
    });
  }

  applyHeading(level: number) {
    const prefix = '#'.repeat(level) + ' ';
    this.applyMarkdownAction((content, start, end) => {
      const selected = content.slice(start, end);
      const newContent =
        content.slice(0, start) + prefix + selected + content.slice(end);

      const newStart = start + prefix.length;
      const newEnd = end + prefix.length;

      return { newContent, newStart, newEnd };
    });
  }

  insertAlert(type: string) {
    this.applyMarkdownAction((content, start, end) => {
      const selected = content.slice(start, end) || 'Alert text here';
      const block = `> [!${type}]\n> ${selected}\n`;

      const newContent = content.slice(0, start) + block + content.slice(end);

      const newPos = start + block.length;

      return {
        newContent,
        newStart: newPos,
        newEnd: newPos,
      };
    });
  }

  insertList(prefix: string) {
    this.applyMarkdownAction((content, start, end) => {
      const selected = content.slice(start, end) || 'List item';
      const lines = selected
        .split('\n')
        .map((l) => prefix + l)
        .join('\n');

      const newContent = content.slice(0, start) + lines + content.slice(end);

      const newStart = start;
      const newEnd = start + lines.length;

      return { newContent, newStart, newEnd };
    });
  }

  insertLink() {
    this.applyMarkdownAction((content, start, end) => {
      const selected = content.slice(start, end) || 'link text';
      const link = `[${selected}](https://example.com)`;

      const newContent = content.slice(0, start) + link + content.slice(end);

      const newStart = start + 1;
      const newEnd = start + 1 + selected.length;

      return { newContent, newStart, newEnd };
    });
  }

  insertCodeBlock() {
    this.applyMarkdownAction((content, start, end) => {
      const selected = content.slice(start, end) || 'code';
      const block = '```\n' + selected + '\n```\n';

      const newContent = content.slice(0, start) + block + content.slice(end);

      const newStart = start + 4;
      const newEnd = start + 4 + selected.length;

      return { newContent, newStart, newEnd };
    });
  }
}
