import { Component, OnInit } from '@angular/core';
import { CouchdbService } from '../../../services/couchdb.service';
import { ActivatedRoute } from '@angular/router'; // To retrieve the employee ID from the route
import { CommonModule } from '@angular/common';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-view-assigned-tasks',
  templateUrl: './view-assigned-tasks.component.html',
  styleUrls: ['./view-assigned-tasks.component.css'],
  standalone: true,
  imports: [CommonModule, MatCard, MatCardTitle, MatListModule, MatIconModule, HttpClientModule],
  providers: [CouchdbService]
})
export class ViewAssignedTasksComponent implements OnInit {
  assignedTasks: any[] = [];
  employeeId: string = ''; // Store the employee ID from the route

  constructor(
    private couchdbService: CouchdbService,
    private route: ActivatedRoute // To get the employee ID from the URL
  ) {}

  // ngOnInit(): void {
  //   // Retrieve the employee ID from the route params (e.g., /tasks/:empid)
  //   this.route.params.subscribe((params) => {
  //     this.employeeId = params['empid']; // Assuming you have the empid in the URL
  //     this.fetchAssignedTasks(this.employeeId);
  //   });
  // }

  ngOnInit(): void {
    // Retrieve the employee ID from the route params (e.g., /tasks/:empid)
    // Assuming you have the empid in the URL
      this.fetchAssignedTasks(this.employeeId);
    
  }

  fetchAssignedTasks(empid: string): void {
    this.couchdbService.queryAssignedTasks(empid).subscribe(
      (response:any) => {
        this.assignedTasks =response.rows.map((row:any)=>row.value); // Assuming response contains tasks in docs
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );
  }



  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.couchdbService.delete(taskId).subscribe(
        (response) => {
          console.log('Task deleted successfully:', response);
          this.assignedTasks = this.assignedTasks.filter(task => task._id !== taskId);  // Remove the task from the list
        },
        (error) => {
          console.error('Error deleting task:', error);
        }
      );
    }
  }
}
