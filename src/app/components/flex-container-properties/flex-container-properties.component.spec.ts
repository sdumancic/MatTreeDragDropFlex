import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexContainerPropertiesComponent } from './flex-container-properties.component';

describe('FlexContainerPropertiesComponent', () => {
  let component: FlexContainerPropertiesComponent;
  let fixture: ComponentFixture<FlexContainerPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlexContainerPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexContainerPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
