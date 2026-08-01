import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Settings,
  Menu,
  LogOut,
  Bell,
  BookOpen
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

const superAdminNav = [
  { name: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manage Teachers', href: '/dashboard/admin/teachers', icon: Users },
  { name: 'Support Tickets', href: '/dashboard/admin/tickets', icon: Settings },
];

const teacherNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Classes', href: '/dashboard/classes', icon: GraduationCap },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Materials', href: '/dashboard/materials', icon: BookOpen },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const managerNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Verify Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Class Materials', href: '/dashboard/materials', icon: BookOpen },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const studentNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', href: '/dashboard/classes', icon: GraduationCap },
  { name: 'Class Materials', href: '/dashboard/materials', icon: BookOpen },
  { name: 'Upload Slip', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<'SUPERADMIN' | 'TEACHER' | 'MANAGER' | 'STUDENT' | 'LOADING'>('LOADING');

  useEffect(() => {
    if (!user) return;
    const fetchUserRole = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data) {
          setRole(data.role as any);
        } else {
          setRole('STUDENT');
        }
      } catch (err) {
        setRole('STUDENT');
      }
    };
    fetchUserRole();
  }, [user]);

  const navItems = role === 'SUPERADMIN' ? superAdminNav :
                   role === 'MANAGER' ? managerNav :
                   role === 'STUDENT' ? studentNav :
                   role === 'LOADING' ? [] :
                   teacherNav;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
            TX
          </div>
          <span className="text-xl font-bold tracking-tight text-heading">TutorX</span>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-paragraph hover:bg-muted hover:text-heading'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-heading">Teacher</span>
              <span className="truncate text-xs text-paragraph">{user?.email}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start mt-2 text-danger hover:text-danger hover:bg-danger/10" 
            onClick={async () => {
              if (role === 'TEACHER' || role === 'SUPERADMIN' || role === 'MANAGER') {
                localStorage.setItem('logout_role', 'teacher');
              } else {
                localStorage.setItem('logout_role', 'student');
              }
              await signOut();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  if (role === 'TEACHER' || role === 'SUPERADMIN' || role === 'MANAGER') {
                    localStorage.setItem('logout_role', 'teacher');
                  } else {
                    localStorage.setItem('logout_role', 'student');
                  }
                  await signOut();
                }}
              >
                <LogOut className="h-5 w-5 text-danger" />
              </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                TX
              </div>
              <span className="text-xl font-bold tracking-tight text-heading">TutorX</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center flex-1">
            <h1 className="text-xl font-semibold text-heading">Overview</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-paragraph" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger"></span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-card flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex h-16 items-center gap-2 border-b border-border px-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                TX
              </div>
              <span className="text-xl font-bold tracking-tight text-heading">TutorX</span>
            </div>
            
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/dashboard'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-paragraph hover:bg-muted hover:text-heading'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-border">
               <Button 
                variant="ghost" 
                className="w-full justify-start text-danger hover:text-danger hover:bg-danger/10" 
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
