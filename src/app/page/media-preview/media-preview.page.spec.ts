import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaPreviewPage } from './media-preview.page';

describe('MediaPreviewPage', () => {
  let component: MediaPreviewPage;
  let fixture: ComponentFixture<MediaPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
