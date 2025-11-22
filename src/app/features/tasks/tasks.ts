import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority } from '../../core/models/tasks';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClinicalData } from '../../core/clinical-data';
type TaskStatusFilter = 'all' | 'Open' | 'In Progress' | 'Done';
type TaskPriorityFilter = 'all' | TaskPriority;

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.scss'],
})
export class Tasks implements OnInit {
  private destroyRef = inject(DestroyRef);

  private tasks = signal<Task[]>([]);

  statusFilter = signal<TaskStatusFilter>('all');
  priorityFilter = signal<TaskPriorityFilter>('all');

  loading = signal(true);
  error = signal<string | null>(null);
  updatingTaskIds = signal<Set<number>>(new Set());

  filteredTasks = computed(() => {
    const items = this.tasks();
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    return items
      .filter((t) => (status === 'all' ? true : t.status === status))
      .filter((t) => (priority === 'all' ? true : t.priority === priority))
      .sort((a, b) => {
        // sort by priority then dueDate
        const priorityOrder: Record<TaskPriority, number> = {
          Critical: 1,
          High: 2,
          Normal: 3,
          Low: 4,
        };
        const pa = priorityOrder[a.priority];
        const pb = priorityOrder[b.priority];
        if (pa !== pb) return pa - pb;

        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      });
  });

  constructor(private clinicalData: ClinicalData) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clinicalData
      .getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load tasks', err);
          this.error.set('Failed to load tasks. Please try again.');
          this.loading.set(false);
        },
      });
  }

  setStatusFilter(value: TaskStatusFilter) {
    this.statusFilter.set(value);
  }

  setPriorityFilter(value: TaskPriorityFilter) {
    this.priorityFilter.set(value);
  }

  nextStatus(status: Task['status']): Task['status'] {
    if (status === 'Open') return 'In Progress';
    if (status === 'In Progress') return 'Done';
    return 'Open';
  }

  onToggleStatus(task: Task) {
    const next = this.nextStatus(task.status);

    const currentSet = new Set(this.updatingTaskIds());
    currentSet.add(task.id);
    this.updatingTaskIds.set(currentSet);

    this.clinicalData.updateTask(task.id, { status: next }).subscribe({
      next: (updated) => {
        this.tasks.update((list) =>
          list.map((t) => (t.id === updated.id ? updated : t))
        );
        const newSet = new Set(this.updatingTaskIds());
        newSet.delete(task.id);
        this.updatingTaskIds.set(newSet);
      },
      error: (err) => {
        console.error('Failed to update task', err);
        const newSet = new Set(this.updatingTaskIds());
        newSet.delete(task.id);
        this.updatingTaskIds.set(newSet);
      },
    });
  }

  formatDueDate(date?: string): string {
    if (!date) return 'No due date';
    return new Date(date).toLocaleString();
  }

  isUpdating(taskId: number): boolean {
    return this.updatingTaskIds().has(taskId);
  }
}
