import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageEmbedPanelComponent } from './image-embed-panel.component';

describe('ImageEmbedPanelComponent', () => {
  let component: ImageEmbedPanelComponent;
  let fixture: ComponentFixture<ImageEmbedPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageEmbedPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageEmbedPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
