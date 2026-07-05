import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Material } from '../types';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (matData: Partial<Material>) => Promise<void>;
  onDelete?: () => void;
  initialData?: Material | null;
}

export const MaterialFormModal = ({ isOpen, onClose, onSubmit, onDelete, initialData }: MaterialFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Material>>({
    title: '',
    course: '',
    url: '',
    type: 'pdf',
    imageUrl: ''
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        course: initialData.course || '',
        url: initialData.url || '',
        type: initialData.type || 'pdf',
        imageUrl: initialData.imageUrl || ''
      });
      setImageFile(null);
      setPdfFile(null);
    } else if (!initialData && isOpen) {
      // Reset to default
      setFormData({
        title: '',
        course: '',
        url: '',
        type: 'pdf',
        imageUrl: ''
      });
      setImageFile(null);
      setPdfFile(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: 'pdf' | 'video' | 'link') => {
    setFormData(prev => ({ ...prev, type: value }));
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
    if (!formData.title || !formData.course) return;
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
          <DialogTitle>{initialData ? 'Edit Materi' : 'Unggah Materi Baru'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Perbarui informasi materi yang sudah ada.' : 'Bagikan materi perkuliahan baru ke kelas.'}
          </DialogDescription>
        </DialogHeader>
        
        <form id="material-form" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Materi <span className="text-red-500">*</span></Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Contoh: Modul Pertemuan 5" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course">Mata Kuliah <span className="text-red-500">*</span></Label>
            <Input id="course" name="course" value={formData.course} onChange={handleChange} required placeholder="Contoh: Rekayasa Perangkat Lunak" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe File / Materi <span className="text-red-500">*</span></Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe materi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Dokumen / PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="link">Tautan Web</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">Tautan (URL) Materi (Opsional)</Label>
            <Input id="url" name="url" type="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
            <p className="text-xs text-muted-foreground">URL ke Google Drive, YouTube, atau sumber lainnya.</p>
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
            <Label>Gambar Thumbnail (Opsional)</Label>
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
            <Button type="submit" form="material-form" className="bg-indigo-600 hover:bg-indigo-700">{initialData ? 'Simpan Perubahan' : 'Unggah Materi'}</Button>
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
      title="Hapus Materi"
      description="Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan."
    />
    </>
  );
};