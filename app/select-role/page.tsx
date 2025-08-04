'use client';

import { useState } from 'react';
import { Shield, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateUserRole } from '@/actions/auth-action';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';
import { role } from '@/types/user';

export default function SelectRole() {
  const { data: session, status, update: updateSession } = useSession();
  const [selectedRole, setSelectedRole] = useState<role>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = async () => {
    const userEmail = session?.user?.email;

    if (status !== 'authenticated' || !userEmail) {
      setErrorMessage(
        'No se pudo obtener la información de la sesión. Por favor, inicia sesión nuevamente.'
      );
      return;
    }

    if (!selectedRole) {
      setErrorMessage('Por favor selecciona un rol');
      return;
    }

    await updateSession({
      ...session,
      user: {
        ...session.user,
        role: selectedRole,
      },
    });

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await updateUserRole(selectedRole, userEmail);

      if (result?.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
        return;
      }

      // Redirigir según el rol seleccionado
      if (selectedRole === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error in handleRoleSelect:', error);
      setErrorMessage('Ocurrió un error al actualizar tu rol. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">¡Bienvenido a EcoHome!</h1>
          <p className="mt-2 opacity-90">Por favor, selecciona tu rol para continuar</p>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedRole('USER')}
              className={`p-6 border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center h-full ${
                selectedRole === 'USER'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <User
                className={`h-10 w-10 mb-3 ${
                  selectedRole === 'USER' ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              <h3 className="font-semibold text-gray-800">Usuario</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Accede al dashboard de usuario
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('ADMIN')}
              className={`p-6 border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center h-full ${
                selectedRole === 'ADMIN'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-200'
              }`}
            >
              <Shield
                className={`h-10 w-10 mb-3 ${
                  selectedRole === 'ADMIN' ? 'text-green-600' : 'text-gray-400'
                }`}
              />
              <h3 className="font-semibold text-gray-800">Administrador</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Accede al panel de administración
              </p>
            </button>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
          >
            <span>Continuar</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
