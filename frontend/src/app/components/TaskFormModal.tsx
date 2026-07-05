import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Task } from '../types';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  onDelete?: () => void;
  initialData?: Task | null;
}

export const TaskFormModal = ({ isOpen, onClose, onSubmit, onDelete, initialData }: TaskFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    course: '',
    description: '',
    deadline: '',
    requiresSubmission: true,
    submissionUrl: '',
    imageUrl: '',
    attachmentUrl: ''
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const getLocalIsoString = (dateStr: string) => {
    const d = new Date(dateStr);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        course: initialData.course || '',
        description: initialData.description || '',
        deadline: initialData.deadline ? getLocalIsoString(initialData.deadline) : '',
        requiresSubmission: initialData.requiresSubmission ?? true,
        submissionUrl: initialData.submissionUrl || '',
        imageUrl: initialData.imageUrl || '',
        attachmentUrl: initialData.attachmentUrl || ''
      });
      setImageFile(null);
      setPdfFile(null);
    } else if (!initialData && isOpen) {
      // Reset to default
      setFormData({
        title: '',
        course: '',
        description: '',
        deadline: '',
        requiresSubmission: true,
        submissionUrl: '',
        imageUrl: '',
        attachmentUrl: ''
      });
      setImageFile(null);
      setPdfFile(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setFormData(prev => ({ ...prev, attachmentUrl: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!formData.title || !formData.course || !formData.deadline) return;
    
    // Ensure deadline is stored as ISO string if needed, or keeping local time format depending on how app parses it
    onSubmit({
      ...formData,
      status: initialData ? initialData.status : 'pending',
      imageFile: imageFile || undefined,
      pdfFile: pdfFile || undefined
    } as any); 
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Tugas' : 'Tambah Tugas Baru'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Perbarui informasi tugas yang sudah ada.' : 'Isi detail untuk membuat tugas baru bagi kelas.'}
          </DialogDescription>
        </DialogHeader>
        
        <form id="task-form" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Tugas <span className="text-red-500">*</span></Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Contoh: Tugas Mandiri Pertemuan 5" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Mata Kuliah <span className="text-red-500">*</span></Label>
              <Input id="course" name="course" value={formData.course} onChange={handleChange} required placeholder="Contoh: Pemrograman Web" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Tenggat Waktu <span className="text-red-500">*</span></Label>
              <Input id="deadline" name="deadline" type="datetime-local" value={formData.deadline} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Tugas</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Jelaskan detail tugas di sini..." />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="requiresSubmission" 
              checked={formData.requiresSubmission} 
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresSubmission: checked }))} 
            />
            <Label htmlFor="requiresSubmission" className="cursor-pointer">Wajib Mengumpulkan Melalui Link (G-Drive dll)</Label>
          </div>
          
          {formData.requiresSubmission && (
            <div className="space-y-2 pl-6 border-l-2 border-indigo-100 ml-1">
              <Label htmlFor="submissionUrl">Tautan Pengumpulan (Admin Drive)</Label>
              <Input id="submissionUrl" name="submissionUrl" value={formData.submissionUrl} onChange={handleChange} placeholder="https://drive.google.com/drive/folders/..." />
              <p className="text-xs text-muted-foreground">Tautan tempat mahasiswa mengunggah tugas mereka.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Gambar / Foto Lampiran (Opsional)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} className="text-xs cursor-pointer flex-1" />
              <span className="text-xs text-center sm:hidden text-muted-foreground">atau</span>
              <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="URL Gambar (https://...)" className="flex-1" />
            </div>
            {imageFile && (
              <p className="text-xs text-emerald-600">✓ File gambar berhasil dipilih secara lokal: {imageFile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfUpload">Dokumen Lampiran Tambahan (Khusus PDF)</Label>
            <div className="flex gap-2 items-center">
              <Input id="pdfUpload" type="file" accept="application/pdf" onChange={handlePdfUpload} className="text-xs cursor-pointer" />
            </div>
            {pdfFile && (
              <p className="text-xs text-indigo-600">Terpilih: {pdfFile.name}</p>
            )}
            {initialData?.attachmentUrl && !pdfFile && (
              <p className="text-xs text-indigo-600">Lampiran PDF saat ini: {initialData.attachmentUrl}</p>
            )}
          </div>
        </form>

        <DialogFooter className="sm:justify-between items-center">
          {initialData && onDelete ? (
            <Button variant="destructive" type="button" onClick={() => setIsDeleteDialogOpen(true)}>Hapus</Button>
          ) : <div></div>}
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Batal</Button>
            <Button type="submit" form="task-form" className="bg-indigo-600 hover:bg-indigo-700">{initialData ? 'Simpan Perubahan' : 'Tambah Tugas'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <DeleteConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => setIsDeleteDialogOpen(false)}
      onConfirm={async () => {
        if (onDelete) {
          await onDelete();
          setIsDeleteDialogOpen(false);
        }
      }}
      title="Hapus Tugas"
      description="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
    />
    </>
  );
};