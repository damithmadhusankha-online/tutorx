import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, BookOpen, MessageCircle, Users } from 'lucide-react';

interface CustomPageSettings {
  bank_details: {
    account_name: string;
    account_number: string;
    bank_name: string;
    branch_name: string;
  };
  heading: string;
  photos: string[];
  result_sheet_image: string;
  whatsapp_number: string;
  facebook_link: string;
}

interface TeacherData {
  id: string;
  institute_name: string;
  subdomain: string;
  custom_page_settings: CustomPageSettings;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface ClassData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  monthly_fee: number;
}

export default function TeacherPublicProfile() {
  const { teacherSlug } = useParams<{ teacherSlug: string }>();
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeacherData() {
      if (!teacherSlug) return;
      try {
        // Fetch Teacher
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select(`
            id,
            institute_name,
            subdomain,
            custom_page_settings,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('subdomain', teacherSlug.toLowerCase())
          .single();

        if (teacherError) throw teacherError;
        setTeacher(teacherData as unknown as TeacherData);

        // Fetch Classes (Limit 3 for popular)
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, title, subject, grade, monthly_fee')
          .eq('teacher_id', teacherData.id)
          .limit(3);

        setClasses(classesData || []);
      } catch (err) {
        console.error('Error fetching teacher:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeacherData();
  }, [teacherSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center space-y-4">
        <div className="h-16 w-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Tutor Not Found</h1>
        <p className="text-slate-500 max-w-md">We couldn't find a tutor page at this address. Check the link and try again.</p>
        <Button render={<Link to="/" />}>Return to Homepage</Button>
      </div>
    );
  }

  const profile = teacher.profiles || { full_name: 'Teacher', avatar_url: '' };
  const settings = teacher.custom_page_settings || {
    heading: 'Master Your Subjects - Now At Your Fingertips!',
    photos: ['', '', ''],
    result_sheet_image: '',
    whatsapp_number: '',
    facebook_link: '',
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-slate-900 font-sans relative pb-20">
      
      {/* Floating WhatsApp Button */}
      {settings.whatsapp_number && (
        <a 
          href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}

      {/* Header */}
      <header className="absolute top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold tracking-wide text-sm border border-primary/20">
                {teacher.institute_name.toUpperCase()}
             </div>
          </div>
          {/* <Button size="sm" render={<Link to={`/login?t=${teacherSlug}`} />} className="bg-primary hover:bg-primary/90 text-white shadow-md">
            Login
          </Button> */}
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col md:flex-row items-center justify-between gap-12 relative">
        {/* Left Side: Text */}
        <div className="flex-1 space-y-6 z-10 text-center md:text-left mt-12 md:mt-0">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#1E1B4B] leading-[1.1] tracking-tight">
            {settings.heading.split(' - ')[0]} 
            <span className="text-primary"> - {settings.heading.split(' - ')[1] || ''}</span>
          </h1>
          
          <div className="space-y-1">
            <p className="text-lg font-semibold text-[#1E1B4B] flex items-center justify-center md:justify-start gap-2">
              <Users className="h-5 w-5 text-primary" /> Over 1000+ Students Enrolled
            </p>
            <p className="text-slate-500">Achieved excellent results in past exams</p>
          </div>

          <div className="pt-4">
             <Button size="lg" className="w-40 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30 text-lg rounded-xl h-14" render={<Link to={`/login?t=${teacherSlug}`} />}>
               Login
             </Button>
          </div>
        </div>

        {/* Right Side: Photo Collage */}
        <div className="flex-1 relative w-full max-w-lg mx-auto h-[500px]">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-4">
              <div className="h-[280px] rounded-3xl bg-[#A78BFA] overflow-hidden shadow-xl transform hover:-translate-y-2 transition-transform">
                {settings.photos[0] ? (
                   <img src={settings.photos[0]} alt="Hero 1" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-white/50">Photo 1</div>
                )}
              </div>
              <div className="h-[140px] rounded-3xl bg-white shadow-xl flex flex-col items-center justify-center p-4 border border-slate-100">
                <span className="text-sm font-bold text-slate-800">Call Us</span>
                <span className="text-lg font-black text-primary">{settings.whatsapp_number || 'Update in Settings'}</span>
              </div>
            </div>
            <div className="space-y-4 mt-12">
              <div className="h-[200px] rounded-3xl bg-[#2DD4BF] overflow-hidden shadow-xl transform hover:-translate-y-2 transition-transform">
                {settings.photos[1] ? (
                   <img src={settings.photos[1]} alt="Hero 2" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-white/50">Photo 2</div>
                )}
              </div>
              <div className="h-[220px] rounded-3xl bg-[#F59E0B] overflow-hidden shadow-xl transform hover:-translate-y-2 transition-transform">
                {settings.photos[2] ? (
                   <img src={settings.photos[2]} alt="Hero 3" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-white/50">Photo 3</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Popular Classes Section */}
      {classes.length > 0 && (
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase">Live Course</span>
            <h2 className="text-4xl font-extrabold text-[#1E1B4B] mt-4 flex items-center justify-between">
              Popular Classes
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/5 rounded-full px-6" render={<Link to={`/login?t=${teacherSlug}`} />}>
                VIEW ALL COURSES <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {classes.map((cls) => (
              <Card key={cls.id} className="rounded-3xl overflow-hidden border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all bg-white">
                <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center">
                   {/* Fallback image cover for class */}
                   <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                   <h3 className="text-white text-3xl font-black z-10 drop-shadow-md text-center px-4">{cls.grade}<br/>{cls.subject}</h3>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#1E1B4B] mb-3 line-clamp-2">{cls.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><BookOpen className="h-4 w-4"/> {cls.subject}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4"/> {cls.grade}</span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2">
                    Join this interactive class for comprehensive syllabus coverage and paper discussions.
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex items-center justify-between">
                  <div className="text-2xl font-black text-slate-400">
                    LKR{cls.monthly_fee}
                  </div>
                  <Button variant="ghost" className="font-bold text-[#1E1B4B] hover:text-primary p-0" render={<Link to={`/login?t=${teacherSlug}`} />}>
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Result Sheet Section */}
      {settings.result_sheet_image && (
         <section className="py-20 px-6 max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-[#1E1B4B] mb-12">Our Excellence</h2>
            <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-2xl overflow-hidden">
               <img src={settings.result_sheet_image} alt="Exam Results" className="w-full h-auto rounded-2xl" />
            </div>
         </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="bg-primary text-white h-10 w-10 flex items-center justify-center rounded-xl font-bold">
                {profile.full_name.charAt(0)}
             </div>
             <div>
                <h4 className="font-bold text-slate-900">{profile.full_name}</h4>
                <p className="text-sm text-slate-500">{teacher.institute_name}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            {settings.facebook_link && (
               <a href={settings.facebook_link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
               </a>
            )}
          </div>
        </div>
        <div className="text-center text-slate-400 text-xs mt-12">
          Powered by TutorX © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
