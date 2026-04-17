import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiHisto } from './kpi-histo';

describe('KpiHisto', () => {
  let component: KpiHisto;
  let fixture: ComponentFixture<KpiHisto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiHisto],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiHisto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
