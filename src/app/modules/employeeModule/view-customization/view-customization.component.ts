import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import { ViewService } from '../../../services/view.service'; // Import ViewService
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-view-customization',
  standalone: true,
  imports: [DragDropModule, FormsModule, DatePipe, CommonModule, HttpClientModule],
  templateUrl: './view-customization.component.html',
  styleUrls: ['./view-customization.component.css'],
  providers: [ViewService],
})
export class ViewCustomizationComponent {
  currentItem: any;
  isEditing: boolean = false;
  viewMode: string = 'kanban'; // Default view
  showTaskForm: boolean = false; // Toggle task form

  columns: any[] = [
    { name: 'To Do', id: 'todo' },
    { name: 'In Progress', id: 'in-progress' },
    { name: 'Done', id: 'done' },
  ];

  ticketsArray: any[] = [
    { taskName: 'Layout1', description: 'Design the homepage', priority: 'High', status: 'To Do', dueDate: '2025-01-15' },
    { taskName: 'API Integration', description: 'Connect API to backend', priority: 'Medium', status: 'In Progress', dueDate: '2025-01-20' },
    { taskName: 'Unit Testing', description: 'Write unit tests', priority: 'Low', status: 'Done', dueDate: '2025-01-25' },
  ];

  newTask: {
    taskName: string;
    description: string;
    priority: string;
    status: string;
    dueDate: string;
    _id?: string;  // Optional to accommodate both new and existing tasks
    _rev?: string; // Optional to accommodate both new and existing tasks
  } = {
    taskName: '',
    description: '',
    priority: '',
    status: 'To Do',
    dueDate: '',
  };

  newColumn = { name: '' };

  constructor(private viewService: ViewService) {}

  // Change View Mode
  changeView(mode: string) {
    this.viewMode = mode;
  }

  // Toggle Task Form visibility
  toggleTaskForm() {
    this.showTaskForm = !this.showTaskForm;
  }

  // Close Task Form
  closeTaskForm() {
    this.showTaskForm = false;
  }

  // Filter tasks by status
  filterTickets(status: string) {
    return this.ticketsArray.filter((task) => task.status === status);
  }

  // Add or Update a task
  addTask() {
    if (!this.newTask.taskName || !this.newTask.description || !this.newTask.dueDate || !this.newTask.priority) {
      console.error('Error: Task fields are missing.');
      return; // Stop the function if any field is missing
    }

    if (this.isEditing) {
      // Update Task Logic
      if (!this.newTask._id || !this.newTask._rev) {
        console.error('Error: Task ID or Revision (_rev) is missing');
        return; // Do not proceed with update if _id or _rev is missing
      }

      // Update the task in the local array
      const index = this.ticketsArray.findIndex((task) => task._id === this.newTask._id);
      if (index !== -1) {
        this.ticketsArray[index] = { ...this.newTask };  // Update the task in the array
      }

      // Update task in CouchDB
      this.viewService.updateTask(this.newTask).subscribe(
        (response) => {
          // After successful update, refresh the task with the new _rev
          this.ticketsArray[index]._rev = response.rev;  // Update _rev in the local array
          console.log('Task updated successfully in CouchDB:', response);
        },
        (error) => {
          console.error('Error updating task in CouchDB:', error);
        }
      );
    } else {
      // Add New Task Logic
      const newTask = { ...this.newTask }; // Creating a new task from the current state
      this.viewService.addTask(newTask).subscribe(
        (response) => {
          if (response && response.id && response.rev) {
            newTask._id = response.id;   // Assign the _id and _rev from the CouchDB response
            newTask._rev = response.rev;
            this.ticketsArray.push(newTask); // Add the new task to the array
            console.log('New task added with _id and _rev:', newTask);
          }
        },
        (error) => {
          console.error('Error adding task to CouchDB:', error);
        }
      );
    }

    // Reset the form after task creation or update
    this.resetForm();
    this.showTaskForm = false; // Close the form after submission
  }

  // Edit Task Logic
  editTask(task: any) {
    this.currentItem = task;
    this.newTask = { ...task };  // Copy the task into newTask for editing
    this.isEditing = true;
    this.showTaskForm = true; // Open the form for editing
  }

  // Delete Task Logic
  deleteTask(task: any) {
    if (!task._id || !task._rev) {
      console.error('Error: Task ID or Revision (_rev) is missing for deletion');
      return; // Do not proceed with deletion if _id or _rev is missing
    }

    // Remove task from the local array
    this.ticketsArray = this.ticketsArray.filter((t) => t._id !== task._id);

    // Delete task from CouchDB
    this.viewService.deleteTask(task._id, task._rev).subscribe(
      (response) => {
        console.log('Task deleted successfully from CouchDB:', response);
      },
      (error) => {
        console.error('Error deleting task from CouchDB:', error);
      }
    );
  }

  // Reset the form after adding/updating a task
  resetForm() {
    this.newTask = { taskName: '', description: '', priority: '', status: 'To Do', dueDate: '', _id: '', _rev: '' };
    this.currentItem = null;
    this.isEditing = false;
  }

  // Add New Column Logic
  addColumn() {
    const id = this.newColumn.name.toLowerCase().replace(/\s+/g, '-');
    this.columns.push({ name: this.newColumn.name, id });
    this.newColumn = { name: '' }; // Reset the form
  }

  // Handle drag start for task
  onDragStart(item: any) {
    this.currentItem = item;
  }

  // Handle drop for task status change
  onDrop(event: any, status: string) {
    event.preventDefault();
    const task = this.ticketsArray.find((t) => t === this.currentItem);
    if (task) {
      task.status = status;
      // Ensure the task has the latest _rev before updating
      if (!task._rev) {
        console.error('Error: Missing _rev for updating task status');
        return;
      }
      this.viewService.updateTask(task).subscribe(
        (response) => {
          // After successful update, refresh the task with the new _rev
          task._rev = response.rev;  // Update _rev in the local array
          console.log('Task status updated successfully in CouchDB', response);
        },
        (error) => {
          console.error('Error updating task status in CouchDB', error);
        }
      );
    }
    this.currentItem = null;
  }

  // Handle drag over event for valid drop
  onDragOver(event: any) {
    event.preventDefault();
  }
}
