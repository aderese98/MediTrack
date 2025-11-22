import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Patient } from '../../core/models/patients';
import { StudyOrder } from '../../core/models/study-order';
import { Appointment } from '../../core/models/appointment';
import { Task } from '../../core/models/tasks';
import { ClinicalData } from '../../core/clinical-data';


interface DashboardStats {
  activePatients: number;
  scheduledStudies: number;
  todaysAppointments: number;
  openTasks: number;
  highPriorityOpenTasks: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal<string | null>(null);

  stats = signal<DashboardStats | null>(null);

  // quick view of “today”
  today = new Date();
  todayLabel = computed(() =>
    this.today.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  );

  constructor(private clinicalData: ClinicalData) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      patients: this.clinicalData.getPatients(),
      studies: this.clinicalData.getStudyOrders(),
      appts: this.clinicalData.getAppointments(),
      tasks: this.clinicalData.getTasks(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ patients, studies, appts, tasks }) => {
          this.stats.set(this.computeStats(patients, studies, appts, tasks));
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load dashboard data', err);
          this.error.set('Failed to load dashboard data. Please try again.');
          this.loading.set(false);
        },
      });
  }

  private computeStats(
    patients: Patient[],
    studies: StudyOrder[],
    appts: Appointment[],
    tasks: Task[]
  ): DashboardStats {
    const activePatients = patients.filter((p) => p.status === 'Active').length;
    const scheduledStudies = studies.filter((s) => s.status === 'Scheduled')
      .length;

    const startOfToday = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate()
    );
    const endOfToday = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate() + 1
    );

    const todaysAppointments = appts.filter((a) => {
      const start = new Date(a.startTime);
      return start >= startOfToday && start < endOfToday;
    }).length;

    const openTasks = tasks.filter((t) => t.status !== 'Done').length;

    const highPriorityOpenTasks = tasks.filter(
      (t) =>
        t.status !== 'Done' && (t.priority === 'High' || t.priority === 'Critical')
    ).length;

    return {
      activePatients,
      scheduledStudies,
      todaysAppointments,
      openTasks,
      highPriorityOpenTasks,
    };
  }
}
