import { useState } from 'react';
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
import { Search, CheckCircle, XCircle, FileDown } from 'lucide-react';

export default function PaymentsPage() {
  // Mock data for payments
  const [payments] = useState([
    {
      id: '1',
      studentName: 'Kasun Perera',
      className: '2025 A/L Physics',
      amount: 2500,
      status: 'pending',
      date: '2026-07-30',
      slipUrl: '#',
    },
    {
      id: '2',
      studentName: 'Nimali Silva',
      className: '2024 O/L Science',
      amount: 1500,
      status: 'approved',
      date: '2026-07-29',
      slipUrl: '#',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-heading">Payment Verification</h2>
          <p className="text-sm text-paragraph">Verify manual bank transfer slips uploaded by students.</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
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
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-heading">{p.studentName}</TableCell>
                <TableCell>{p.className}</TableCell>
                <TableCell className="text-paragraph">{p.date}</TableCell>
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
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" render={<a href={p.slipUrl} target="_blank" rel="noreferrer" />}>
                    View Slip
                  </Button>
                  {p.status === 'pending' && (
                    <>
                      <Button variant="outline" size="icon" className="text-success hover:text-success hover:bg-success/10">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-danger hover:text-danger hover:bg-danger/10">
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
