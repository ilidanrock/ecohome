'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="h-[100dvh] w-full grid place-items-center bg-[#F8F9FA] p-4">
      <div className="w-full max-w-md text-center space-y-6 md:space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Leaf className="h-10 w-10 md:h-12 md:w-12 text-ecogreen" />
          <span className="ml-2 text-2xl md:text-3xl font-bold text-ecoblue">EcoHome</span>
        </div>

        {/* Error 403 */}
        <div className="space-y-2 md:space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-ecoblue">403</h1>
          <h2 className="text-xl md:text-2xl font-bold text-darkgray">Acceso denegado</h2>
          <p className="text-darkgray/70 text-base md:text-lg">
            No tienes permisos para acceder a esta página. Si crees que es un error, contacta con el
            administrador.
          </p>
        </div>

        {/* Ilustración */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-ecoblue/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-12 w-12 md:h-16 md:w-16 text-ecoblue/70" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-ecogreen/20 rounded-full" />
            <div className="absolute -bottom-2 -left-2 w-5 h-5 md:w-6 md:h-6 bg-ecoblue/20 rounded-full" />
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-ecoblue text-ecoblue hover:bg-ecoblue/10 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </Button>
          <Button asChild className="bg-ecoblue hover:bg-ecoblue/90 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Inicio
            </Link>
          </Button>
        </div>

        {/* Links extra */}
        <div className="pt-6 border-t border-lightgray text-sm space-y-3">
          <p className="text-darkgray/70">¿Necesitas ayuda? Prueba:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#"
              onClick={() =>
                signOut({
                  redirectTo: '/login',
                })
              }
              className="text-ecoblue hover:text-ecoblue/80"
            >
              Iniciar sesión con otra cuenta
            </Link>
            <Link href="/contact" className="text-ecoblue hover:text-ecoblue/80">
              Contactar soporte
            </Link>
            <Link href="/help" className="text-ecoblue hover:text-ecoblue/80">
              Centro de ayuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
