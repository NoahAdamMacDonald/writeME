import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EditorStateService } from '../../services/editor-state.service';
import { TextEditingService } from '../../services/text-editing.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent implements OnInit {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  editorState = inject(EditorStateService);
  textEdit = inject(TextEditingService);

  content = '';
  lines: number[] = [1];
  activeLine = 1;

  ngOnInit() {
    const saved = localStorage.getItem('editorContent');
    if (saved) {
      this.editorState.setContent(saved);
    }

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
    localStorage.setItem('editorContent', this.content);

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

  onKeyDown(event: KeyboardEvent) {
    const ta = this.textarea.nativeElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (event.key === 'Tab') {
      event.preventDefault();

      const result = event.shiftKey
        ? this.textEdit.handleShiftTab(this.content, start, end)
        : this.textEdit.handleTab(this.content, start, end);

      this.applyContentEdit(result, ta);
    }
  }

  private applyContentEdit(
    result: { content: string; newStart: number; newEnd: number },
    ta: HTMLTextAreaElement,
  ) {
    this.content = result.content;
    this.editorState.setContent(this.content);
    localStorage.setItem('editorContent', this.content);

    setTimeout(() => {
      ta.selectionStart = result.newStart;
      ta.selectionEnd = result.newEnd;
    });

    this.updateLines();
    this.updateActiveLine({ target: ta });
    this.updateSelection({ target: ta });
  }

  syncScroll(event: any) {
    const ta = event.target as HTMLElement;
    const lineNumbers = document.querySelector('.line-numbers') as HTMLElement;
    if (lineNumbers) {
      lineNumbers.scrollTop = ta.scrollTop;
    }
  }
}
