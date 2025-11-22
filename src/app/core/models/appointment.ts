export type AppointmentType = 'Consult' | 'Imaging' | 'Therapy' | 'Follow-up';

export interface Appointment {
    id: number;
    patientId: number;
    type: AppointmentType;
    startTime: string;
    endTime: string;
    location: string;
    clinician: string;
    status: 'Scheduled' | 'Checked In' | 'Completed' | 'No Show';
}