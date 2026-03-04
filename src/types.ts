export type Reminder = {
  id: string;
  task: string;
  datetime: string; // ISO string
  status: 'pending' | 'completed';
  createdAt: string;
  isRecurringYearly?: boolean;
};

export type UserProfile = {
  name: string;
  gender: 'M' | 'F'; // M for Sr., F for Sra.
};
