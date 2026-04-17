import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiKpiGuage } from './multi-kpi-guage';

describe('MultiKpiGuage', () => {
  let component: MultiKpiGuage;
  let fixture: ComponentFixture<MultiKpiGuage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiKpiGuage],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiKpiGuage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
