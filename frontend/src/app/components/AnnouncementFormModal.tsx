import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Announcement } from '../types';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (annData: Partial<Announcement>) => Promise<void>;
  onDelete?: () => void;
  initialData?: Announcement | null;
}

export const AnnouncementFormModal = ({ isOpen, onClose, onSubmit, onDelete, initialData }: AnnouncementFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    author: 'Komti',
    priority: 'normal',
    imageUrl: ''
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        author: initialData.author || 'Komti',
        priority: initialData.priority || 'normal',
        imageUrl: initialData.imageUrl || ''
      });
      setImageFile(null);
      setPdfFile(null);
    } else if (!initialData && isOpen) {
      // Reset to default
      setFormData({
        title: '',
        content: '',
        author: 'Komti',
        priority: 'normal',
        imageUrl: ''
      });
      setImageFile(null);
      setPdfFile(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: 'low' | 'normal' | 'high') => {
    setFormData(prev => ({ ...prev, priority: value }));
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.author) return;
    onSubmit({
      ...formData,
      imageFile: imageFile || undefined,
      pdfFile: pdfFile || undefined
    } as any);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Perbarui informasi pengumuman yang sudah ada.' : 'Buat pengumuman baru untuk kelas.'}
          </DialogDescription>
        </DialogHeader>
        
        <form id="announcement-form" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Pengumuman <span className="text-red-500">*</span></Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Contoh: Perubahan Jadwal Kuliah" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Penulis / Pengirim <span className="text-red-500">*</span></Label>
              <Input id="author" name="author" value={formData.author} onChange={handleChange} required placeholder="Contoh: Bendahara, Komti, Dosen" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Tingkat Prioritas</Label>
              <Select value={formData.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah (Low)</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Penting (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Isi Pengumuman <span className="text-red-500">*</span></Label>
            <Textarea id="content" name="content" value={formData.content} onChange={handleChange} required rows={5} placeholder="Ketik isi pengumuman di sini..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfUpload">Dokumen Lampiran (Khusus PDF)</Label>
            <div className="flex gap-2 items-center">
              <Input id="pdfUpload" type="file" accept="application/pdf" onChange={handlePdfUpload} className="text-xs cursor-pointer" />
            </div>
            {pdfFile && (
              <p className="text-xs text-indigo-600">Terpilih: {pdfFile.name}</p>
            )}
            {initialData?.attachmentUrl && !pdfFile && (
              <p className="text-xs text-indigo-600">Terpilih: Berkas PDF saat ini</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Gambar/Foto Lampiran (Opsional)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} className="text-xs cursor-pointer flex-1" />
              <span className="text-xs text-center sm:hidden text-muted-foreground">atau</span>
              <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="URL Gambar (https://...)" className="flex-1" />
            </div>
            {imageFile && (
              <p className="text-xs text-emerald-600">✓ File gambar berhasil dipilih secara lokal: {imageFile.name}</p>
            )}
          </div>
        </form>

        <DialogFooter className="sm:justify-between items-center">
          {initialData && onDelete ? (
            <Button variant="destructive" type="button" onClick={() => setIsDeleteDialogOpen(true)}>Hapus</Button>
          ) : <div></div>}
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Batal</Button>
            <Button type="submit" form="announcement-form" className="bg-indigo-600 hover:bg-indigo-700">{initialData ? 'Simpan Perubahan' : 'Buat Pengumuman'}</Button>
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
      title="Hapus Pengumuman"
      description="Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan."
    />
    </>
  );
};