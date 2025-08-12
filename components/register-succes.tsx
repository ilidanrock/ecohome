'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Leaf, Mail, CheckCircle, Clock, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function RegisterSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [progress, setProgress] = useState(0);
  const [viewHeight, setViewHeight] = useState('100vh');

  // Handle countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle navigation when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.push('/login');
    }
  }, [countdown, router]);

  // Update progress bar
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(() => ((10 - countdown) / 10) * 100);
    }, 100);

    return () => clearInterval(progressTimer);
  }, [countdown]);

  // Set view height to ensure no scrolling is needed
  useEffect(() => {
    const updateHeight = () => {
      setViewHeight(`${window.innerHeight}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div
      className="bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden flex flex-col"
      style={{ height: viewHeight }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/10 to-green-100/10 rounded-full blur-3xl animate-spin"
          style={{ animationDuration: '20s' }}
        ></div>
      </div>

      {/* Header with logo - compact */}
      <header className="relative z-10 py-3 px-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-md">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            EcoHome
          </span>
        </div>
      </header>

      {/* Main content - flex-grow to take available space */}
      <main className="relative z-10 px-4 flex-grow flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
          {/* Compact hero section */}
          <div className="text-center mb-4">
            {/* Success indicator - smaller */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                {/* Smaller floating particles */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-300"></div>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-800 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Verifica tu correo para comenzar.
            </h1>

            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-800 via-blue-600 to-green-600 bg-clip-text text-transparent">
              ¡Registro exitoso! 🎉
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Tu cuenta ha sido creada. Verifica tu correo para comenzar.
            </p>
          </div>

          {/* Main content grid - flex-grow to take available space */}
          <div className="grid lg:grid-cols-2 gap-4 flex-grow">
            {/* Left column - Email verification */}
            <div className="flex flex-col">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
                <CardHeader className="pb-2 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center shadow-md">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800">
                        Verifica tu email
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-600">
                        Te hemos enviado un enlace de verificación
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow flex flex-col justify-between py-2">
                  <Alert className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200/50 shadow-sm py-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-gray-700">
                      <strong className="text-blue-700">Revisa tu bandeja de entrada</strong>
                      <span className="text-xs text-gray-600 block">
                        Si no encuentras el email, revisa tu carpeta de spam.
                      </span>
                    </AlertDescription>
                  </Alert>

                  {/* Steps - more compact */}
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">!</span>
                      </div>
                      Pasos a seguir:
                    </h4>
                    <div className="space-y-2">
                      {[
                        { icon: '📧', text: 'Revisa tu bandeja de entrada' },
                        { icon: '🔗', text: 'Haz clic en el enlace de verificación' },
                        { icon: '🚀', text: '¡Inicia sesión y comienza!' },
                      ].map((step, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {index + 1}
                          </div>
                          <span className="text-base">{step.icon}</span>
                          <span className="text-sm text-gray-700 font-medium flex-1">
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 text-xs font-medium py-1 rounded-lg hover:bg-blue-50 transition-all duration-300 mt-2"
                  >
                    ¿No recibiste el email? Reenviar verificación
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Features and actions */}
            <div className="flex flex-col space-y-3">
              {/* Auto-redirect countdown - more compact */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                <div className="flex items-center p-3">
                  <div className="flex-1">
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Redirección automática
                    </h3>
                    <Progress value={progress} className="h-2 mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{countdown}</div>
                    <p className="text-xs text-gray-600">segundos</p>
                  </div>
                </div>
              </Card>

              {/* Features preview - more compact */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 flex-grow">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm text-gray-800">
                    ¿Qué puedes hacer con EcoHome?
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid gap-2">
                    {[
                      { icon: Shield, title: 'Seguridad', desc: 'Protección para tu hogar' },
                      { icon: Zap, title: 'Eficiencia', desc: 'Optimiza el consumo energético' },
                      { icon: Users, title: 'Comunidad', desc: 'Conecta con otros usuarios' },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-green-50 transition-all duration-300 group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-sm">
                          <feature.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800">{feature.title}</h4>
                          <p className="text-xs text-gray-600">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action button - more compact */}
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
              >
                <span>¿Ya verificaste tu email? Iniciar sesión</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - more compact */}
      <footer className="relative z-10 text-center py-2 text-gray-500">
        <p className="text-xs">© 2024 EcoHome. Construyendo un futuro más sostenible.</p>
      </footer>
    </div>
  );
}
