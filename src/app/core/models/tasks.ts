export type TaskPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export interface Task {
    id: number;
    title: string;
    patientId?: number;
    assignedTo: string;
    dueDate?: string;
    priority: TaskPriority;
    status: 'Open' | 'In Progress' | 'Done';
}