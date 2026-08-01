export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-paragraph">Total Students</h3>
          <p className="mt-2 text-3xl font-bold text-heading">120</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-paragraph">Active Classes</h3>
          <p className="mt-2 text-3xl font-bold text-heading">8</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-paragraph">Pending Payments</h3>
          <p className="mt-2 text-3xl font-bold text-heading text-warning">24</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-paragraph">Monthly Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-heading text-success">LKR 45,000</p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-heading mb-4">Upcoming Classes</h3>
          <div className="flex flex-col items-center justify-center h-[200px] text-paragraph">
            <p>No upcoming classes today.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-heading mb-4">Recent Payments</h3>
          <div className="flex flex-col items-center justify-center h-[200px] text-paragraph">
            <p>No recent payments pending verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
