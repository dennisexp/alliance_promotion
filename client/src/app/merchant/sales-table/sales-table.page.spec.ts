import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTablePage } from './sales-table.page';

describe('SalesTablePage', () => {
  let component: SalesTablePage;
  let fixture: ComponentFixture<SalesTablePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesTablePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
