export interface User {
  id: string | null;
  password: string | null;
  username: string | null;
  token: string | null;
  status: string | null;
  creationDate: string | null; 
  birthday?: string | null;
}
