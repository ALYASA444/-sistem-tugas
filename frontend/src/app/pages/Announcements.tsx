import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useRole } from '../context/RoleContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { AlertCircle, Plus, Info, Edit, ImageIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { ImageModal } from '../components/ImageModal';
import { AnnouncementFormModal } from '../components/AnnouncementFormModal';
import { Announcement } from '../types';

export const Announcements = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const { role } = useRole();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleEditAnnouncement = (annId: string) => {
    const annToEdit = announcements.find(a => a.id === annId);
    if (annToEdit) {
      setEditingAnnouncement(annToEdit);
      setIsFormOpen(true);
    }
  };

  const handleFormSubmit = (annData: Partial<Announcement>) => {
    if (editingAnnouncement) {
      // Edit mode
      updateAnnouncement(editingAnnouncement.id, annData);
      toast.success('Pengumuman berhasil diperbarui!');
    } else {
      // Add mode
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        title: annData.title || '',
        content: annData.content || '',
        author: annData.author || 'Komti',
        date: new Date().toISOString(),
        priority: annData.priority as 'low' | 'normal' | 'high' || 'normal',
        imageUrl: annData.imageUrl,
        attachmentUrl: annData.attachmentUrl,
        imageFile: (annData as any).imageFile,
        pdfFile: (annData as any).pdfFile
      };
      addAnnouncement(newAnnouncement);
      toast.success('Pengumuman baru berhasil dibuat!');
    }
    setIsFormOpen(false);
  };

  const handleDeleteAnnouncement = () => {
    if (editingAnnouncement) {
      deleteAnnouncement(editingAnnouncement.id);
      toast.success('Pengumuman berhasil dihapus!');
      setIsFormOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pengumuman Kelas</h2>
          <p className="text-muted-foreground">Informasi penting terkait perkuliahan dan kegiatan mahasiswa.</p>
        </div>
        {role === 'komti' && (
          <Button onClick={handleAddAnnouncement} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Buat Pengumuman
          </Button>
        )}
      </div>

      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      
      <AnnouncementFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteAnnouncement}
        initialData={editingAnnouncement}
      />

      <div className="space-y-4">
        {announcements.map(ann => (
          <Card key={ann.id} className="relative overflow-hidden group/card hover:shadow-md transition-all">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${ann.priority === 'high' ? 'bg-red-500' : ann.priority === 'normal' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
            
            {ann.imageUrl && (
              <div 
                className="w-full h-48 overflow-hidden relative border-b border-neutral-100 cursor-pointer group"
                onClick={() => setSelectedImage(ann.imageUrl!)}
              >
                <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white font-medium text-xs px-3 py-1.5 rounded-md backdrop-blur-sm transition-opacity shadow-sm">Perbesar Foto</span>
                </div>
              </div>
            )}

            <CardHeader className="pl-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {ann.priority === 'high' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  <Badge variant="outline" className={ann.priority === 'high' ? 'text-red-600 border-red-200 bg-red-50' : ''}>
                    {ann.priority === 'high' ? 'Penting' : 'Informasi'}
                  </Badge>
                  <div className="text-sm text-muted-foreground ml-2">
                    {format(new Date(ann.date), 'dd MMM yyyy, HH:mm')}
                  </div>
                </div>
                {role === 'komti' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2" onClick={() => handleEditAnnouncement(ann.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardTitle className="text-xl leading-tight">{ann.title}</CardTitle>
            </CardHeader>
            <CardContent className="pl-6">
              <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
              {ann.attachmentUrl && (
                <div className="mt-4">
                  <a href={ann.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors">
                    <FileText className="h-4 w-4 mr-2" />
                    Buka Lampiran Dokumen (PDF)
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter className="pl-6 pb-4">
              <div className="flex items-center text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                <Info className="mr-1 h-3 w-3" />
                Ditulis oleh {ann.author}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};