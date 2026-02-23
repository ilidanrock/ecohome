import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminPropertyDetail } from '@/components/admin/AdminPropertyDetail';

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
    return null;
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
    return null;
  }

  const { id } = await params;

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto">
      <AdminPropertyDetail propertyId={id} />
    </div>
  );
}
