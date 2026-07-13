import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Submission {
  id: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  createdAt: number;
  delivered: boolean;
}

interface SubmissionState {
  submissions: Submission[];
  add: (s: Omit<Submission, "id" | "createdAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useSubmissions = create<SubmissionState>()(
  persist(
    (set) => ({
      submissions: [],
      add: (s) =>
        set((state) => ({
          submissions: [
            {
              ...s,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
            ...state.submissions,
          ],
        })),
      remove: (id) =>
        set((state) => ({
          submissions: state.submissions.filter((s) => s.id !== id),
        })),
      clear: () => set({ submissions: [] }),
    }),
    { name: "nextgen-submissions" }
  )
);
