import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Patients } from './features/patients/patients';
import { StudiesComponent } from './features/studies/studies';
import { Schedule } from './features/schedule/schedule';
import { Tasks } from './features/tasks/tasks';
import { PatientForm } from './features/patient-form/patient-form';
import { PatientEdit } from './features/patient-edit/patient-edit';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        component: Dashboard,
    },
    {
        path: 'patients',
        component: Patients,
    },
    {
        path: 'studies',
        component: StudiesComponent,
    },
    {
        path: 'schedule',
        component: Schedule,
    },
    {
        path: 'tasks',
        component: Tasks,
    },
    {
        path: 'patients/new',
        component: PatientForm,
    },
    {
        path: 'patients/:id/edit',
        component: PatientEdit
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    }
];
