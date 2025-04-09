import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, switchMap} from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { TaskModel } from '../task.model';
@Injectable({
  providedIn: 'root',
})
export class CouchdbService {
  readonly baseURL = 'https://192.168.57.185:5984/demo_24';
  readonly userName = 'd_couchdb';
  readonly password = 'Welcome#2';

  readonly headers = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
    'Content-Type': 'application/json',
  });

  private loggedInUser: any = null; // Store user info
  constructor(readonly http: HttpClient) { }
  // Login Method - Query for 'employee' documents
  login(email: string, password: string): Observable<any> {
    const url = `${this.baseURL}/_find`; // Base URL for the database
    const query = {
      selector: {
        type: 'employee',  // Only query for 'employee' type documents
        email: email,
        password: password,
      },
    };
    return this.http.post<any>(url, query, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return throwError(() => error);;
      })
    );
  }
  // Set Logged-in User (Add user_2_<id> format)
  setLoggedInUser(user: any) {
    const userId = user._id ? `user_2_${user._id}` : `user_2_${new Date().getTime()}`;  // Generate unique ID if not available
    user._id = userId; // Modify the ID format to user_2_<id>
    this.loggedInUser = user; // Store the user in the service
    localStorage.setItem('currentUser', JSON.stringify(user)); // Save to localStorage
  }
  // Get Logged-in User
  getLoggedInUser() {
    if (typeof localStorage !== 'undefined') {
      if (!this.loggedInUser) {
        this.loggedInUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
      }
      return this.loggedInUser;
    }
    return null; 
  }
  
  // Logout Method - Clear session and remove from localStorage
  logout() {
    this.loggedInUser = null; // Clear user session
    localStorage.removeItem('currentUser'); // Clear from localStorage
    console.log('User logged out');
  }

  
  // Create Document - For creating employee documents
  createDocument(employee: any): Observable<any> {
    // Add 'employee' type to the document before creating it
    const employeeDocument = {
      
      ...employee,
      type: 'employee',  // Ensure this document is of type 'employee'
    };

    return this.http.post<any>(this.baseURL, employeeDocument, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error creating employee document:', error);                                                                  
        return throwError(() => error);;
      })
    );
  }
  // Read Document by ID
  readDocument(id: string): Observable<any> {
    const url = `${this.baseURL}/${id}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error reading document:', error);
        return throwError(() => error);;
      })
    );
  }
  // Update Document - Update existing employee document
  updateDocument(document: any): Observable<any> {
    const url = `${this.baseURL}/${document._id}`;
    return this.http.put<any>(url, document, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error updating document:', error);
        return throwError(() => error);;
      })
    );
  }
  //Delete Document
  deleteDocument(id: string, rev: string): Observable<any> {
    const url = `${this.baseURL}/${id}?rev=${rev}`;
    return this.http.delete<any>(url, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error deleting document:', error);
        return throwError(() => error);;
      })
    );
  }
  // Query Documents - For querying employees or any type of document
  queryDocuments(): Observable<any> {
    const url = `${this.baseURL}/_design/task/_view/user`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error querying documents:', error);
        return throwError(() => error);;
      })
    );
  }
  // Query all Employees
  queryEmployees(): Observable<any> {
    const url = `${this.baseURL}/_find`;
    const query = {
      selector: {
        type: 'employee',  // Query for 'employee' documents
      },
    };

    return this.http.post<any>(url, query, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error querying employees:', error);
        return throwError(() => error);;
      })
    );
  }
  addDocument(taskData: any): Observable<any> {
    const url = `${this.baseURL}`; // Base URL for your database (e.g., demo_24)
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
      'Content-Type': 'application/json',
    });

    // Check if taskData.id exists. If not, generate a unique ID (e.g., using Date.now() or a UUID).
    const taskId = taskData.id ? taskData.id : new Date().getTime();  // Fallback to current timestamp if no ID provided

    // Generate the custom _id in the format tasks_2_<taskId>
    const customId = `tasks_2_${taskId}`;

    // Create the document to add, including the custom _id
    const documentToAdd = {
      _id: customId,  // Set the custom _id
      
      ...taskData,    // Add the taskData
      type: 'task',
            // Add type: 'task' to match your view's map function
    };

    // Send the document to CouchDB
    return this.http.post<any>(url, documentToAdd, { headers }).pipe(
      catchError((error) => {
        console.error('Error adding document:', error);
        return throwError(() => error);;  // Propagate the error
      })
    );
  }
  queryAssignedTasks(empid: string): Observable<any> {
    const url = `${this.baseURL}/_design/task/_view/taskbyempid?key=${encodeURIComponent(empid)}`;
 // Use _find to query the tasks database
      
    return this.http.get<any>(url,  { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error fetching assigned tasks:', error);
        return throwError(() => error);;
      })
    );
  }
  
  updateTask(task: TaskModel): Observable<any> {
    console.log('Task after update:', task);
    
    // Use optional chaining to check for `_id` and `_rev`
    if (!task?._id || !task?._rev) {
      console.error('Task is invalid or missing _id/_rev.');
      return throwError(() => new Error('Invalid task or missing _id/_rev.'));
    }
  
    const url = `${this.baseURL}/${task._id}`;
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${this.userName}:${this.password}`),
      'Content-Type': 'application/json',
    });
  
    return this.http.put<any>(url, task, { headers }).pipe(
      catchError((error) => {
        if (error.status === 409) { // Conflict error, retry with latest _rev
          console.error('Conflict detected, fetching latest document...');
          return this.getTaskById(task._id).pipe(
            switchMap((latestTask: TaskModel) => {
              // Use optional chaining for `latestTask?._rev`
              if (!latestTask?._rev) {
                console.error('Error: Latest task is invalid or missing _rev.');
                return throwError(() => new Error('Invalid latest task or missing _rev.'));
              }
              // Retry with the latest revision (_rev)
              task._rev = latestTask._rev;
              return this.updateTask(task);
            })
          );
        } else {
          console.error('Error updating task:', error);
          return throwError(() => error);
        }
      }),
    );
  }


  getTaskById(taskId: string): Observable<TaskModel> {
    const url = `${this.baseURL}/${taskId}`;
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
      'Content-Type': 'application/json',
    });

    return this.http.get<TaskModel>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching task:', error);
        return throwError(() => error);
      })
    );
  }


  searchEmployees(name: string) {
    const url = `${this.baseURL}/_design/search/_search/byuser?q=name:${encodeURIComponent(name)}*&wildcard=true&include_docs=true`;
    return this.http.get<any>(url, { headers: this.headers });
  }



  
}

