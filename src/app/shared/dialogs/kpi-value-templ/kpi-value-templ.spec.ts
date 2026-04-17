import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiValueTempl } from './kpi-value-templ';

describe('KpiValueTempl', () => {
  let component: KpiValueTempl;
  let fixture: ComponentFixture<KpiValueTempl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiValueTempl],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiValueTempl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
