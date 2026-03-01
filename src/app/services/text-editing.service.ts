import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TextEditingService {
  indent = '    '; // 4 spaces

  handleTab(
    content: string,
    start: number,
    end: number,
  ): {
    content: string;
    cursor: number;
  } {
    const newContent =
      content.slice(0, start) + this.indent + content.slice(end);

    return {
      content: newContent,
      cursor: start + this.indent.length,
    };
  }

  handleShiftTab(
    content: string,
    start: number,
    end: number,
  ): {
    content: string;
    cursor: number;
  } {
    const before = content.substring(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const currentLine = content.substring(lineStart, end);

    if (!currentLine.startsWith(this.indent)) {
      return { content, cursor: start };
    }

    const newContent =
      content.substring(0, lineStart) +
      currentLine.substring(this.indent.length) +
      content.substring(end);

    return {
      content: newContent,
      cursor: start - this.indent.length,
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
