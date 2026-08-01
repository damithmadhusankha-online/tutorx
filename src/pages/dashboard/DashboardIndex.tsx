import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import TeacherDashboard from './TeacherDashboard';
import SuperAdminDashboard from './admin/SuperAdminDashboard';
import StudentDashboard from './StudentDashboard';

export default function DashboardIndex() {
  const { user } = useAuth();
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
        if (data) setRole(data.role as any);
      } catch (error) {
        console.error('Error fetching role:', error);
      }
    };
    fetchUserRole();
  }, [user]);

  if (role === 'LOADING') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render specific dashboard based on role
  if (role === 'SUPERADMIN') {
    return <SuperAdminDashboard />;
  }
  
  if (role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  if (role === 'STUDENT') {
    return <StudentDashboard />;
  }

  // For now, Managers can see a placeholder
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="mt-2 text-paragraph">Use the sidebar navigation to access your features.</p>
    </div>
  );
}
