import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';

// Placeholder data generators
const generateSeries = (labels: string[], max: number) =>
  labels.map((label) => ({ name: label, value: Math.floor(Math.random() * max) + 1 }));

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    activeTeachers: 0,
    suspendedTeachers: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalManagers: 0,
    totalCourses: 0,
    liveClassesToday: 0,
    totalLessonPacks: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    newRegistrations: 0,
    storageUsed: '0 GB',
    apiUsage: '0 req/s',
    serverStatus: 'Online',
  });

  // Fetch stats from Supabase – simplified for demo (real implementation would use RPC or views)
  useEffect(() => {
    async function fetchStats() {
      const [{ count: teachers }, { count: active } ] = await Promise.all([
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      ]);
      // For brevity we populate static numbers; replace with real queries as needed
      setStats((prev) => ({
        ...prev,
        totalTeachers: teachers ?? 0,
        activeTeachers: active ?? 0,
        suspendedTeachers: (teachers ?? 0) - (active ?? 0),
        totalStudents: 1240,
        activeStudents: 1150,
        totalManagers: 42,
        totalCourses: 87,
        liveClassesToday: 5,
        totalLessonPacks: 23,
        totalRevenue: 1523400,
        pendingPayments: 13,
        newRegistrations: 27,
        storageUsed: '12.3 GB',
        apiUsage: '184 req/s',
        serverStatus: 'Online',
      }));
    }
    fetchStats();
  }, []);

  // Chart data placeholders
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const studentGrowth = generateSeries(months, 200);
  const revenueData = generateSeries(months, 50000);
  const teacherGrowth = generateSeries(months, 30);
  const dailyLogins = generateSeries(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 300);
  const monthlySales = generateSeries(months, 1000);

  return (
    <div className="p-6 space-y-8 bg-background text-foreground min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold">Super Admin Analytics Dashboard</h1>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-medium text-paragraph capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </h3>
            <p className="mt-2 text-2xl font-bold text-heading">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Student Growth */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Student Growth (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Students" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Revenue (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Teacher Growth */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Teacher Growth (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={teacherGrowth}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" name="Teachers" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Logins */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Daily Logins (Last Week)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyLogins}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ffc658" name="Logins" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Sales */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm col-span-2 lg:col-span-1">
          <h3 className="mb-2 text-lg font-semibold">Monthly Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#ff7300" name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
