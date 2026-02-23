import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { EditPropertyForm } from '@/components/admin/EditPropertyForm';

export default async function EditPropertyPage({
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <EditPropertyForm propertyId={id} />
    </div>
  );
}
