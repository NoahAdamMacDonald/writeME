import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkSectionPanelComponent } from './link-section-panel.component';

describe('LinkSectionPanelComponent', () => {
  let component: LinkSectionPanelComponent;
  let fixture: ComponentFixture<LinkSectionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkSectionPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkSectionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
