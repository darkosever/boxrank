import api from './client';

export const auth = {
  register: (email: string, password: string, role: string) =>
    api.post('/auth/register', { email, password, role }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
};

export const weightClasses = {
  getAll: () => api.get<WeightClass[]>('/weight-classes'),
  create: (data: Omit<WeightClass, 'id'>) => api.post('/weight-classes', data),
  update: (id: number, data: Omit<WeightClass, 'id'>) => api.put(`/weight-classes/${id}`, data),
  remove: (id: number) => api.delete(`/weight-classes/${id}`),
};

export const boxers = {
  search: (params?: Record<string, unknown>) => api.get<{ total: number; data: Boxer[] }>('/boxers', { params }),
  getById: (id: number) => api.get<Boxer>(`/boxers/${id}`),
  create: (data: unknown) => api.post<Boxer>('/boxers', data),
  update: (id: number, data: unknown) => api.put<Boxer>(`/boxers/${id}`, data),
  suspend: (id: number, reason: string) => api.put(`/boxers/${id}/suspend`, { reason }),
  activate: (id: number) => api.put(`/boxers/${id}/activate`),
  getFights: (id: number) => api.get<FightHistory>(`/fights/boxer/${id}`),
};

export const clubs = {
  getById: (id: number) => api.get<Club>(`/clubs/${id}`),
  update: (id: number, data: { name: string; location: string }) => api.put(`/clubs/${id}`, data),
  getBoxers: (id: number) => api.get<Boxer[]>(`/clubs/${id}/boxers`),
};

export const fights = {
  create: (data: unknown) => api.post<Fight>('/fights', data),
  getPending: () => api.get<Fight[]>('/fights/pending'),
  confirm: (id: number) => api.put(`/fights/${id}/confirm`),
  reject: (id: number, reason: string) => api.put(`/fights/${id}/reject`, { reason }),
};

export const events = {
  getAll: () => api.get<Event[]>('/events'),
  getById: (id: number) => api.get<Event>(`/events/${id}`),
  create: (data: { name: string; date: string; location: string }) => api.post<Event>('/events', data),
};

export const rankings = {
  get: (weightClassId: number, page = 1) =>
    api.get<RankingResponse>('/rankings', { params: { weightClassId, page } }),
  getSuggestions: (boxerId: number) =>
    api.get<Suggestion[]>(`/rankings/suggestions/${boxerId}`),
  getHistory: (boxerId: number) =>
    api.get<RatingHistory[]>(`/rankings/history/${boxerId}`),
};

// --- Types ---
export interface User { id: number; email: string; role: string; }
export interface WeightClass { id: number; name: string; minWeight: number; maxWeight: number; }
export interface Club { id: number; name: string; location: string; promoter?: { id: number; email: string; }; }
export interface Boxer {
  id: number; firstName: string; lastName: string; dateOfBirth: string;
  currentRating: number; status: string; suspendReason?: string; photoUrl?: string;
  club: Club; weightClass: WeightClass;
}
export interface Fight {
  id: number; date: string; result: string; status: string; rejectReason?: string;
  boxer1: { id: number; firstName: string; lastName: string; };
  boxer2: { id: number; firstName: string; lastName: string; };
  winner?: { id: number; firstName: string; lastName: string; };
  event: { id: number; name: string; date: string; };
}
export interface FightHistory { summary: { wins: number; losses: number; draws: number }; fights: Fight[]; }
export interface Event { id: number; name: string; date: string; location: string; fights?: Fight[]; }
export interface RankingResponse {
  weightClass: WeightClass; total: number; page: number; limit: number;
  data: Array<{ rank: number } & Boxer>;
}
export interface Suggestion {
  id: number; firstName: string; lastName: string; currentRating: number;
  ratingDiff: number; recentFightDate: string | null; club: Club;
}
export interface RatingHistory {
  id: number; ratingBefore: number; ratingAfter: number; createdAt: string;
  fight: { date: string; result: string; boxer1: { id: number; firstName: string; lastName: string; }; boxer2: { id: number; firstName: string; lastName: string; }; winner?: { id: number; }; };
}
