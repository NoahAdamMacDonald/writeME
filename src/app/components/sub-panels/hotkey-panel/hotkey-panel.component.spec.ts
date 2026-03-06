import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotkeyPanelComponent } from './hotkey-panel.component';

describe('HotkeyPanelComponent', () => {
  let component: HotkeyPanelComponent;
  let fixture: ComponentFixture<HotkeyPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotkeyPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotkeyPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
