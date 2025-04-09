import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  readonly couchDBUrl = 'https://192.168.57.185:5984/demo_24'; // CouchDB URL
  readonly userName = 'd_couchdb';
  readonly password = 'Welcome#2';

  readonly headers = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
    'Content-Type': 'application/json',
  });

  constructor(readonly http: HttpClient) {}

  // Get all personal tasks
  getTasks() {
    return this.http.get<any>(`${this.couchDBUrl}/_design/task/_view/by_status`, { headers: this.headers })
      .pipe(
        map(response => response.rows.map((row: any) => row.value))
      );
  }


  private generateUUID(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  
  // Add a new personal task
  addTask(task: any) {
    const taskToAdd = {
      _id: `personaltask_2_${this.generateUUID()}`,
      ...task,
      type: 'personaltask',
      createdAt: new Date().toISOString()
    };
    delete taskToAdd._id;
    delete taskToAdd._rev;
    
    return this.http.post<any>(this.couchDBUrl, taskToAdd, { headers: this.headers });
  }

  // Update an existing personal task
  updateTask(task: any) {
    if (!task._id || !task._rev) {
      throw new Error('Cannot update task without _id and _rev');
    }
    return this.http.put<any>(`${this.couchDBUrl}/${task._id}`, task, { headers: this.headers });
  }

  // Delete a personal task
  deleteTask(id: string, rev: string) {
    if (!id || !rev) {
      throw new Error('Cannot delete task without _id and _rev');
    }
    return this.http.delete(`${this.couchDBUrl}/${id}?rev=${rev}`, { headers: this.headers });
  }

}