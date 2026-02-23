import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { NewPropertyForm } from '@/components/admin/NewPropertyForm';

export default async function NewPropertyPage() {
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
    <div className="w-full min-w-0 max-w-2xl mx-auto">
      <NewPropertyForm />
    </div>
  );
}
