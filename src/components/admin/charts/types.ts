
export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export interface TimeFilteredData {
  name: string;
  weighIns?: number;
  fasts?: number;
  exercises?: number;
  count?: number;
}

export interface ActivityLogItem {
  date: Date | string;
  type: 'weighIn' | 'fast' | 'exercise';
}

// Chart configuration
// Changed from export type to export const
export const chartConfig = {
  weighIns: {
    label: "Weigh-ins",
    color: "#38bdf8",
  },
  fasts: {
    label: "Fasting Logs",
    color: "#fb923c",
  },
  exercises: {
    label: "Exercise Logs",
    color: "#4ade80",
  },
};
