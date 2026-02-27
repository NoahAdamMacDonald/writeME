import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent {
  content = '';
  lines : number[] = [1];
  activeLine = 1;

  updateLines() {
    const count = this.content.split('\n').length;
    this.lines = Array.from({ length: count }, (_, i) => i + 1);
  }

  updateActiveLine(event: any) {
    const textarea = event.target;
    const position = textarea.selectionStart;
    const before = this.content.slice(0,position);
    this.activeLine = before.split('\n').length;
  }

  syncScroll(event: any) {
    const textarea = event.target;
    const lineNumbers = document.querySelector('.line-numbers') as HTMLElement;
    lineNumbers.scrollTop = textarea.scrollTop;
  }

  handleTabs(event: KeyboardEvent) {
    if(event.key === 'Tab') {
      event.preventDefault();

      const textarea = event.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      this.content = this.content.substring(0,start) + '    ' + this.content.substring(end);

      setTimeout(() => {
        textarea.selectionStart=textarea.selectionEnd=start+4;
      });
    }
  }
}
