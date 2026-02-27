import { Component} from '@angular/core';
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
  content = '';
  lines: number[] = [1];
  activeLine = 1;

  updateLines() {
    const count = this.content.split('\n').length;
    this.lines = Array.from({ length: count }, (_, i) => i + 1);
    this.editorStateService.setContent(this.content);
  }

  updateActiveLine(event: any) {
    const textarea = event.target;
    const position = textarea.selectionStart;
    const before = this.content.slice(0, position);
    this.activeLine = before.split('\n').length;
  }

  updateSelection(event: any) {
    const textarea = event.target;
    this.editorStateService.updateSelection(textarea.selectionStart, textarea.selectionEnd);
  }

  onKeyUp(event: any) {
    this.updateLines();
    this.updateActiveLine(event);
  }

  syncScroll(event: any) {
    const textarea = event.target;
    const lineNumbers = document.querySelector('.line-numbers') as HTMLElement;
    lineNumbers.scrollTop = textarea.scrollTop;
  }

  handleTabs(event: KeyboardEvent) {
    const textarea = event.target as HTMLTextAreaElement;

    if (event.key === 'Tab') {
      event.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const before = this.content.substring(0, start);
      const lineStart = before.lastIndexOf('\n') + 1;
      const currentLine = this.content.substring(lineStart, end);

      //Unindent
      if (event.shiftKey) {
        if (currentLine.startsWith('    ')) {
          this.content =
            this.content.substring(0, lineStart) +
            currentLine.substring(4) +
            this.content.substring(end);

          const newPos = start - 4;
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = newPos;
          });
        }
        return;
      }

      //Indent
      this.content =
        this.content.substring(0, start) + '    ' + this.content.substring(end);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }
  }

  constructor(private editorStateService: EditorStateService) {
    this.editorStateService.content$.subscribe((content) => {
      this.content = content
      this.updateLines();
    })
  }
}
