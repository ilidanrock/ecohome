import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminDashboardContent } from '@/components/dashboard/AdminDashboardContent';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
    return null;
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
    return null;
  }

  return (
    <div className="container">
      <AdminDashboardContent />
    </div>
  );
}
