export type AppRole = "student" | "course_rep" | "admin";
export type AccountStatus = "active" | "suspended";

export type Cohort = {
  id: string;
  department: string;
  level: "100-level" | "200-level";
  academic_session: string;
  semester: string;
  status: "active" | "inactive";
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  department: string;
  cohort_id: string | null;
  role: AppRole;
  account_status: AccountStatus;
  onboarding_completed_at: string | null;
};
