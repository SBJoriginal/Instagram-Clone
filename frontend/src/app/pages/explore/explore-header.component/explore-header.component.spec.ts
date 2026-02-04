import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExploreHeaderComponent } from './explore-header.component';

describe('ExploreHeaderComponent', () => {
  let component: ExploreHeaderComponent;
  let fixture: ComponentFixture<ExploreHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreHeaderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ExploreHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
