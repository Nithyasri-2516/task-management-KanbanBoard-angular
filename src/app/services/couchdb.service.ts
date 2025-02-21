import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { TaskModel } from '../task.model';

@Injectable({
  providedIn: 'root',
})
export class CouchdbService {
  readonly baseURL = 'https://192.168.57.185:5984/demo_24';
  readonly userName = 'd_couchdb';
  readonly password = 'Welcome#2';

  private headers = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
    'Content-Type': 'application/json',
  });



  private loggedInUser: any = null; // Store user info

  constructor(private http: HttpClient) { }

  //   login(email: string, password: string): Observable<any> {
  //   const url = `${this.baseURL}/_find`; // Base URL for the database
  //   const query = {
  //     selector: {
  //       email: email,
  //       password: password,
  //     },
  //   };

  //   return this.http.post<any>(url, query, { headers: this.headers }).pipe(
  //     catchError((error) => {
  //       console.error('Error during login:', error);
  //       return throwError(error);
  //     })
  //   );
  // }

  // setLoggedInUser(user: any) {
  //   // Assuming user has an '_id' field which we want to modify
  //   const userId = user._id ? `user_2_${user._id}` : `user_2_${new Date().getTime()}`;  // Generate unique ID if not available

  //   user._id = userId; // Modify the ID format to user_2_<id>
  //   this.loggedInUser = user; // Store user in service

  //   // Save user to localStorage with updated _id format
  //   localStorage.setItem('currentUser', JSON.stringify(user));
  // }

  // getLoggedInUser() {
  //   if (!this.loggedInUser) {
  //     this.loggedInUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  //   }
  //   return this.loggedInUser; // Retrieve user from service or localStorage
  // }



  // logout() {
  //   this.loggedInUser = null; // Clear user session
  //   localStorage.removeItem('currentUser'); // Clear from localStorage
  //   console.log('User logged out');
  // }

  //   createDocument(document: any): Observable<any> {
  //     return this.http.post<any>(this.baseURL, document, { headers: this.headers }).pipe(
  //       catchError((error) => {
  //         console.error('Error creating document:', error);
  //         return throwError(error);
  //       })
  //     );
  //   }


  //   readDocument(id: string): Observable<any> {
  //     const url = `${this.baseURL}/${id}`;
  //     return this.http.get<any>(url, { headers: this.headers }).pipe(
  //       catchError((error) => {
  //         console.error('Error reading document:', error);
  //         return throwError(error);
  //       })
  //     );
  //   }


  //   updateDocument(document: any): Observable<any> {
  //     const url = `${this.baseURL}/${document._id}`;
  //     return this.http.put<any>(url, document, { headers: this.headers }).pipe(
  //       catchError((error) => {
  //         console.error('Error updating document:', error);
  //         return throwError(error);
  //       })
  //     );
  //   }


  //   deleteDocument(id: string, rev: string): Observable<any> {
  //     const url = `${this.baseURL}/${id}?rev=${rev}`;
  //     return this.http.delete<any>(url, { headers: this.headers }).pipe(
  //       catchError((error) => {
  //         console.error('Error deleting document:', error);
  //         return throwError(error);
  //       })
  //     );
  //   }


  //   queryDocuments(query: any): Observable<any> {
  //     const url = `${this.baseURL}/_find`;
  //     return this.http.post<any>(url, query, { headers: this.headers }).pipe(
  //       catchError((error) => {
  //         console.error('Error querying documents:', error);
  //         return throwError(error);
  //       })
  //     );
  //   }





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
        return throwError(error);
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
    if (!this.loggedInUser) {
      this.loggedInUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }
    return this.loggedInUser; // Retrieve user from service or localStorage
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
        return throwError(error);
      })
    );
  }

  // Read Document by ID
  readDocument(id: string): Observable<any> {
    const url = `${this.baseURL}/${id}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error reading document:', error);
        return throwError(error);
      })
    );
  }

  // Update Document - Update existing employee document
  updateDocument(document: any): Observable<any> {
    const url = `${this.baseURL}/${document._id}`;
    return this.http.put<any>(url, document, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error updating document:', error);
        return throwError(error);
      })
    );
  }

  // Delete Document
  deleteDocument(id: string, rev: string): Observable<any> {
    const url = `${this.baseURL}/${id}?rev=${rev}`;
    return this.http.delete<any>(url, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error deleting document:', error);
        return throwError(error);
      })
    );
  }

  // Query Documents - For querying employees or any type of document
  queryDocuments(): Observable<any> {
    const url = `${this.baseURL}/_design/task/_view/user`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error querying documents:', error);
        return throwError(error);
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
        return throwError(error);
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
      type: 'task',   // Add type: 'task' to match your view's map function
    };

    // Send the document to CouchDB
    return this.http.post<any>(url, documentToAdd, { headers }).pipe(
      catchError((error) => {
        console.error('Error adding document:', error);
        return throwError(error);  // Propagate the error
      })
    );
  }

  queryAssignedTasks(empid: string): Observable<any> {
    const url = `${this.baseURL}/_design/task/_view/taskbyempid?key="${empid}"`; // Use _find to query the tasks database
      
    return this.http.get<any>(url,  { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error fetching assigned tasks:', error);
        return throwError(error);
      })
    );
  }



  updateTask(task: TaskModel): Observable<any> {
    console.log('Task after update:', task);

    if (!task || !task._id || !task._rev) {
      console.error('Task is invalid or missing _id/_rev.');
      return throwError(() => new Error('Invalid task or missing _id/_rev.'));
    }

    const url = `${this.baseURL}/${task._id}`;
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
      'Content-Type': 'application/json',
    });

    return this.http.put<any>(url, task, { headers }).pipe(
      catchError((error) => {
        if (error.status === 409) { // Conflict error, retry with latest _rev
          console.error('Conflict detected, fetching latest document...');
          return this.getTaskById(task._id).pipe(
            switchMap((latestTask: TaskModel) => {
              if (!latestTask || !latestTask._rev) {
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


  // Method to delete a task from the database by its _id


  // Method to soft delete a task (update the task with a "deleted" flag)
  delete(taskId: string): Observable<any> {
    const url = `${this.baseURL}/${taskId}`; // URL to fetch the task by its ID
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
      'Content-Type': 'application/json',
    });

    // Step 1: Fetch the document to get its _rev (revision)
    return this.http.get<any>(url, { headers }).pipe(
      // Step 2: Update the task to mark it as deleted
      switchMap((doc) => {
        // Mark the task as deleted by adding the 'deleted' field
        const updatedDoc = {
          ...doc,
          deleted: true, // Soft delete flag
        };

        // Step 3: Perform the update to the document with the new 'deleted' field
        const updateUrl = `${this.baseURL}/${taskId}?rev=${doc._rev}`; // Add the _rev for the update
        return this.http.put<any>(updateUrl, updatedDoc, { headers }).pipe(
          catchError((error) => {
            console.error('Error updating document:', error);
            return throwError(error); // Propagate the error
          })
        );
      }),
      catchError((error) => {
        console.error('Error fetching document for soft delete:', error);
        return throwError(error); // Propagate the error
      })
    );
  }




}

