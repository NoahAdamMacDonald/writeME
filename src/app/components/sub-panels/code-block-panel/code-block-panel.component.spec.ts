import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeBlockPanelComponent } from './code-block-panel.component';

describe('CodeBlockPanelComponent', () => {
  let component: CodeBlockPanelComponent;
  let fixture: ComponentFixture<CodeBlockPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeBlockPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeBlockPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
