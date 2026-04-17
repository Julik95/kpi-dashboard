import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiDialog } from './kpi-dialog';

describe('KpiDialog', () => {
  let component: KpiDialog;
  let fixture: ComponentFixture<KpiDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
