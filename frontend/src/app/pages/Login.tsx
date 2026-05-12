import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRole } from '../context/RoleContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GraduationCap } from 'lucide-react';
import { loginWithBackend } from '../../api/authService';

export const Login = () => {
  const { login } = useRole();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      // Panggil backend API
      const data = await loginWithBackend(username, password);
      
      // Baca role dari hasil kembalian Supabase yang diteruskan backend
      // Default ke 'mahasiswa' jika tidak ada (untuk keamanan data)
      const userRole = data.role && data.role === 'komti' ? 'komti' : 'mahasiswa';
      
      login(userRole as 'komti' | 'mahasiswa', data.user.id);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login gagal.';
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center justify-center gap-3 text-indigo-700">
        <GraduationCap className="w-10 h-10" />
        <h1 className="text-3xl font-bold tracking-tight">SistemKelas</h1>
      </div>
      
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Masuk ke Akun</CardTitle>
          <CardDescription className="text-neutral-500">
            Masukkan kredensial Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username / NIM</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Misal: admin atau 22010101" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white"
              />
            </div>
            
            <div className="pt-4 flex flex-col gap-3">
              {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
              <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11">
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};