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
import { Search, CheckCircle, XCircle, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type PaymentSlip = {
  id: string;
  student_id: string;
  class_id: string;
  slip_url: string;
  amount: number;
  status: string;
  created_at: string;
  students?: { profiles?: { full_name: string } };
  classes?: { name: string; grade: string };
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPayments();
  }, [user]);

  async function fetchPayments() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_slips')
        .select(`
          *,
          students ( profiles ( full_name ) ),
          classes ( name, grade )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = async (paymentId: string, studentId: string, classId: string) => {
    setActionLoading(paymentId);
    try {
      // Update slip status
      const { error: slipError } = await supabase
        .from('payment_slips')
        .update({ status: 'approved' })
        .eq('id', paymentId);
      
      if (slipError) throw slipError;

      // Insert/update enrollment (1 month access)
      const accessUntil = new Date();
      accessUntil.setMonth(accessUntil.getMonth() + 1);

      const { error: enrollError } = await supabase
        .from('enrollments')
        .upsert({
          student_id: studentId,
          class_id: classId,
          access_until: accessUntil.toISOString()
        }, { onConflict: 'student_id, class_id' });

      if (enrollError) throw enrollError;

      toast.success('Payment verified and student enrolled!');
      fetchPayments();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to verify payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const { error } = await supabase
        .from('payment_slips')
        .update({ status: 'rejected' })
        .eq('id', paymentId);
      
      if (error) throw error;
      toast.success('Payment rejected.');
      fetchPayments();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to reject payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) return;
    
    const headers = ['Student Name', 'Class', 'Amount', 'Status', 'Date'];
    const rows = payments.map(p => [
      p.students?.profiles?.full_name || 'Unknown',
      `${p.classes?.grade || ''} ${p.classes?.name || ''}`,
      p.amount.toString(),
      p.status,
      new Date(p.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'payments_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-heading">Payment Verification</h2>
          <p className="text-sm text-paragraph">Verify manual bank transfer slips uploaded by students.</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto" onClick={handleExportCSV}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="h-5 w-5 text-paragraph" />
        <Input 
          placeholder="Search by student name or class..." 
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount (LKR)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No payment slips found.
                </TableCell>
              </TableRow>
            ) : payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-heading">{p.students?.profiles?.full_name || 'Unknown'}</TableCell>
                <TableCell>{p.classes?.grade} {p.classes?.name}</TableCell>
                <TableCell className="text-paragraph">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-medium">{p.amount.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.status === 'approved' ? 'bg-success/10 text-success' : 
                    p.status === 'rejected' ? 'bg-danger/10 text-danger' : 
                    'bg-warning/10 text-warning'
                  }`}>
                    {p.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2 whitespace-nowrap">
                  <Button variant="outline" size="sm" render={<a href={p.slip_url} target="_blank" rel="noreferrer" />}>
                    View Slip
                  </Button>
                  {p.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleVerify(p.id, p.student_id, p.class_id)}
                        disabled={actionLoading === p.id}
                      >
                        {actionLoading === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-danger hover:text-danger hover:bg-danger/10"
                        onClick={() => handleReject(p.id)}
                        disabled={actionLoading === p.id}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
