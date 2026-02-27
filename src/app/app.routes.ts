import { Routes } from '@angular/router';
import { EditorPageComponent } from './pages/editor-page/editor-page.component';

export const routes: Routes = [
  { path: 'editor', component: EditorPageComponent },
  { path: '**', redirectTo: 'editor' }
];
