import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelPanelComponent } from './tabel-panel.component';

describe('TabelPanelComponent', () => {
  let component: TabelPanelComponent;
  let fixture: ComponentFixture<TabelPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
