import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouchdbService } from '../../../services/couchdb.service';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatLine, MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeModel } from '../admin-home/add-employee/add-employee.component';
import { CommonModule } from '@angular/common';
import { TaskModel } from '../../../task.model';
import { Router,Routes, RouterModule } from '@angular/router';
import { routes } from '../../../app.routes';


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
    MatOptionModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule,
    CommonModule,
    AssignTasksComponent,
    // RouterModule.forRoot(routes)
  
   
  ],
  providers: [CouchdbService]
})



export class AssignTasksComponent implements OnInit {
  taskForm: FormGroup;
  priorities = ['Low', 'Medium', 'High', 'Critical'];
  employees: EmployeeModel[] = []; // Dynamic employee list
  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private couchdbService: CouchdbService // Inject your service to fetch employee data
  ) {
    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      assignedTo: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Fetch employees when the component is initialized
    this.fetchEmployees();
  }

 

  fetchEmployees() {
    // Fetch the employee records from the database
    this.couchdbService.queryDocuments().subscribe(
      (response) => {
        console.log(response);
        
        if (response.rows) {
          this.employees = response.rows.map((row:any)=>row.value);
        }
      },
      (error) => {
        console.error('Error fetching employees from CouchDB:', error);
      }
    );
  }



  storeTaskInCouchDB(taskData: any) {
    this.couchdbService.addDocument(taskData).subscribe(
      (response) => {
        console.log('Task saved in CouchDB:', response);
      },
      (error) => {
        console.error('Error saving task to CouchDB:', error);
      }
    );
  }
  
  onSubmit() {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;
      console.log('Task Assigned:', taskData);
  
      // Call the service to store the task in CouchDB
      this.storeTaskInCouchDB(taskData);
      
      alert('Task Assigned Successfully!');
      this.taskForm.reset();
    }
  }


  backtoadminpage() {
    console.log('Router instance:', this.router);
    if (!this.router) {
      console.error('Router is undefined!');
    } else {
      this.router.navigate(['/add-employee']);  // Navigate properly
    }
  }


  viewAssigned(){
    console.log('Router instance:', this.router);
    if (!this.router) {
      console.error('Router is undefined!');
    } else {
      this.router.navigate(['/view-assigned-tasks']);  // Navigate properly
    }
  }
}

