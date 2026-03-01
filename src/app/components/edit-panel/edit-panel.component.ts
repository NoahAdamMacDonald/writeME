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

  /**
   * Apply a markdown heading to the selected text.
   *
   * If the selected text contains a line, this function will apply the
   * heading to the line. If the selected text contains a block of text,
   * this function will apply the heading to the block of text.
   *
   * @param level The level of the heading to apply.
   *
   * @example <caption>Set a heading level 1 to the selected text</caption>
   * <code>setHeading(1)</code>
   */
  setHeading(level: number) {
    this.applyMarkdownAction((content, start, end) => {
      const before = content.slice(0, start);
      const after = content.slice(end);

      const lineStart = before.lastIndexOf('\n') + 1;
      const lineEndIndex = content.indexOf('\n', end);
      const lineEnd = lineEndIndex === -1 ? content.length : lineEndIndex;

      const fullBefore = content.slice(0, lineStart);
      const fullBlock = content.slice(lineStart, lineEnd);
      const fullAfter = content.slice(lineEnd);

      const lines = fullBlock.split('\n');
      const hashes = '#'.repeat(level) + ' ';

      const transformed = lines
        .map((line) => {
          const trimmed = line.trim();

          if (!trimmed) return line;

          // If line already has the same heading : remove it and exit function
          const exactHeadingRegex = new RegExp(`^#{${level}}\\s+`);
          if (exactHeadingRegex.test(trimmed)) {
            return trimmed.replace(exactHeadingRegex, '');
          }

          // Remove any other heading level and apply new one
          const withoutAnyHeading = trimmed.replace(/^#{1,6}\s+/, '');
          return hashes + withoutAnyHeading;
        })
        .join('\n');

      const newContent = fullBefore + transformed + fullAfter;
      const newStart = lineStart;
      const newEnd = lineStart + transformed.length;

      return { newContent, newStart, newEnd };
    });
  }

  /**
   * Set an alert to the selected text.
   *
   * If the selected text contains a line, this function will apply the
   * alert to the line. If the selected text contains a block of text,
   * this function will apply the alert to the block of text.
   *
   * If the same alert type already exists in the selected block, it will be
   * removed. If a different alert type already exists, it will be
   * replaced with the new alert type.
   *
   * @param type The type of the alert to apply. Accepted values are
   * NOTE, TIP, WARNING, IMPORTANT, CAUTION.
   *
   * @example <caption>Set a Note alert to the selected text</caption>
   * <code>setAlert('NOTE')</code>
   */
  setAlert(type: string) {
    this.applyMarkdownAction((content, start, end) => {
      const before = content.slice(0, start);
      const after = content.slice(end);

      // Expand to full lines
      const lineStart = before.lastIndexOf('\n') + 1;
      const lineEndIndex = content.indexOf('\n', end);
      const lineEnd = lineEndIndex === -1 ? content.length : lineEndIndex;

      const fullBefore = content.slice(0, lineStart);
      const fullBlock = content.slice(lineStart, lineEnd);
      const fullAfter = content.slice(lineEnd);

      const lines = fullBlock.split('\n');

      // Detect existing alert
      const alertRegex = /^>\s*\[!(\w+)\]\s*$/;
      const firstLine = lines[0].trim();
      const match = firstLine.match(alertRegex);
      const existingType = match ? match[1] : null;

      // If the Same alert : remove it and exit function
      if (existingType && existingType.toUpperCase() === type.toUpperCase()) {
        const withoutAlert = lines
          .slice(1) // remove the first line (the alert header)
          .map((line) => line.replace(/^>\s?/, '')) // remove leading "> "
          .join('\n');

        const newContent = fullBefore + withoutAlert + fullAfter;
        const newStart = lineStart;
        const newEnd = lineStart + withoutAlert.length;

        return { newContent, newStart, newEnd };
      }

      // Replace existing alert and apply new one
      if (existingType) {
        const replaced = [
          `> [!${type}]`,
          ...lines.slice(1), // keep content lines
        ].join('\n');

        const newContent = fullBefore + replaced + fullAfter;
        const newStart = lineStart;
        const newEnd = lineStart + replaced.length;

        return { newContent, newStart, newEnd };
      }

      // Apply new alert if none exists
      const block = [`> [!${type}]`, ...lines.map((line) => `> ${line}`)].join(
        '\n',
      );

      const newContent = fullBefore + block + fullAfter;
      const newStart = lineStart;
      const newEnd = lineStart + block.length;

      return { newContent, newStart, newEnd };
    });
  }

  setList(prefix: string) {
    this.applyMarkdownAction((content, start, end) => {
      const before = content.slice(0, start);
      const after = content.slice(end);

      // Expand to full lines
      const lineStart = before.lastIndexOf('\n') + 1;
      const lineEndIndex = content.indexOf('\n', end);
      const lineEnd = lineEndIndex === -1 ? content.length : lineEndIndex;

      const fullBefore = content.slice(0, lineStart);
      const fullBlock = content.slice(lineStart, lineEnd);
      const fullAfter = content.slice(lineEnd);

      const lines = fullBlock.split('\n');

      // Regex nightmare to detect current list type without also detecting task for unordered list
      const taskRegex = /^\s*-\s\[( |x|X)\]\s+/;
      const orderedRegex = /^\s*\d+\.\s+/;
      const unorderedRegex = /^\s*-\s(?!\[( |x|X)\])|^\s*[*+]\s+/;

      const first = lines[0];

      // Detect current type
      const taskMatch = first.match(taskRegex);
      const isTask = !!taskMatch;
      const isTaskChecked = taskMatch ? /x/i.test(taskMatch[1]) : false;

      const isOrdered = !isTask && orderedRegex.test(first);
      const isUnordered = !isTask && !isOrdered && unorderedRegex.test(first);

      const currentType = isTask
        ? isTaskChecked
          ? 'task-checked'
          : 'task-unchecked'
        : isOrdered
          ? 'ordered'
          : isUnordered
            ? 'unordered'
            : 'none';

      // Detect current prefix
      const trimmedPrefix = prefix.trim();
      const applyingTask = /^-\s\[( |x|X)\]/.test(trimmedPrefix);
      const applyingUnordered = trimmedPrefix === '-';
      const applyingOrdered = /^\d+\.$/.test(trimmedPrefix);

      const desiredType = applyingTask
        ? 'task'
        : applyingOrdered
          ? 'ordered'
          : applyingUnordered
            ? 'unordered'
            : 'none';

      const stripAllPrefixes = (line: string) =>
        line
          .replace(taskRegex, '')
          .replace(orderedRegex, '')
          .replace(unorderedRegex, '');

      // TASK LOGIC
      if (desiredType === 'task') {
        if (currentType === 'task-unchecked') {
          const toggled = lines
            .map((line) => line.replace(/^\s*-\s\[\s\]\s+/, '- [x] '))
            .join('\n');

          return {
            newContent: fullBefore + toggled + fullAfter,
            newStart: lineStart,
            newEnd: lineStart + toggled.length,
          };
        }

        if (currentType === 'task-checked') {
          const removed = lines.map(stripAllPrefixes).join('\n');

          return {
            newContent: fullBefore + removed + fullAfter,
            newStart: lineStart,
            newEnd: lineStart + removed.length,
          };
        }

        if (currentType === 'unordered' || currentType === 'ordered') {
          const converted = lines
            .map((line) => `- [ ] ${stripAllPrefixes(line)}`)
            .join('\n');

          return {
            newContent: fullBefore + converted + fullAfter,
            newStart: lineStart,
            newEnd: lineStart + converted.length,
          };
        }
        const applied = lines.map((line) => `- [ ] ${line}`).join('\n');

        return {
          newContent: fullBefore + applied + fullAfter,
          newStart: lineStart,
          newEnd: lineStart + applied.length,
        };
      }

      // UNORDERED / ORDERED LOGIC
      if (
        (desiredType === 'unordered' && currentType === 'unordered') ||
        (desiredType === 'ordered' && currentType === 'ordered')
      ) {
        const removed = lines.map(stripAllPrefixes).join('\n');

        return {
          newContent: fullBefore + removed + fullAfter,
          newStart: lineStart,
          newEnd: lineStart + removed.length,
        };
      }

      // Replace existing list with new type
      if (currentType !== 'none') {
        let counter = 1;

        const replaced = lines
          .map((line) => {
            const stripped = stripAllPrefixes(line);

            if (desiredType === 'ordered') return `${counter++}. ${stripped}`;
            if (desiredType === 'unordered') return `- ${stripped}`;
            return stripped;
          })
          .join('\n');

        return {
          newContent: fullBefore + replaced + fullAfter,
          newStart: lineStart,
          newEnd: lineStart + replaced.length,
        };
      }

      // Apply new list to plain text
      let counter = 1;
      const applied = lines
        .map((line) => {
          if (desiredType === 'ordered') return `${counter++}. ${line}`;
          if (desiredType === 'unordered') return `- ${line}`;
          return line;
        })
        .join('\n');

      return {
        newContent: fullBefore + applied + fullAfter,
        newStart: lineStart,
        newEnd: lineStart + applied.length,
      };
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
