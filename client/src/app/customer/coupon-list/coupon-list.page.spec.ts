import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponListPage } from './coupon-list.page';

describe('CouponListPage', () => {
  let component: CouponListPage;
  let fixture: ComponentFixture<CouponListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
