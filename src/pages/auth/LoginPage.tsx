import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage({ role = 'student' }: { role?: 'student' | 'teacher' | 'manager' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || (role === 'student' ? '/student' : '/dashboard');

  useEffect(() => {
    // If a teacher slug is passed in the URL (e.g., from their public profile), remember it
    const searchParams = new URLSearchParams(location.search);
    const teacherSlug = searchParams.get('t');
    if (teacherSlug) {
      localStorage.setItem('pendingTeacherSlug', teacherSlug);
    }
  }, [location.search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let result;
    if (role === 'student') {
      result = await supabase.auth.signInWithPassword({
        phone: whatsapp,
        password,
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      // Check if user role matches the page role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.data.user?.id)
        .single();
      
      const userRole = profile?.role;
      const isAllowed = 
        (role === 'student' && userRole === 'STUDENT') ||
        (role === 'teacher' && userRole === 'TEACHER') ||
        (role === 'manager' && userRole === 'MANAGER');

      // Check pending slug from URL or localStorage to lock session
      const pendingSlug = localStorage.getItem('pendingTeacherSlug');
      if (pendingSlug) {
        localStorage.setItem('activeTeacherSlug', pendingSlug);
        localStorage.removeItem('pendingTeacherSlug');
      }

      if (!isAllowed && userRole !== 'SUPERADMIN') {
        await supabase.auth.signOut();
        setError(`Access Denied. This account is not registered as a ${role}.`);
        setLoading(false);
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Branding Side - Hidden on Mobile */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary font-bold text-xl">
              TX
            </div>
            <span className="text-2xl font-bold tracking-tight">TutorX</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-5xl font-bold leading-tight">
            Manage your tuition business with ease.
          </h1>
          <p className="text-lg text-primary-foreground/80">
            The all-in-one platform for educators to handle students, classes, payments, and online learning materials.
          </p>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} NebultaX. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:hidden mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
                TX
              </div>
              <span className="text-2xl font-bold tracking-tight text-heading">TutorX</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-heading">Welcome back</h2>
            <p className="text-sm text-paragraph">Enter your credentials to access your account</p>
          </div>

          <Card className="border-border shadow-sm">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle className="capitalize">{role} Sign In</CardTitle>
                <CardDescription>
                  {role === 'student' ? 'Use your registered WhatsApp number.' : 'Enter your credentials.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
                    {error}
                  </div>
                )}
                {role === 'student' ? (
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input 
                      id="whatsapp" 
                      type="text" 
                      placeholder="+94771234567" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      className="focus-visible:ring-primary"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="user@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="focus-visible:ring-primary"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="focus-visible:ring-primary"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
