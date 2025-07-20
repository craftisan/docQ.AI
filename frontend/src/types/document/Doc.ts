import { User } from "@/types/auth/User";

export interface Doc {
  id: number;
  name: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}