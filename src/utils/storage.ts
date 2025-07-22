import { Submission, User } from '@/types';

const STORAGE_KEYS = {
  USER: 'query_eval_user',
  SUBMISSIONS: 'query_eval_submissions',
  IS_LOGGED_IN: 'query_eval_logged_in'
};

export const storageUtils = {
  // User management
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  isLoggedIn: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  },

  // Submissions management
  addSubmission: (submission: Submission) => {
    const submissions = storageUtils.getSubmissions();
    submissions.push(submission);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  },

  getSubmissions: (): Submission[] => {
    const submissionsStr = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return submissionsStr ? JSON.parse(submissionsStr) : [];
  },

  getUserSubmissions: (userId: string): Submission[] => {
    const submissions = storageUtils.getSubmissions();
    return submissions.filter(sub => sub.userId === userId);
  }
};