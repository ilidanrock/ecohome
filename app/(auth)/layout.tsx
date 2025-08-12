import React from 'react';

function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100 w-full">
      {children}
    </div>
  );
}

export default AuthLayout;
