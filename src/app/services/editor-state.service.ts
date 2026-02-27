import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditorStateService {
  private contentSubject = new BehaviorSubject<string>('');
  content$ = this.contentSubject.asObservable();

  setContent(content: string) {
    this.contentSubject.next(content);
  }

  getContent() {
    return this.contentSubject.getValue();
  }
}
