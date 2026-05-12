import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useRole } from '../context/RoleContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { ExternalLink, FileText, Link, Plus, Video, Edit, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ImageModal } from '../components/ImageModal';
import { MaterialFormModal } from '../components/MaterialFormModal';
import { Material } from '../types';

export const Materials = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useData();
  const { role } = useRole();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleEditMaterial = (materialId: string) => {
    const matToEdit = materials.find(m => m.id === materialId);
    if (matToEdit) {
      setEditingMaterial(matToEdit);
      setIsFormOpen(true);
    }
  };

  const handleFormSubmit = (matData: Partial<Material>) => {
    if (editingMaterial) {
      // Edit mode
      updateMaterial(editingMaterial.id, matData);
      toast.success('Materi berhasil diperbarui!');
    } else {
      // Add mode
      const newMaterial: Material = {
        id: `mat-${Date.now()}`,
        title: matData.title || '',
        course: matData.course || '',
        url: matData.url || '',
        type: matData.type as 'pdf' | 'video' | 'link' || 'link',
        dateAdded: new Date().toISOString(),
        imageUrl: matData.imageUrl,
        attachmentUrl: matData.attachmentUrl,
        imageFile: (matData as any).imageFile,
        pdfFile: (matData as any).pdfFile
      };
      addMaterial(newMaterial);
      toast.success('Materi baru berhasil diunggah!');
    }
    setIsFormOpen(false);
  };

  const handleDeleteMaterial = () => {
    if (editingMaterial) {
      deleteMaterial(editingMaterial.id);
      toast.success('Materi berhasil dihapus!');
      setIsFormOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-6 w-6 text-rose-500" />;
      case 'video': return <Video className="h-6 w-6 text-purple-500" />;
      default: return <Link className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Materi Perkuliahan</h2>
          <p className="text-muted-foreground">Kumpulan slide, modul, dan referensi belajar.</p>
        </div>
        {role === 'komti' && (
          <Button onClick={handleAddMaterial} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Unggah Materi
          </Button>
        )}
      </div>

      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      
      <MaterialFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteMaterial}
        initialData={editingMaterial}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map(material => (
          <Card key={material.id} className="hover:border-indigo-200 transition-colors flex flex-col justify-between">
            <div>
              {material.imageUrl && (
                <div 
                  className="w-full h-32 overflow-hidden rounded-t-xl relative cursor-pointer group"
                  onClick={() => setSelectedImage(material.imageUrl!)}
                >
                  <img src={material.imageUrl} alt={material.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white font-medium text-xs px-3 py-1.5 rounded-md backdrop-blur-sm transition-opacity shadow-sm">Perbesar Foto</span>
                  </div>
                </div>
              )}
              <CardHeader className={`flex flex-row items-start space-x-4 ${material.imageUrl ? 'pt-4' : ''}`}>
                <div className="p-2 bg-neutral-100 rounded-lg shrink-0">
                  {getIcon(material.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md leading-tight line-clamp-2 pr-2">{material.title}</CardTitle>
                    {role === 'komti' && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleEditMaterial(material.id)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{material.course}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-neutral-500 mb-2">Ditambahkan pada {new Date(material.dateAdded).toLocaleDateString('id-ID')}</div>
              </CardContent>
            </div>
            <CardFooter className="pt-0 flex-col gap-2">
              {material.attachmentUrl && (
                <Button className="w-full justify-between bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200" onClick={() => window.open(material.attachmentUrl, '_blank')}>
                  <span>Buka File PDF</span>
                  <FileText className="h-4 w-4" />
                </Button>
              )}
              {material.url && (
                <Button variant="outline" className="w-full justify-between" onClick={() => window.open(material.url, '_blank')}>
                  <span>Buka Tautan Luar</span>
                  <ExternalLink className="h-4 w-4 opacity-50" />
                </Button>
              )}
              {!material.url && !material.attachmentUrl && (
                <Button variant="outline" className="w-full justify-between" disabled >
                  <span>Tidak Ada Lampiran</span>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};