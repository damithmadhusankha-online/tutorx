import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2, Users, BookOpen, CreditCard, TrendingUp } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    pendingPayments: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (!teacher) return;

        // Fetch class count
        const { count: classCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacher.id);

        // Fetch pending payments
        const { data: payments } = await supabase
          .from('payment_slips')
          .select(`
            amount,
            status,
            classes!inner(teacher_id)
          `)
          .eq('classes.teacher_id', teacher.id);

        const pending = payments?.filter(p => p.status === 'pending').length || 0;
        const revenue = payments?.filter(p => p.status === 'approved').reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Fetch student count (unique students in enrollments for this teacher's classes)
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            student_id,
            classes!inner(teacher_id)
          `)
          .eq('classes.teacher_id', teacher.id);
          
        const uniqueStudents = new Set(enrollments?.map(e => e.student_id)).size;

        setStats({
          students: uniqueStudents,
          classes: classCount || 0,
          pendingPayments: pending,
          revenue,
        });

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-paragraph" />
            <h3 className="text-sm font-medium text-paragraph">Total Students</h3>
          </div>
          <p className="text-3xl font-bold text-heading">{stats.students}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-paragraph" />
            <h3 className="text-sm font-medium text-paragraph">Active Classes</h3>
          </div>
          <p className="text-3xl font-bold text-heading">{stats.classes}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-paragraph" />
            <h3 className="text-sm font-medium text-paragraph">Pending Payments</h3>
          </div>
          <p className="text-3xl font-bold text-heading text-warning">{stats.pendingPayments}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-paragraph" />
            <h3 className="text-sm font-medium text-paragraph">Monthly Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-heading text-success">LKR {stats.revenue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-heading mb-4">Upcoming Classes</h3>
          <div className="flex flex-col items-center justify-center h-[200px] text-paragraph text-center">
            <BookOpen className="h-12 w-12 text-muted mb-4" />
            <p>No upcoming classes today.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-heading mb-4">Recent Payments</h3>
          <div className="flex flex-col items-center justify-center h-[200px] text-paragraph text-center">
            <CreditCard className="h-12 w-12 text-muted mb-4" />
            <p>No recent payments pending verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
