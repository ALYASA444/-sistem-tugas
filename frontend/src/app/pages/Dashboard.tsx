import { useData } from '../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { format } from 'date-fns';
import { CalendarIcon, BellIcon, BookIcon } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';

export const Dashboard = () => {
  const { tasks, announcements, materials } = useData();
  const { role } = useRole();
  const navigate = useNavigate();

  const safeDate = (d: string | undefined | null) => { const t = new Date(d || ''); return isNaN(t.getTime()) ? new Date(0) : t; };
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const upcomingTasks = [...pendingTasks].sort((a, b) => safeDate(a.deadline).getTime() - safeDate(b.deadline).getTime()).slice(0, 3);
  const recentAnnouncements = [...announcements].sort((a, b) => safeDate(b.date).getTime() - safeDate(a.date).getTime()).slice(0, 2);
  const recentMaterials = [...materials].sort((a, b) => safeDate(b.dateAdded).getTime() - safeDate(a.dateAdded).getTime()).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tugas Aktif</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membutuhkan perhatian Anda
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengumuman Terbaru</CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentAnnouncements.length > 0 ? `Terakhir: ${format(safeDate(recentAnnouncements[0].date), 'dd MMM yyyy')}` : 'Belum ada pengumuman'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materi Kuliah</CardTitle>
            <BookIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total dokumen & tautan dibagikan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tenggat Waktu Terdekat</CardTitle>
            <CardDescription>Tugas yang harus segera diselesaikan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
              <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg bg-white">
                <div>
                  <h4 className="font-semibold text-sm">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.course}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-amber-600">
                    {format(safeDate(task.deadline), 'dd MMM, HH:mm')}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                Tidak ada tugas yang mendesak
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate('/tasks')}>
              Lihat Semua Tugas
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pengumuman Penting</CardTitle>
            <CardDescription>Informasi terbaru untuk kelas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAnnouncements.length > 0 ? recentAnnouncements.map(ann => (
              <div key={ann.id} className="p-4 border rounded-lg bg-white relative">
                {ann.priority === 'high' && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                <h4 className="font-semibold text-sm mr-6">{ann.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                <div className="text-xs text-muted-foreground mt-3 flex justify-between">
                  <span>Oleh: {ann.author}</span>
                  <span>{format(safeDate(ann.date), 'dd MMM yyyy')}</span>
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                Belum ada pengumuman
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate('/announcements')}>
              Lihat Semua Pengumuman
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Materi Terbaru</CardTitle>
            <CardDescription>Bahan ajar & referensi baru.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMaterials.length > 0 ? recentMaterials.map(mat => (
              <div key={mat.id} className="p-4 border rounded-lg bg-white">
                <h4 className="font-semibold text-sm line-clamp-2">{mat.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{mat.course}</p>
                <div className="text-xs text-indigo-600 mt-2 font-medium">
                  {mat.type.toUpperCase()}
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                Belum ada materi
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate('/materials')}>
              Semua Materi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};