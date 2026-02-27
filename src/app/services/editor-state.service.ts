import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditorStateService {
  private contentSubject = new BehaviorSubject<string>('');
  content$ = this.contentSubject.asObservable();

  content = '';
  selectionStart = 0;
  selectionEnd = 0;

  setContent(content: string) {
    this.content = content;
    this.contentSubject.next(content);
  }

  updateSelection(start: number, end: number) {
    this.selectionStart = start;
    this.selectionEnd = end;
  }

  applyMarkdown(
    transform : (content: string, start: number, end:number) => {
      newContent: string;
      newStart: number;
      newEnd: number;
    }
  ) {
    const {newContent, newStart, newEnd} = transform(this.content, this.selectionStart, this.selectionEnd);

    this.setContent(newContent);

    this.selectionStart = newStart;
    this.selectionEnd=newEnd;
  }

  getContent() {
    return this.contentSubject.getValue();
  }
}
