import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoldablePanelComponent } from './foldable-panel.component';

describe('FoldablePanelComponent', () => {
  let component: FoldablePanelComponent;
  let fixture: ComponentFixture<FoldablePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoldablePanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoldablePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
