import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDetail } from './image-detail';

describe('ImageDetail', () => {
  let component: ImageDetail;
  let fixture: ComponentFixture<ImageDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
