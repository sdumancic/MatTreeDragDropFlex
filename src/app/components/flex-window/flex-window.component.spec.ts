import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexWindowComponent } from './flex-window.component';

describe('FlexWindowComponent', () => {
  let component: FlexWindowComponent;
  let fixture: ComponentFixture<FlexWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlexWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
