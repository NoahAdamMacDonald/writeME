import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TextEditingService {
  indent = '    '; // 4 spaces

  handleTab(content: string, start: number, end: number) {
    const indent = this.indent;

    const lineStart = content.lastIndexOf('\n', start - 1) + 1;

    let lineEnd = content.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = content.length;

    const block = content.slice(lineStart, lineEnd);
    const lines = block.split('\n');

    const indented = lines.map((line) => indent + line).join('\n');

    const newContent =
      content.slice(0, lineStart) + indented + content.slice(lineEnd);

    return {
      content: newContent,
      newStart: start + indent.length,
      newEnd: end + indent.length * lines.length,
    };
  }

  handleShiftTab(content: string, start: number, end: number) {
    const indent = this.indent;

    const lineStart = content.lastIndexOf('\n', start - 1) + 1;

    let lineEnd = content.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = content.length;

    const block = content.slice(lineStart, lineEnd);
    const lines = block.split('\n');

    const unindented = lines.map((line) =>
      line.startsWith(indent) ? line.slice(indent.length) : line,
    );

    const removed = lines.filter((line) => line.startsWith(indent)).length;

    const newContent =
      content.slice(0, lineStart) +
      unindented.join('\n') +
      content.slice(lineEnd);

    return {
      content: newContent,
      newStart: Math.max(start - indent.length, lineStart),
      newEnd: end - indent.length * removed,
    };
  }

  handleAutoClose(
    content: string,
    start: number,
    end: number,
    char: string,
  ): {
    content: string;
    cursor: number;
  } {
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    const close = pairs[char];
    if (!close) return { content, cursor: start };

    const newContent =
      content.slice(0, start) + char + close + content.slice(end);

    return {
      content: newContent,
      cursor: start + 1,
    };
  }

  handleBackspace(
    content: string,
    start: number,
    end: number,
  ): {
    content: string;
    cursor: number;
  } {
    if (start !== end) return { content, cursor: start };

    const prev = content[start - 1];
    const next = content[start];

    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    if (pairs[prev] === next) {
      const newContent = content.slice(0, start - 1) + content.slice(start + 1);

      return {
        content: newContent,
        cursor: start - 1,
      };
    }

    return { content, cursor: start };
  }
}
