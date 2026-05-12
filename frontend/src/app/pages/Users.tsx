import { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { useData } from '../context/DataContext';
import { User } from '../types';
import { PlusCircle, Search, UserPlus, Pencil, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { UserFormModal } from '../components/UserFormModal';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { Navigate } from 'react-router';

export const Users = () => {
  const { role } = useRole();
  const { users, addUser, updateUser, deleteUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Delete Confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);

  if (role !== 'komti') {
    return <Navigate to="/" replace />;
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nim.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Sort by NIM from smallest to largest
    return a.nim.localeCompare(b.nim, undefined, { numeric: true });
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        // Edit mode
        await updateUser(editingUser.id, userData);
        toast.success('Berhasil', {
          description: 'Data pengguna telah diperbarui.'
        });
      } else {
        // Add mode: biarkan backend yang menentukan ID (via Supabase Auth)
        await addUser(userData);
        toast.success('Berhasil', {
          description: 'Pengguna baru telah ditambahkan ke sistem.'
        });
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error('Gagal Menyimpan', { description: err.message || 'Gagal menyimpan pengguna.'});
    }
  };

  const confirmDelete = (id: string, name: string) => {
    setUserToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        toast.success('Berhasil', {
          description: 'Pengguna telah dihapus dari sistem.'
        });
        setUserToDelete(null);
      } catch (err: any) {
        toast.error('Gagal Menghapus', { description: err.message || 'Terjadi kesalahan sistem.' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Kelola Pengguna</h1>
          <p className="text-neutral-500 mt-1">Daftar mahasiswa dan admin kelas Anda</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
        <Input 
          type="text" 
          placeholder="Cari berdasarkan nama, NIM, atau email..." 
          className="pl-10 h-12 bg-white border-neutral-200 focus:border-indigo-500 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <Card key={user.id} className="overflow-hidden border-neutral-200/60 hover:shadow-md transition-shadow group bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 leading-tight">{user.name}</h3>
                      <p className="text-sm text-neutral-500 mt-0.5">{user.nim}</p>
                    </div>
                  </div>
                  <div className="flex -mr-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenModal(user)} title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => confirmDelete(user.id, user.name)} title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-5 space-y-2">
                  <div className="flex items-center text-sm text-neutral-600">
                    <svg className="w-4 h-4 mr-2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.email}
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    {user.role === 'komti' ? (
                      <><ShieldCheck className="w-4 h-4 mr-2 text-amber-500" /> <span className="font-medium text-amber-600">Admin Kelas (Komti)</span></>
                    ) : (
                      <><UserIcon className="w-4 h-4 mr-2 text-emerald-500" /> <span className="text-neutral-600">Mahasiswa</span></>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-neutral-200">
            <UserPlus className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Tidak ada pengguna ditemukan</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Kami tidak dapat menemukan pengguna yang sesuai dengan pencarian Anda, atau belum ada pengguna yang ditambahkan.
            </p>
            <Button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Tambah Pengguna
            </Button>
          </div>
        )}
      </div>

      <UserFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingUser}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};