import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalData } from '../../core/clinical-data';
import { StudyOrder, Modality, StudyStatus } from '../../core/models/study-order';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-studies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './studies.html',
  styleUrls: ['./studies.scss'],
})
export class StudiesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  private studies = signal<StudyOrder[]>([]);

  modalityFilter = signal<'all' | Modality>('all');
  statusFilter = signal<'all' | StudyStatus>('all');

  loading = signal(true);
  error = signal<string | null>(null);

  filteredStudies = computed(() => {
    let items = this.studies();

    const modality = this.modalityFilter();
    if (modality !== 'all') {
      items = items.filter((s) => s.modality === modality);
    }

    const status = this.statusFilter();
    if (status !== 'all') {
      items = items.filter((s) => s.status === status);
    }

    return items.slice().sort((a, b) => {
      const av = new Date(a.scheduledFor).getTime();
      const bv = new Date(b.scheduledFor).getTime();
      return av - bv;
    });
  });

  constructor(private clinicalData: ClinicalData) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clinicalData
      .getStudyOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => {
          this.studies.set(orders);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load study orders', err);
          this.error.set('Failed to load study orders. Please try again.');
          this.loading.set(false);
        },
      });
  }

  onModalityChange(value: string): void {
    if (value === 'all' || value === 'PET' || value === 'CT' || value === 'MRI' || value === 'NM') {
      this.modalityFilter.set(value as 'all' | Modality);
    }
  }

  onStatusChange(value: string): void {
    if (
      value === 'all' ||
      value === 'Scheduled' ||
      value === 'In Progress' ||
      value === 'Completed' ||
      value === 'Cancelled'
    ) {
      this.statusFilter.set(value as 'all' | StudyStatus);
    }
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString();
  }
}
