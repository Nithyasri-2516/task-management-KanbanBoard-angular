// export interface TaskModel {
//     _id: any;
//     _rev?: string; 
//     taskName: string;
//     assignedTo: {
//       email: string;
//       empid: string;
//       name: string;
//       password: string;
//       _id: string;
//       _rev?: string; // This is optional for new tasks, but CouchDB may generate it after saving
//     };
//     dueDate: string; // or Date if you're using Date objects
//     status:string,
//     priority: string;
//   }
  

export interface TaskModel {
  _id: string;
  _rev?: string;  //  Required for CouchDB updates
  taskName: string;
  assignedTo: { name: string };
  dueDate: string;
  priority: string;
  status: string;
}
