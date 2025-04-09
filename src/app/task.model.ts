
export interface TaskModel {
  _id: string;
  _rev?: string;  //  Required for CouchDB updates
  taskName: string;
  assignedTo: { name: string };
  dueDate: string;
  priority: string;
  status: string;
}
