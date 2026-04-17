import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKpiTempl } from './add-kpi-templ';

describe('AddKpiTempl', () => {
  let component: AddKpiTempl;
  let fixture: ComponentFixture<AddKpiTempl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddKpiTempl],
    }).compileComponents();

    fixture = TestBed.createComponent(AddKpiTempl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
