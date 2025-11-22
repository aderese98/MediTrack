import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClinicalData } from '../../core/clinical-data';
import { Appointment } from '../../core/models/appointment';
type ScheduleRange = 'today' | 'week' | 'all';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class Schedule implements OnInit {
  private destroyRef = inject(DestroyRef);

  private appointments = signal<Appointment[]>([]);

  range = signal<ScheduleRange>('today');
  loading = signal(true);
  error = signal<string | null>(null);

  today = new Date();

  filteredAppointments = computed(() => {
    const all = this.appointments();
    const range = this.range();

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
    const weekAhead = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate() + 7
    );

    return all
      .filter((appt) => {
        const start = new Date(appt.startTime);
        if (range === 'today') {
          return start >= startOfToday && start < endOfToday;
        }
        if (range === 'week') {
          return start >= startOfToday && start < weekAhead;
        }
        return start >= startOfToday; // 'all' upcoming
      })
      .sort((a, b) => {
        const av = new Date(a.startTime).getTime();
        const bv = new Date(b.startTime).getTime();
        return av - bv;
      });
  });

  constructor(private clinicalData: ClinicalData) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clinicalData
      .getAppointments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appts) => {
          this.appointments.set(appts);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load appointments', err);
          this.error.set('Failed to load appointments. Please try again.');
          this.loading.set(false);
        },
      });
  }

  setRange(range: ScheduleRange) {
    this.range.set(range);
  }

  formatTimeRange(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
