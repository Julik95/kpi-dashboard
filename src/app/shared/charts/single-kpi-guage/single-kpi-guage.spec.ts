import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleKpiGuage } from './single-kpi-guage';

describe('SingleKpiGuage', () => {
  let component: SingleKpiGuage;
  let fixture: ComponentFixture<SingleKpiGuage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleKpiGuage],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleKpiGuage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
