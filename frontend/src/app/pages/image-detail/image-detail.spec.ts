import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageDetail } from './image-detail';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ImageDetail', () => {
  let component: ImageDetail;
  let fixture: ComponentFixture<ImageDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageDetail],
      providers: [
        provideRouter([]), 
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});