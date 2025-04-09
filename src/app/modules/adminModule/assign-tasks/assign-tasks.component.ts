
import { Component} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouchdbService } from '../../../services/couchdb.service';
// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { EmployeeModel } from '../admin-home/add-employee/add-employee.component';
import { CommonModule } from '@angular/common';
import { TaskModel } from '../../../task.model';
import { Router } from '@angular/router';
import { MatTableModule,MatTableDataSource } from '@angular/material/table'; 
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-assign-tasks',
  templateUrl: './assign-tasks.component.html',
  styleUrls: ['./assign-tasks.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule,
    CommonModule,MatTableModule
  ],
  providers: [CouchdbService, HttpClient]
})
export class AssignTasksComponent {
  taskForm: FormGroup;
  priorities = ['Low', 'Medium', 'High', 'Critical'];
  employees: EmployeeModel[] = [];
  assignedTasks: MatTableDataSource<TaskModel> = new MatTableDataSource();  // Initialize MatTableDataSource
  displayedColumns: string[] = ['taskName', 'assignedTo', 'dueDate', 'priority'];  // Columns to display in the table

  constructor(
    readonly fb: FormBuilder,
    readonly router: Router,
    readonly couchdbService: CouchdbService,
    readonly snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      assignedTo: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required],
    
    });
  }
  minDate: Date = new Date(); 
  ngOnInit(): void {
    this.fetchEmployees();
    this.fetchAssignedTasks();  
    
   
  // Fetch assigned tasks from the database
  }

  fetchEmployees() {
    this.couchdbService.queryDocuments().subscribe({
      next: (response) => {
        if (response.rows) {
          this.employees = response.rows.map((row: any) => row.value);
        }
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
      }
    });
  }

  fetchAssignedTasks(empid?: string) {
    if (!empid) {
      console.error('No employee ID provided');
      return;
    }
    this.couchdbService.queryAssignedTasks(empid).subscribe({
      next: (response) => {
        if (response.rows) {
          this.assignedTasks.data = response.rows.map((row: { value: any; }) => row.value);
        }
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
      }
    });
  }

  storeTaskInCouchDB(taskData: any) {
    this.couchdbService.addDocument(taskData).subscribe({
      next: (response) => {
        console.log('Task saved:', response);
        // Once the task is successfully saved, update the table with the new task
        this.assignedTasks.data = [...this.assignedTasks.data, taskData];
      },
      error: (error) => {
        console.error('Error saving task:', error);
      }
    });
  }
  

  onSubmit() {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;
      this.storeTaskInCouchDB(taskData);  // Store the task and update the table
      this.showSnackbar('Task Assigned Successfully!');
      this.taskForm.reset();
    }
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const panelClass = this.getSnackbarPanelClass(type);
    
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [panelClass],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
}

private getSnackbarPanelClass(type: 'success' | 'error' | 'info'): string {
    switch (type) {
        case 'success':
            return 'success-snackbar';
        case 'error':
            return 'error-snackbar';
        case 'info':
        default:
            return 'info-snackbar';
    }
}

  backtoadminpage() {
    this.router.navigate(['/add-employee']);
  }

  viewAssigned() {
    this.router.navigate(['/view-assigned-tasks']);
  }
}

