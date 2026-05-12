import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useRole } from '../context/RoleContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { CheckCircle2, Clock, Plus, Edit, XCircle, FileIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { ImageModal } from '../components/ImageModal';
import { TaskFormModal } from '../components/TaskFormModal';
import { Task } from '../types';

export const Tasks = () => {
  const { tasks, users, submitTaskData, cancelTaskSubmission, addTask, updateTask, deleteTask } = useData();
  const { role, userId } = useRole();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const submitTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    submitTaskData(taskId);
    toast.success('Tugas ditandai telah selesai/dikumpulkan!');
  };

  const cancelSubmission = (taskId: string) => {
    cancelTaskSubmission(taskId);
    toast.info('Status pengumpulan dibatalkan.');
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    const taskToEdit = tasks.find(t => t.id === taskId);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setIsFormOpen(true);
    }
  };

  const handleFormSubmit = async (taskData: Partial<Task>) => {
    const isoDeadline = taskData.deadline ? new Date(taskData.deadline as string).toISOString() : new Date().toISOString();

    try {
      if (editingTask) {
        // Edit mode
        await updateTask(editingTask.id, {
          ...taskData,
          deadline: isoDeadline
        });
        toast.success('Tugas berhasil diperbarui!');
      } else {
        // Add mode
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: taskData.title || '',
          course: taskData.course || '',
          description: taskData.description || '',
          deadline: isoDeadline,
          requiresSubmission: taskData.requiresSubmission ?? true,
          submissionUrl: taskData.submissionUrl,
          imageUrl: taskData.imageUrl,
          attachmentUrl: taskData.attachmentUrl,
          status: 'pending',
          imageFile: (taskData as any).imageFile,
          pdfFile: (taskData as any).pdfFile
        };
        await addTask(newTask);
        toast.success('Tugas baru berhasil ditambahkan!');
      }
      setIsFormOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan data tugas';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTask = async () => {
    if (editingTask) {
      try {
        await deleteTask(editingTask.id);
        toast.success('Tugas berhasil dihapus!');
        setIsFormOpen(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus tugas';
        toast.error(errorMessage);
      }
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Tugas</h2>
          <p className="text-muted-foreground">Kelola dan pantau tenggat waktu tugas perkuliahan.</p>
        </div>
        {role === 'komti' && (
          <Button onClick={handleAddTask} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tugas
          </Button>
        )}
      </div>

      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      
      <TaskFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteTask}
        initialData={editingTask}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTasks.map(task => (
          <Card key={task.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              {task.imageUrl && (
                <div 
                  className="w-full h-32 overflow-hidden rounded-t-xl relative cursor-pointer group"
                  onClick={() => setSelectedImage(task.imageUrl!)}
                >
                  <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white font-medium text-xs px-3 py-1.5 rounded-md backdrop-blur-sm transition-opacity shadow-sm">Perbesar Foto</span>
                  </div>
                </div>
              )}
              <CardHeader className={`pb-3 ${task.imageUrl ? 'pt-4' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-neutral-100">{task.course}</Badge>
                  <div className="flex space-x-2">
                    {role === 'komti' && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditTask(task.id)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {(task.completedBy || []).includes(userId!) ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200" variant="secondary">
                        Selesai
                      </Badge>
                    ) : (
                      <Badge variant={new Date(task.deadline) < new Date() ? 'destructive' : 'secondary'} className={new Date(task.deadline) >= new Date() ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : ''}>
                        {new Date(task.deadline) < new Date() ? 'Terlambat' : 'Menunggu'}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                <div className={`mt-3 flex w-fit inline-flex items-center px-3 py-1.5 rounded-md font-bold text-sm border shadow-sm ${
                  (task.completedBy || []).includes(userId!) 
                    ? 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    : new Date(task.deadline) < new Date() 
                      ? 'bg-red-50 text-red-600 border-red-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Tenggat: {format(new Date(task.deadline), 'dd MMM yyyy, HH:mm')}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 line-clamp-3">{task.description}</p>
                
                {task.attachmentUrl && (
                  <a href={task.attachmentUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center text-sm text-indigo-600 bg-indigo-50 p-2 rounded-md hover:bg-indigo-100 transition-colors">
                    <FileIcon className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Buka File PDF Terlampir</span>
                  </a>
                )}
                
                {task.requiresSubmission && task.submissionUrl && (
                  <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 mb-2">Tautan Pengumpulan (Admin):</p>
                    <a 
                      href={task.submissionUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Buka Tautan Drive
                    </a>
                  </div>
                )}
                
                {role === 'mahasiswa' && (task.completedBy || []).includes(userId!) && (
                  <div className="mt-4 p-2 bg-emerald-50 rounded border border-emerald-100 text-xs text-emerald-800 text-center">
                    Anda telah menandai tugas ini selesai.
                  </div>
                )}
              </CardContent>
            </div>
            
            <CardFooter className="pt-3 border-t bg-neutral-50 rounded-b-xl flex-col gap-2">
              {role === 'mahasiswa' ? (
                (task.completedBy || []).includes(userId!) ? (
                  <>
                    <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Telah Diselesaikan
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => cancelSubmission(task.id)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Batalkan Status Selesai
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={() => submitTask(task.id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Tandai Telah Selesai
                  </Button>
                )
              ) : (
                <div className="flex justify-between w-full text-sm py-2">
                  <span className="text-muted-foreground">Status kelas:</span>
                  <span className="font-medium">
                    {task.completedBy?.filter(id => users.some(u => u.id === id && u.role === 'mahasiswa')).length || 0}
                    /
                    {users.filter(u => u.role === 'mahasiswa').length} Selesai
                  </span>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};