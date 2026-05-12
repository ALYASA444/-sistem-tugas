import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from '../types';
import { Save } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
  initialData?: User | null;
}

export const UserFormModal = ({ isOpen, onClose, onSubmit, initialData }: UserFormModalProps) => {
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
    name: '',
    nim: '',
    email: '',
    password: '',
    role: 'mahasiswa'
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        nim: initialData.nim || '',
        email: initialData.email || '',
        password: '',
        role: initialData.role || 'mahasiswa'
      });
    } else if (!initialData && isOpen) {
      setFormData({
        name: '',
        nim: '',
        email: '',
        password: '',
        role: 'mahasiswa'
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as 'mahasiswa' | 'komti' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nim || !formData.email) return;
    if (!initialData && !formData.password) return; // Wajib password jika user baru
    onSubmit(formData as Partial<User>);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] w-full p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-neutral-800">
            {initialData ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-500">
            {initialData ? 'Perbarui informasi pengguna di bawah ini.' : 'Isi formulir berikut untuk menambahkan mahasiswa/admin baru.'}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={handleSubmit} className="space-y-4 py-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Contoh: Budi Santoso" autoComplete="off" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nim">NIM <span className="text-red-500">*</span></Label>
              <Input id="nim" name="nim" value={formData.nim} onChange={handleChange} required placeholder="Contoh: 2201010101" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Peran <span className="text-red-500">*</span></Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  <SelectItem value="komti">Admin / Komti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Contoh: budi@student.univ.edu" autoComplete="new-email" />
          </div>

          <div className="space-y-2 border-t pt-4 mt-2">
            <Label htmlFor="password">
              Kata Sandi Login {initialData ? <span className="text-xs text-neutral-400 font-normal">(Kosongkan jika tidak ingin diubah)</span> : <span className="text-red-500">*</span>}
            </Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required={!initialData} placeholder="Min. 6 karakter" minLength={6} autoComplete="new-password" />
            <p className="text-xs text-neutral-500">Kata sandi ini digunakan untuk masuk ke SistemKelas.</p>
          </div>

        </form>

        <DialogFooter className="mt-6 flex sm:justify-end gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button type="submit" form="user-form" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {initialData ? 'Simpan Perubahan' : 'Tambah Pengguna'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
