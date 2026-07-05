import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, Announcement, Material, User } from '../types';
import * as api from '../../api/dataService';
import { AuthExpiredError } from '../../api/dataService';
import { toast } from 'sonner';
import { useRole } from './RoleContext';

interface DataContextType {
  tasks: Task[];
  announcements: Announcement[];
  materials: Material[];
  users: User[];
  refreshData: () => Promise<void>;
  addTask: (task: Record<string, any>) => Promise<void>;
  updateTask: (id: string, updatedTask: Record<string, any>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  submitTaskData: (id: string, link?: string, file?: string) => Promise<void>;
  cancelTaskSubmission: (id: string) => Promise<void>;
  addAnnouncement: (ann: Record<string, any>) => Promise<void>;
  updateAnnouncement: (id: string, updatedAnnouncement: Record<string, any>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addMaterial: (mat: Record<string, any>) => Promise<void>;
  updateMaterial: (id: string, updatedMaterial: Record<string, any>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  addUser: (user: Partial<User>) => Promise<void>;
  updateUser: (id: string, updatedUser: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { userId } = useRole();

  const refreshData = useCallback(async () => {
    let errorCount = 0;
    let isAuthExpired = false;

    const handleError = (name: string, err: any) => {
      if (err instanceof AuthExpiredError) { isAuthExpired = true; throw err; }
      console.error(`${name} error:`, err);
      errorCount++;
      return [];
    };

    try {
      const [tsks, anns, mats, usrs] = await Promise.all([
        api.fetchTasks().catch(err => handleError('fetchTasks', err)),
        api.fetchAnnouncements().catch(err => handleError('fetchAnnouncements', err)),
        api.fetchMaterials().catch(err => handleError('fetchMaterials', err)),
        api.fetchUsers().catch(err => handleError('fetchUsers', err)),
      ]);

      setTasks(tsks);
      setAnnouncements(anns);
      setMaterials(mats);
      setUsers(usrs);

      if (errorCount > 0) {
        toast.error('Gagal mengambil data dari server. Periksa koneksi.');
      }
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        toast.info('Sesi berakhir. Mengarahkan ke halaman login...');
      }
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData, userId]);

  const addTask = async (taskData: Record<string, any>) => {
    const newTask = await api.createTask(taskData);
    setTasks(prev => [...prev, newTask]);
  };
  const updateTask = async (id: string, taskData: Record<string, any>) => {
    const updated = await api.updateTask(id, taskData);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };
  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const submitTaskData = async (id: string, link?: string, file?: string) => {
    if (!userId) {
      toast.error('Gagal: ID Pengguna tidak ditemukan');
      return;
    }
    await api.submitTaskStatus(id, userId, false);
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newComps = t.completedBy ? [...t.completedBy] : [];
        if (!newComps.includes(userId)) newComps.push(userId);
        return { ...t, completedBy: newComps, status: 'submitted' };
      }
      return t;
    }));
  };

  const cancelTaskSubmission = async (id: string) => {
    if (!userId) return;
    await api.submitTaskStatus(id, userId, true);
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newComps = t.completedBy ? t.completedBy.filter(uid => uid !== userId) : [];
        const now = new Date();
        const deadline = t.deadline ? new Date(t.deadline) : null;
        const status = deadline && deadline < now ? 'overdue' : 'pending';
        return { ...t, completedBy: newComps, status };
      }
      return t;
    }));
  };

  const addAnnouncement = async (ann: Record<string, any>) => {
    const newAnn = await api.createAnnouncement(ann);
    setAnnouncements(prev => [newAnn, ...prev]);
  };
  const updateAnnouncement = async (id: string, annData: Record<string, any>) => {
    const updated = await api.updateAnnouncement(id, annData);
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };
  const deleteAnnouncement = async (id: string) => {
    await api.deleteAnnouncement(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const addMaterial = async (mat: Record<string, any>) => {
    const newMat = await api.createMaterial(mat);
    setMaterials(prev => [newMat, ...prev]);
  };
  const updateMaterial = async (id: string, matData: Record<string, any>) => {
    const updated = await api.updateMaterial(id, matData);
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
  };
  const deleteMaterial = async (id: string) => {
    await api.deleteMaterial(id);
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addUser = async (user: Partial<User>) => {
    const nU = await api.createUser(user);
    setUsers(prev => [...prev, nU]);
  };
  const updateUser = async (id: string, user: Partial<User>) => {
    const u = await api.updateUser(id, user);
    setUsers(prev => prev.map(x => x.id === id ? { ...x, ...u } : x));
  };
  const deleteUser = async (id: string) => {
    await api.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <DataContext.Provider value={{
      tasks, announcements, materials, users, refreshData,
      addTask, updateTask, deleteTask, submitTaskData, cancelTaskSubmission,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      addMaterial, updateMaterial, deleteMaterial,
      addUser, updateUser, deleteUser
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) { throw new Error('useData must be used within a DataProvider'); }
  return context;
};
