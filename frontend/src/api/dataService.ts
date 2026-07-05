import { Task, Announcement, Material, User } from '../app/types';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    const raw = localStorage.getItem('sistemkelas_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
  } catch { /* ignore */ }
  return headers;
}

const handleResponse = async (response: Response): Promise<any> => {
  if (response.status === 401) {
    localStorage.removeItem('sistemkelas_auth');
    window.location.href = '/login';
    throw new Error('Sesi berakhir. Silakan login ulang.');
  }
  const text = await response.text();
  if (!text) {
    if (!response.ok) throw new Error('Server error');
    return {};
  }
  try {
    const data = JSON.parse(text);
    if (!response.ok) throw new Error(data.error || 'Server error');
    return data;
  } catch (e: any) {
    if (!response.ok) throw new Error('Server error');
    throw new Error('Invalid response from server');
  }
};

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

// --- Users ---
const jsonHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders()
});

export const fetchUsers = async (): Promise<User[]> => handleResponse(await fetch(`${API_URL}/users`, { headers: getAuthHeaders() }));
export const createUser = async (user: Partial<User>): Promise<User> => handleResponse(await fetch(`${API_URL}/users`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify(user)
}));
export const updateUser = async (id: string, user: Partial<User>): Promise<User> => handleResponse(await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT', headers: jsonHeaders(), body: JSON.stringify(user)
}));
export const deleteUser = async (id: string): Promise<{ success: boolean }> => handleResponse(await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() }));

// --- Tasks ---
export const fetchTasks = async (): Promise<Task[]> => handleResponse(await fetch(`${API_URL}/tasks`, { headers: getAuthHeaders() }));
export const createTask = async (taskData: Record<string, any>): Promise<Task> => {
    const fd = createMultiPartData(taskData);
    const headers = getAuthHeaders();
    delete headers['Content-Type'];
    return handleResponse(await fetch(`${API_URL}/tasks`, { method: 'POST', headers, body: fd }));
};
export const updateTask = async (id: string, taskData: Record<string, any>): Promise<Task> => {
    const fd = createMultiPartData(taskData);
    const headers = getAuthHeaders();
    delete headers['Content-Type'];
    return handleResponse(await fetch(`${API_URL}/tasks/${id}`, { method: 'PUT', headers, body: fd }));
};
export const deleteTask = async (id: string): Promise<{ success: boolean }> => handleResponse(await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE', headers: getAuthHeaders() }));

export const submitTaskStatus = async (id: string, userId: string, cancel: boolean = false): Promise<{ success: boolean }> =>
  handleResponse(await fetch(`${API_URL}/tasks/${id}/submit`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ userId, cancel })
}));

// --- Materials ---
export const fetchMaterials = async (): Promise<Material[]> => handleResponse(await fetch(`${API_URL}/materials`, { headers: getAuthHeaders() }));
export const createMaterial = async (matData: Record<string, any>): Promise<Material> => {
    const fd = createMultiPartData(matData);
    const headers = getAuthHeaders();
    delete headers['Content-Type'];
    return handleResponse(await fetch(`${API_URL}/materials`, { method: 'POST', headers, body: fd }));
};
export const updateMaterial = async (id: string, matData: Record<string, any>): Promise<Material> => {
    const fd = createMultiPartData(matData);
    const headers = getAuthHeaders();
    delete headers['Content-Type'];
    return handleResponse(await fetch(`${API_URL}/materials/${id}`, { method: 'PUT', headers, body: fd }));
};
export const deleteMaterial = async (id: string): Promise<{ success: boolean }> => handleResponse(await fetch(`${API_URL}/materials/${id}`, { method: 'DELETE', headers: getAuthHeaders() }));

// --- Announcements ---
export const fetchAnnouncements = async (): Promise<Announcement[]> => handleResponse(await fetch(`${API_URL}/announcements`, { headers: getAuthHeaders() }));
export const createAnnouncement = async (annData: Record<string, any>): Promise<Announcement> => {
    const fd = createMultiPartData(annData);
    const headers = getAuthHeaders();
    delete headers['Content-Type'];
    return handleResponse(await fetch(`${API_URL}/announcements`, { method: 'POST', headers, body: fd }));
};
export const updateAnnouncement = async (id: string, annData: Record<string, any>): Promise<Announcement> => {
    const fd = createMultiPartData(annData);
    const headers = getAuthHeaders();
    delete headers['Content-Type'];
    return handleResponse(await fetch(`${API_URL}/announcements/${id}`, { method: 'PUT', headers, body: fd }));
};
export const deleteAnnouncement = async (id: string): Promise<{ success: boolean }> => handleResponse(await fetch(`${API_URL}/announcements/${id}`, { method: 'DELETE', headers: getAuthHeaders() }));
