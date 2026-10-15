
export interface MeasurementInt {
  measure_id: number;
  device_id: number;
  temperature: string;
  pressure: string;
  humidity?: string;
  createdAt: string;
}
