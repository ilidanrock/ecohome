import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminPropertiesContent } from '@/components/admin/AdminPropertiesContent';

export default async function AdminPropertiesPage() {
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AdminPropertiesContent />
    </div>
  );
}
