import FormLogin from '@/components/form-login';

import React, { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <FormLogin />
      </Suspense>
    </div>
  );
}
