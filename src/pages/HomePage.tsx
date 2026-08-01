import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  Shield, 
  Video, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-lg shadow-md shadow-primary/20">
              TX
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              TutorX
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Why TutorX</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <Button variant="default" size="sm" render={<Link to="/dashboard" />}>
                Go to Dashboard
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hover:text-primary transition-colors" render={<Link to="/login" />}>
                  Sign In
                </Button>
                <Button variant="default" size="sm" className="bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" render={<a href="https://wa.me/940770857690" target="_blank" rel="noopener noreferrer" />}>
                  Contact Support
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.15),transparent_60%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              Empowering 500+ Educators Worldwide
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Streamline Your <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Tuition Business
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Manage students, organize classes, collect payments, and distribute study materials. Everything a modern teacher needs in one unified dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {session ? (
                <Button size="lg" className="w-full sm:w-auto text-base" render={<Link to="/dashboard" />}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" className="w-full sm:w-auto text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-primary to-blue-600" render={<a href="https://wa.me/940770857690" target="_blank" rel="noopener noreferrer" />}>
                    Get The Service
                    <Sparkles className="ml-2 h-5 w-5 animate-pulse" />
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base bg-white hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300" render={<a href="#features" />}>
                    Explore Features
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Interactive Feature Visuals */}
          <div className="mt-16 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-2xl backdrop-blur-md max-w-5xl mx-auto relative overflow-hidden group hover:shadow-primary/20 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-8 text-center relative overflow-hidden">
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse" />
               <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
               
               <h3 className="text-3xl font-extrabold text-slate-900 mb-4 relative z-10">Experience the Future of Tuition</h3>
               <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto relative z-10">
                 TutorX simplifies classroom operations. Easily track monthly student payments, verify slips with one-click, and share learning recordings/PDFs without messy messaging apps.
               </p>
               
               <div className="flex flex-wrap justify-center gap-6 mt-8 relative z-10">
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 hover:scale-105 transition-transform">
                   <CheckCircle2 className="h-5 w-5 text-success" />
                   <span className="text-sm font-medium">One-click fee verification</span>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 hover:scale-105 transition-transform delay-100">
                   <CheckCircle2 className="h-5 w-5 text-success" />
                   <span className="text-sm font-medium">Dynamic class rosters</span>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 hover:scale-105 transition-transform delay-200">
                   <CheckCircle2 className="h-5 w-5 text-success" />
                   <span className="text-sm font-medium">Secure PDF notes</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-sm font-bold tracking-wider text-primary uppercase">Core Modules</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Everything Needed to Run a Modern Class
            </p>
            <p className="text-slate-500 text-sm">
              Replace messy spreadsheets and group chats with custom educational utility tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Student Registry</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Organize student profiles, phone numbers, and WhatsApp metrics in a structured registry. Export reports to CSV.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Course Orchestration</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Add multiple course modules, configure pricing, manage grade targets, and configure custom pricing structures.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fee Verification</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Seamless slip uploads, instant approval toggles, and financial ledgers to control fee verification efficiently.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Learning Materials</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Distribute class recordings, Zoom links, and homework PDFs safely to authenticated students inside the platform.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Supabase Secure RLS</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Advanced Row Level Security limits data visibility so students only see their classes and verify their own payments.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Role Support</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pre-configured support for Super Admins, Teachers, Managers, and Students, each with tailored views.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_70%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your tuition institute?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Create classes, register your academic environment, and invite your students to experience TutorX.
          </p>
          <div className="pt-4 flex justify-center">
            {session ? (
              <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-transform shadow-lg shadow-primary/30 text-white" render={<Link to="/dashboard" />}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-transform shadow-lg shadow-primary/30 text-white" render={<a href="https://wa.me/940770857690" target="_blank" rel="noopener noreferrer" />}>
                Contact to Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-md">
              TX
            </div>
            <span className="text-white font-semibold text-lg">TutorX</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} TutorX. All rights reserved. Powered by NebultaX.
          </p>
        </div>
      </footer>
    </div>
  );
}
