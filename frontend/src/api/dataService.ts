import { Task, Announcement, Material, User } from '../app/types';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

type ApiResponse<T> = T | { error?: string };

const handleResponse = async (response: Response): Promise<any> => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Server error');
    return data;
};

// Helper for multipart/form-data payload creation
const createMultiPartData = (dataObj: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.keys(dataObj).forEach(key => {
        if ((key === 'imageFile' || key === 'pdfFile') && dataObj[key]) {
            formData.append(key, dataObj[key]);
        } else if (dataObj[key] !== undefined && dataObj[key] !== null) {
            formData.append(key, dataObj[key]);
        }
    });
    return formData;
};

// --- Users --- (Json remain valid since no files)
export const fetchUsers = async (): Promise<User[]> => handleResponse(await fetch(`${API_URL}/users`));
export const createUser = async (user: Partial<User>): Promise<User> => handleResponse(await fetch(`${API_URL}/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user)
}));
export const updateUser = async (id: string, user: Partial<User>): Promise<User> => handleResponse(await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user)
}));
export const deleteUser = async (id: string): Promise<{ success: boolean }> => handleResponse(await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }));

// --- Tasks --- (FormData)
export const fetchTasks = async (): Promise<Task[]> => handleResponse(await fetch(`${API_URL}/tasks`));
export const createTask = async (taskData: Record<string, any>): Promise<Task> => 
    handleResponse(await fetch(`${API_URL}/tasks`, { method: 'POST', body: createMultiPartData(taskData) }));
export const updateTask = async (id: string, taskData: Record<string, any>): Promise<Task> => 
    handleResponse(await fetch(`${API_URL}/tasks/${id}`, { method: 'PUT', body: createMultiPartData(taskData) }));
export const deleteTask = async (id: string): Promise<{ success: boolean }> => handleResponse(await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' }));

// Task Completion Tracking
export const submitTaskStatus = async (id: string, userId: string, cancel: boolean = false): Promise<{ success: boolean }> => 
  handleResponse(await fetch(`${API_URL}/tasks/${id}/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, cancel })
}));

// --- Materials --- (FormData)
export const fetchMaterials = async (): Promise<Material[]> => handleResponse(await fetch(`${API_URL}/materials`));
export const createMaterial = async (matData: Record<string, any>): Promise<Material> => 
    handleResponse(await fetch(`${API_URL}/materials`, { method: 'POST', body: createMultiPartData(matData) }));
export const updateMaterial = async (id: string, matData: Record<string, any>): Promise<Material> => 
    handleResponse(await fetch(`${API_URL}/materials/${id}`, { method: 'PUT', body: createMultiPartData(matData) }));
export const deleteMaterial = async (id: string): Promise<{ success: boolean }> => handleResponse(await fetch(`${API_URL}/materials/${id}`, { method: 'DELETE' }));

// --- Announcements --- (FormData)
export const fetchAnnouncements = async (): Promise<Announcement[]> => handleResponse(await fetch(`${API_URL}/announcements`));
export const createAnnouncement = async (annData: Record<string, any>): Promise<Announcement> => 
    handleResponse(await fetch(`${API_URL}/announcements`, { method: 'POST', body: createMultiPartData(annData) }));
export const updateAnnouncement = async (id: string, annData: Record<string, any>): Promise<Announcement> => 
    handleResponse(await fetch(`${API_URL}/announcements/${id}`, { method: 'PUT', body: createMultiPartData(annData) }));
export const deleteAnnouncement = async (id: string): Promise<{ success: boolean }> => handleResponse(await fetch(`${API_URL}/announcements/${id}`, { method: 'DELETE' }));
