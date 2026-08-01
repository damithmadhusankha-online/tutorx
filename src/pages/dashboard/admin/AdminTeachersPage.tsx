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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  // Invite state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', institute_name: '', subdomain: '' });
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

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

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteLink(null);

    try {
      const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { data: userAuth } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('teacher_invites')
        .insert({
          email: inviteData.email,
          institute_name: inviteData.institute_name,
          subdomain: inviteData.subdomain.toLowerCase(),
          code: code,
          created_by: userAuth.user?.id
        });

      if (error) throw error;

      const url = `${window.location.origin}/teacher-setup?code=${code}`;
      setInviteLink(url);
    } catch (err: any) {
      console.error('Error generating invite:', err);
      alert(err.message || 'Failed to generate invite');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">Manage Teachers</h1>
          <p className="text-paragraph">Super Admin controls for workspace subscriptions and status.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Super Admin Privileges Active
          </div>

          <Dialog open={isInviteOpen} onOpenChange={(open) => {
             setIsInviteOpen(open);
             if (!open) {
               setInviteLink(null);
               setInviteData({ email: '', institute_name: '', subdomain: '' });
             }
          }}>
            <DialogTrigger render={<Button>+ Invite New Teacher</Button>} />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite New Teacher</DialogTitle>
                <DialogDescription>
                  Generate a secure, single-use invite link for a new teacher to set up their workspace.
                </DialogDescription>
              </DialogHeader>
              
              {!inviteLink ? (
                <form onSubmit={handleGenerateInvite} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Teacher's Email</Label>
                    <Input id="email" type="email" value={inviteData.email} onChange={(e) => setInviteData({...inviteData, email: e.target.value})} placeholder="teacher@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institute">Institute Name</Label>
                    <Input id="institute" value={inviteData.institute_name} onChange={(e) => setInviteData({...inviteData, institute_name: e.target.value})} placeholder="e.g. Success Academy" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain URL</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-slate-100 text-slate-500 text-sm">
                        tutorx.com/
                      </span>
                      <Input 
                        id="subdomain" 
                        className="rounded-l-none"
                        value={inviteData.subdomain} 
                        onChange={(e) => setInviteData({...inviteData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                        placeholder="e.g. success-academy"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={inviting}>
                      {inviting ? 'Generating...' : 'Generate Invite Link'}
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="py-6 space-y-4 text-center">
                  <div className="mx-auto h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-heading">Invite Generated!</h3>
                  <p className="text-sm text-paragraph">Copy this link and send it to the teacher. They can use it to securely set their password and log in.</p>
                  
                  <div className="p-3 bg-slate-50 border border-border rounded-lg break-all text-sm font-mono text-left">
                    {inviteLink}
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      alert('Copied to clipboard!');
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
