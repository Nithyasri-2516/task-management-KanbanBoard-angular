import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomizationComponent } from './view-customization.component';

describe('ViewCustomizationComponent', () => {
  let component: ViewCustomizationComponent;
  let fixture: ComponentFixture<ViewCustomizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCustomizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCustomizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
