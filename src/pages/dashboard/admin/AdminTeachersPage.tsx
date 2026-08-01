import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Users, MoreVertical, Ban, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeacherAdminData {
  id: string;
  institute_name: string;
  subdomain: string;
  subscription_status: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone_number: string;
  };
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherAdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          institute_name,
          subdomain,
          subscription_status,
          created_at,
          profiles (
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers((data as unknown as TeacherAdminData[]) || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async (teacherId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setActionLoading(teacherId);
    
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ subscription_status: newStatus })
        .eq('id', teacherId);

      if (error) throw error;
      
      // Update local state
      setTeachers(teachers.map(t => 
        t.id === teacherId ? { ...t, subscription_status: newStatus } : t
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update teacher status.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">Manage Teachers</h1>
          <p className="text-paragraph">Super Admin controls for workspace subscriptions and status.</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Super Admin Privileges Active
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-paragraph flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Loading teachers register...
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-8 text-center text-paragraph">
            <Users className="mx-auto h-12 w-12 text-muted mb-3" />
            <p>No teachers have registered on the platform yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-paragraph uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Teacher & Institute</th>
                  <th className="px-6 py-4 font-medium">Public Link</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-heading">{teacher.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-paragraph mt-0.5">{teacher.institute_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">
                        /{teacher.subdomain}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-paragraph">
                      {teacher.profiles?.phone_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {teacher.subscription_status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
                          <Ban className="h-3.5 w-3.5" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {actionLoading === teacher.id ? (
                        <div className="inline-block h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              className={teacher.subscription_status === 'suspended' ? 'text-success cursor-pointer' : 'text-danger cursor-pointer'}
                              onClick={() => handleToggleStatus(teacher.id, teacher.subscription_status)}
                            >
                              {teacher.subscription_status === 'suspended' ? (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Unsuspend Teacher
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend Account
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
