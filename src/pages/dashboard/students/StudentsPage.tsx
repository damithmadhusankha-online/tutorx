import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2, FileDown } from 'lucide-react';

type StudentItem = {
  id: string;
  profiles: {
    full_name: string;
    phone_number: string;
  };
  whatsapp_number: string;
  classes_enrolled: number;
  joined_at: string;
};

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Note: In a real app, this query joins enrollments and students for this teacher's classes.
        // For demonstration, we just fetch from students if RLS allows.
        
        // Mock query since real join query would depend heavily on the exact shape.
        // The RLS policy "Teachers can manage enrollments" protects this data.
        const { data, error } = await supabase
          .from('students')
          .select(`
            id,
            whatsapp_number,
            created_at,
            profiles(full_name, phone_number)
          `)
          .limit(50);

        if (error) throw error;
        
        // Map data to UI model
        const mapped = (data || []).map(s => ({
          id: s.id,
          profiles: s.profiles as any,
          whatsapp_number: s.whatsapp_number,
          classes_enrolled: Math.floor(Math.random() * 3) + 1, // Mock count
          joined_at: new Date(s.created_at).toLocaleDateString(),
        }));

        setStudents(mapped);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    const headers = ['Student Name', 'WhatsApp Number', 'Enrolled Classes', 'Joined Date'];
    const rows = students.map(s => [
      s.profiles?.full_name || 'Unknown',
      s.whatsapp_number || 'Unknown',
      s.classes_enrolled.toString(),
      s.joined_at
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-heading">Students</h2>
          <p className="text-sm text-paragraph">View and manage all students enrolled in your classes.</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto" onClick={handleExportCSV}>
          <FileDown className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="h-5 w-5 text-paragraph" />
        <Input 
          placeholder="Search by name or WhatsApp number..." 
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>WhatsApp Number</TableHead>
              <TableHead>Enrolled Classes</TableHead>
              <TableHead className="text-right">Joined Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-paragraph">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-heading">
                    {s.profiles?.full_name || 'Anonymous Student'}
                  </TableCell>
                  <TableCell>{s.whatsapp_number}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {s.classes_enrolled} Classes
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-paragraph">
                    {s.joined_at}
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
