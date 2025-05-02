export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  hourly_wage: number;
  created_at: string;
}

export interface Shift {
  id: string;
  user_id: string;
  company_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  memo?: string; // Add memo field as optional
}
