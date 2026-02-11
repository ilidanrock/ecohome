import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TenantDashboardContent } from '@/components/dashboard/TenantDashboardContent';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/login');
    return null;
  }

  return (
    <div className="container">
      <TenantDashboardContent />
    </div>
  );
}
