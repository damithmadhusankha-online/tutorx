import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Loader2 } from 'lucide-react';

type ClassItem = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  monthly_fee: number;
  students_count?: number;
};

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    subject: '',
    monthly_fee: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      // Fetch teacher's classes. (Requires the user to have a teacher profile setup)
      // Since we are mocking teacher workspace for now, we just query classes. 
      // RLS will handle the filtering if setup correctly.
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First, get the teacher ID for this user
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', user?.id)
        .single();

      if (teacherError) {
        toast.error('You must be registered as a teacher to create classes.');
        throw teacherError;
      }

      const { error } = await supabase.from('classes').insert([
        {
          teacher_id: teacherData.id,
          name: formData.name,
          grade: formData.grade,
          subject: formData.subject,
          monthly_fee: parseFloat(formData.monthly_fee),
        }
      ]);

      if (error) throw error;
      
      toast.success('Class created successfully!');
      setIsDialogOpen(false);
      setFormData({ name: '', grade: '', subject: '', monthly_fee: '' });
      fetchClasses();
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast.error(error.message || 'Failed to create class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-heading">Classes</h2>
          <p className="text-sm text-paragraph">Manage your classes, fees, and subjects.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Class
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Class</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new class.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClass} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. 2025 A/L Physics Theory" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade / Year</Label>
                  <Input 
                    id="grade" 
                    placeholder="e.g. 2025 A/L" 
                    required
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="e.g. Physics" 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_fee">Monthly Fee (LKR)</Label>
                <Input 
                  id="monthly_fee" 
                  type="number" 
                  min="0" 
                  step="100" 
                  placeholder="e.g. 2500" 
                  required
                  value={formData.monthly_fee}
                  onChange={e => setFormData({...formData, monthly_fee: e.target.value})}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Class
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="h-5 w-5 text-paragraph" />
        <Input 
          placeholder="Search classes..." 
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Monthly Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-paragraph">
                  No classes found. Click "Add New Class" to create one.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-heading">{c.name}</TableCell>
                  <TableCell>{c.grade}</TableCell>
                  <TableCell>{c.subject}</TableCell>
                  <TableCell className="text-right font-medium">
                    LKR {c.monthly_fee.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
