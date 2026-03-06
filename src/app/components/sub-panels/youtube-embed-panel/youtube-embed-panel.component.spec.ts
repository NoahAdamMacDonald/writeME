import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeEmbedPanelComponent } from './youtube-embed-panel.component';

describe('YoutubeEmbedPanelComponent', () => {
  let component: YoutubeEmbedPanelComponent;
  let fixture: ComponentFixture<YoutubeEmbedPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YoutubeEmbedPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YoutubeEmbedPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
