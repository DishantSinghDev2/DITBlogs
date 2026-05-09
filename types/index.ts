// UserProfile kept for any legacy API consumers — trim unused fields as needed
export interface UserProfile {
  _id: string;
  email: string;
  bio?: string;
  emailVerified: boolean;
}

export interface OrgMembership {
  id: string;
  name: string;
  role: string;
  plan: string;
}
