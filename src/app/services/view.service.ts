import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  private couchDBUrl = 'https://192.168.57.185:5984/demo_24'; // CouchDB URL
  private userName = 'd_couchdb';
  private password = 'Welcome#2';

  private headers = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  // Add Task to CouchDB
  addTask(task: any): Observable<any> {
    return this.http.post<any>(this.couchDBUrl, task, { headers: this.headers }).pipe(
      catchError(this.handleError)  // Handle errors gracefully
    );
  }

  // Update Task in CouchDB
  updateTask(task: any): Observable<any> {
    if (!task._id || !task._rev) {
      return throwError('Task ID or Revision (_rev) is missing');
    }

    const url = `${this.couchDBUrl}/${task._id}`;
    return this.http.put<any>(url, task, { headers: this.headers }).pipe(
      catchError((error) => {
        if (error.status === 409) {
          console.error('Conflict error: Revision is outdated. Fetching latest task version.');

          // If conflict occurs, fetch the latest task and retry the update
          return this.getTaskById(task._id).pipe(
            switchMap((latestTask) => {
              // Update the task revision and retry the update with the new revision
              task._rev = latestTask._rev;
              return this.updateTask(task);  // Retry update
            })
          );
        }
        return this.handleError(error);  // Handle other errors
      })
    );
  }

  // Delete Task from CouchDB
  deleteTask(id: string, rev: string): Observable<any> {
    const url = `${this.couchDBUrl}/${id}?rev=${rev}`;
    return this.http.delete<any>(url, { headers: this.headers }).pipe(
      catchError(this.handleError)  // Handle errors gracefully
    );
  }

  // Get Task by ID (to handle revision conflicts)
  getTaskById(id: string): Observable<any> {
    const url = `${this.couchDBUrl}/${id}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError(this.handleError)  // Handle errors gracefully
    );
  }

  // Error handling function
  private handleError(error: any): Observable<any> {
    console.error('Error in ViewService:', error);
    // Handle error here (you can show a user-friendly message in UI if needed)
    return throwError(error);  // Propagate the error for further handling if necessary
  }
}
