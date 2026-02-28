import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  content = '';
  lines: number[] = [1];
  activeLine = 1;

  constructor(private editorState: EditorStateService) {
    this.editorState.content$.subscribe((content) => {
      this.content = content;
      this.updateLines();

      setTimeout(() => {
        const ta = this.textarea?.nativeElement;
        if (!ta) return;

        ta.selectionStart = this.editorState.selectionStart;
        ta.selectionEnd = this.editorState.selectionEnd;
      });
    });
  }

  private editorHasFocus(): boolean {
    return document.activeElement === this.textarea.nativeElement;
  }

  updateLines() {
    const count = this.content.split('\n').length;
    this.lines = Array.from({ length: count }, (_, i) => i + 1);
  }

  updateActiveLine(event: any) {
    if (!this.editorHasFocus()) return;

    const ta = event.target as HTMLTextAreaElement;
    const pos = ta.selectionStart;
    const before = this.content.slice(0, pos);
    const line = before.split('\n').length;

    this.activeLine = line;
    this.editorState.updateCursorLine(line);
  }

  updateSelection(event: any) {
    if (!this.editorHasFocus()) return;

    const ta = event.target as HTMLTextAreaElement;
    this.editorState.updateSelection(ta.selectionStart, ta.selectionEnd);
  }

  onInput(event: any) {
    this.editorState.setContent(this.content);
    this.updateLines();
    this.updateActiveLine(event);
    this.updateSelection(event);
  }

  onClick(event: any) {
    this.updateActiveLine(event);
    this.updateSelection(event);
  }

  onKeyUp(event: any) {
    this.updateLines();
    this.updateActiveLine(event);
    this.updateSelection(event);
  }

  syncScroll(event: any) {
    const ta = event.target as HTMLTextAreaElement;
    const lineNumbers = document.querySelector('.line-numbers') as HTMLElement;
    if (lineNumbers) {
      lineNumbers.scrollTop = ta.scrollTop;
    }
  }

  handleTabs(event: KeyboardEvent) {
    const ta = event.target as HTMLTextAreaElement;

    if (event.key !== 'Tab') return;
    event.preventDefault();

    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    const before = this.content.substring(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const currentLine = this.content.substring(lineStart, end);

    // unindent
    if (event.shiftKey) {
      if (currentLine.startsWith('    ')) {
        this.content =
          this.content.substring(0, lineStart) +
          currentLine.substring(4) +
          this.content.substring(end);

        const newPos = start - 4;

        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = newPos;
        });

        this.editorState.setContent(this.content);
        this.editorState.updateSelection(newPos, newPos);
      }
      return;
    }

    // indent
    this.content =
      this.content.substring(0, start) + '    ' + this.content.substring(end);

    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + 4;
    });

    this.editorState.setContent(this.content);
    this.editorState.updateSelection(start + 4, start + 4);
  }
}
