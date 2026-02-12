export interface AppointmentItem {
  id: string;
  patientId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  patient: {
    id: string;
    name: string;
  };
}
