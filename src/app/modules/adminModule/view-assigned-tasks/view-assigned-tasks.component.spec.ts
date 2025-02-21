import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssignedTasksComponent } from './view-assigned-tasks.component';

describe('ViewAssignedTasksComponent', () => {
  let component: ViewAssignedTasksComponent;
  let fixture: ComponentFixture<ViewAssignedTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAssignedTasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAssignedTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
