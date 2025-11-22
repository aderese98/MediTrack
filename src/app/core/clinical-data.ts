import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Patient } from './models/patients';
import { StudyOrder } from './models/study-order';
import { Appointment } from './models/appointment';
import { Task } from './models/tasks';
import { Observable } from 'rxjs';

const API_BASE_URL = 'http://localhost:4300';

@Injectable({
  providedIn: 'root',
})
export class ClinicalData {
  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${API_BASE_URL}/patients`);
  }

  getStudyOrders(): Observable<StudyOrder[]> {
    return this.http.get<StudyOrder[]>(`${API_BASE_URL}/studyOrders`);
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${API_BASE_URL}/appointments`);
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_BASE_URL}/tasks`);
  }

  getPatientById(id: number) {
    return this.http.get<Patient>(`${API_BASE_URL}/patients/${id}`);
  }

  updatePatient(id: number, payload: Omit<Patient, 'id'>) {
    return this.http.put<Patient>(`${API_BASE_URL}/patients/${id}`, payload);
  }

  updateTask(id: number, payload: Partial<Task>) {
    return this.http.patch<Task>(`${API_BASE_URL}/tasks/${id}`, payload);
  }

  createPatient(payload: Omit<Patient, 'id' | 'lastUpdated'>) {
    const body: Partial<Patient> = {
      ...payload,
      lastUpdated: new Date().toISOString(),
    };

    return this.http.post<Patient>(`${API_BASE_URL}/patients`, body);
  }
}
