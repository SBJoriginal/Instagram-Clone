import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilHeader } from './profil-header';

describe('ProfilHeader', () => {
  let component: ProfilHeader;
  let fixture: ComponentFixture<ProfilHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
