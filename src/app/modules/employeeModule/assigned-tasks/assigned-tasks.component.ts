import { Component, OnInit } from '@angular/core';
import { CouchdbService } from '../../../services/couchdb.service';
 // Assuming the service is in this path
import { TaskModel } from '../../../task.model'; // Import your TaskModel
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-assigned-tasks',
  templateUrl: './assigned-tasks.component.html',
  styleUrls: ['./assigned-tasks.component.css'],
  standalone:true,
  imports:[
    HttpClientModule,
    CommonModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    RouterModule,

  ],
  providers:[CouchdbService]
})
export class AssignedTasksComponent implements OnInit {
  assignedTasks: TaskModel[] = []; // Array to store the tasks assigned to the employee
 

  constructor(private couchdbService: CouchdbService,private router: Router) {}

  ngOnInit(): void {
    this.fetchAssignedTasks();
  }

  backtohome(){
    this.router.navigate(['/home']);

  }
  fetchAssignedTasks(): void {
    // Get the logged-in user's employee ID (assuming it's stored in localStorage)
    const loggedInUser = this.couchdbService.getLoggedInUser();
    console.log(loggedInUser);
    
    const empid = loggedInUser?.empid;

    if (empid) {
      // Fetch tasks assigned to this employee
      this.couchdbService.queryAssignedTasks(empid).subscribe(
        (response: any) => {
          // Assuming the response contains an array of tasks
          this.assignedTasks = response.rows.map((row:any)=>row.value); // Adjust according to your CouchDB response
        },
        (error: any) => {
          console.error('Error fetching assigned tasks:', error);
        }
      );
    }
  }



  startKanban(task: TaskModel): void {
    // Navigate to the Kanban board component
    this.router.navigate(['/kanban-board']);
  }
  
}



