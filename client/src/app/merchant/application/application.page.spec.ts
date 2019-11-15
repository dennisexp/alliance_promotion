import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationPage } from './application.page';

describe('ApplicationPage', () => {
  let component: ApplicationPage;
  let fixture: ComponentFixture<ApplicationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
