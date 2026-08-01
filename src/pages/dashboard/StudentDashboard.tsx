import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, LogOut, GraduationCap, Calendar, Clock, Sparkles, CreditCard, Landmark } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface TeacherContext {
  id: string;
  institute_name: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  custom_page_settings?: {
    bank_details: {
      account_name: string;
      account_number: string;
      bank_name: string;
      branch_name: string;
    };
  };
}

interface ClassData {
  id: string;
  title: string;
  subject: string;
  monthly_fee: number;
}

export default function StudentDashboard() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<TeacherContext | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const activeSlug = localStorage.getItem('activeTeacherSlug');
      
      if (!activeSlug) {
        setError('No active teacher session found.');
        setLoading(false);
        return;
      }

      try {
        // Fetch specific teacher context
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select(`
            id,
            institute_name,
            profiles (
              full_name,
              avatar_url
            ),
            custom_page_settings
          `)
          .eq('subdomain', activeSlug)
          .single();

        if (teacherError) throw teacherError;
        setTeacher(teacherData as unknown as TeacherContext);

        // Fetch ONLY classes belonging to this specific teacher
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, title, subject, monthly_fee')
          .eq('teacher_id', teacherData.id)
          .order('created_at', { ascending: false });

        if (classesError) throw classesError;
        setClasses(classesData || []);

      } catch (err: any) {
        console.error('Failed to load student dashboard:', err);
        setError('Failed to load teacher context. Please try logging in again via the public link.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Lock Screen if they bypassed the context logic
  if (error || !teacher) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="bg-danger/10 p-4 rounded-full">
          <Lock className="h-12 w-12 text-danger" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-heading">Session Locked</h2>
          <p className="text-paragraph mt-2 max-w-md">
            For security and privacy, you must log in through your specific teacher's portal link.
          </p>
        </div>
        <Button onClick={() => signOut()} variant="destructive" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out & Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Contextual Branding Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-32 w-32 text-primary" />
        </div>
        
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center text-primary text-3xl font-extrabold flex-shrink-0">
           {teacher.profiles?.full_name?.charAt(0).toUpperCase() || 'T'}
        </div>
        <div className="text-center md:text-left z-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-heading">
            Welcome to {teacher.institute_name}
          </h1>
          <p className="text-paragraph mt-2 text-lg">
            Instructor: {teacher.profiles?.full_name}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
             <Lock className="h-3.5 w-3.5" />
             Secure Single-Teacher Session
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-heading">Available Classes</h2>
        </div>

        {/* Payment / Bank Details Alert */}
        {teacher.custom_page_settings?.bank_details?.account_number && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-heading flex items-center gap-2 mb-4">
              <Landmark className="h-5 w-5 text-primary" />
              Teacher's Bank Details for Payments
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-slate-500 block text-xs font-semibold uppercase mb-1">Account Name</span>
                <span className="font-bold text-slate-800">{teacher.custom_page_settings.bank_details.account_name}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-slate-500 block text-xs font-semibold uppercase mb-1">Account No.</span>
                <span className="font-bold text-slate-800">{teacher.custom_page_settings.bank_details.account_number}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-slate-500 block text-xs font-semibold uppercase mb-1">Bank</span>
                <span className="font-bold text-slate-800">{teacher.custom_page_settings.bank_details.bank_name}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-slate-500 block text-xs font-semibold uppercase mb-1">Branch</span>
                <span className="font-bold text-slate-800">{teacher.custom_page_settings.bank_details.branch_name}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> Please transfer the monthly fee to the account above and upload the payment slip to join a class.
            </p>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
            <GraduationCap className="mx-auto h-12 w-12 text-muted mb-4" />
            <h3 className="text-lg font-semibold text-heading">No classes available yet</h3>
            <p className="text-paragraph mt-2">Check back later when {teacher.profiles?.full_name} opens new enrollments.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card key={cls.id} className="hover:border-primary/50 transition-colors shadow-sm">
                <CardHeader>
                  <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">
                    {cls.subject}
                  </div>
                  <CardTitle className="line-clamp-2">{cls.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-paragraph">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Monthly Subscription</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-heading">LKR {cls.monthly_fee.toLocaleString()} / mo</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Class</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
