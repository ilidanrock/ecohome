import Image from 'next/image';
import Link from 'next/link';
import { BarChart3, Droplets, Leaf, LightbulbIcon, Mountain, Shield, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

export const dynamic = 'force-static';

export default async function LandingPage() {
  const heroData: Array<{
    name: string;
    description: string;
    imgURL: string;
  }> = await client.fetch(`
    *[_type == "heroImg"]
  `);

  // 2) Genera la URL optimizada
  const heroUrl = urlFor(heroData[0].imgURL).width(600).height(600).auto('format').url();

  const companiesData: Array<{
    name: string;
    description: string;
    imgURL: string;
  }> = await client.fetch(`
    *[_type == "companiesImg"]
  `);

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="border-b border-lightgray bg-white dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-50">
        <div className="w-full flex h-16 items-center justify-between px-4 md:px-6 2xl:px-12 4xl:px-24">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-ecogreen" />
            <span className="text-2xl font-bold text-ecoblue">EcoHome</span>
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link href="#features" className="text-darkgray hover:text-ecoblue transition-colors">
              Características
            </Link>
            <Link
              href="#how-it-works"
              className="text-darkgray hover:text-ecoblue transition-colors"
            >
              Cómo funciona
            </Link>
            <Link href="#pricing" className="text-darkgray hover:text-ecoblue transition-colors">
              Precios
            </Link>
            <Link href="#contact" className="text-darkgray hover:text-ecoblue transition-colors">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden text-darkgray hover:text-ecoblue transition-colors md:inline-block"
            >
              Iniciar sesión
            </Link>
            <Link href="/register">
              <Button className="bg-ecoblue hover:bg-ecoblue/90">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-light-gray dark:from-gray-800 to-white dark:to-gray-900 py-16 md:py-24 2xl:py-32">
          <div className="w-full px-4 md:px-6 2xl:px-12 4xl:px-24">
            <div className="mx-auto grid gap-6 lg:grid-cols-2 lg:gap-12  items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="font-bold tracking-tighter text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl text-darkgray">
                    Gestiona tu consumo energético de forma inteligente
                  </h1>
                  <p className="text-lg md:text-xl 2xl:text-2xl text-darkgray/70 max-w-[800px] 2xl:max-w-[1000px]">
                    EcoHome te ayuda a monitorizar y optimizar el consumo de energía y agua en tus
                    propiedades, ahorrando dinero y cuidando el planeta.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="bg-ecoblue hover:bg-ecoblue/90">
                    Comenzar ahora
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-ecogreen text-ecogreen hover:bg-ecogreen/10"
                  >
                    Ver demostración
                  </Button>
                </div>
                <p className="text-sm dark:text-gray-400 text-darkgray/60">
                  Más de 10,000 hogares ya confían en EcoHome para su gestión energética
                </p>
              </div>
              <div className="relative mx-auto w-full max-w-[600px] overflow-hidden rounded-xl lg:aspect-square">
                <Image
                  src={heroUrl}
                  alt="EcoHome Dashboard"
                  width={600}
                  height={600}
                  className="object-cover"
                  blurDataURL="/globe.svg"
                  priority={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Logos Section */}
        <section className="border-y border-light-gray py-12">
          <div className="mx-auto px-4 md:px-6">
            <h2 className="mb-8 text-center text-lg font-medium text-darkgray/70">
              Empresas que confían en nosotros
            </h2>
            <div className=" grid grid-cols-2 gap-8 md:place-content-evenly md:grid-cols-4  ">
              {companiesData.map((company, i) => (
                <div key={i} className="flex items-center justify-center">
                  <Image
                    src={urlFor(company.imgURL).width(120).height(40).auto('format').url()}
                    alt={`Logo de ${company.name}`}
                    width={120}
                    height={40}
                    className="h-auto w-[120px] opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0 dark:opacity-50 dark:grayscale-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-darkgray">
                Características principales
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-darkgray/70 md:text-xl">
                Descubre cómo EcoHome te ayuda a gestionar tu consumo energético de forma eficiente
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start space-y-3 rounded-lg border border-light-gray bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-ecoblue/10 p-3">
                  <BarChart3 className="h-6 w-6 text-ecoblue" />
                </div>
                <h3 className="text-xl font-bold text-darkgray">Monitorización en tiempo real</h3>
                <p className="text-darkgray/70">
                  Visualiza el consumo de energía y agua en tiempo real con gráficos detallados y
                  fáciles de entender.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border border-light-gray bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-ecogreen/10 p-3">
                  <LightbulbIcon className="h-6 w-6 text-ecogreen" />
                </div>
                <h3 className="text-xl font-bold text-darkgray">Recomendaciones inteligentes</h3>
                <p className="text-darkgray/70">
                  Recibe consejos personalizados para reducir tu consumo basados en tus patrones de
                  uso.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border border-light-gray bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-ecoblue/10 p-3">
                  <Zap className="h-6 w-6 text-ecoblue" />
                </div>
                <h3 className="text-xl font-bold text-darkgray">Alertas de consumo</h3>
                <p className="text-darkgray/70">
                  Configura alertas personalizadas para detectar picos de consumo o posibles fugas.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border border-light-gray bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-ecogreen/10 p-3">
                  <Droplets className="h-6 w-6 text-ecogreen" />
                </div>
                <h3 className="text-xl font-bold text-darkgray">Gestión del agua</h3>
                <p className="text-darkgray/70">
                  Controla el consumo de agua y detecta posibles fugas antes de que se conviertan en
                  un problema.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border border-light-gray bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-ecoblue/10 p-3">
                  <Shield className="h-6 w-6 text-ecoblue" />
                </div>
                <h3 className="text-xl font-bold text-darkgray">Seguridad de datos</h3>
                <p className="text-darkgray/70">
                  Tus datos están protegidos con los más altos estándares de seguridad y
                  encriptación.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border border-light-gray bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-ecogreen/10 p-3">
                  <Mountain className="h-6 w-6 text-ecogreen" />
                </div>
                <h3 className="text-xl font-bold text-darkgray">Impacto ambiental</h3>
                <p className="text-darkgray/70">
                  Visualiza tu huella de carbono y el impacto positivo de tus acciones en el medio
                  ambiente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-light-gray py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <p className="text-4xl font-bold text-ecoblue md:text-5xl">30%</p>
                <p className="mt-2 text-lg font-medium text-darkgray">
                  Ahorro promedio en facturas
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-ecogreen md:text-5xl">10,000+</p>
                <p className="mt-2 text-lg font-medium text-darkgray">Hogares conectados</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-ecoblue md:text-5xl">5,000 ton</p>
                <p className="mt-2 text-lg font-medium text-darkgray">CO₂ evitado anualmente</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-darkgray">
                Cómo funciona
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-darkgray/70 md:text-xl">
                Comienza a ahorrar energía y dinero en tres sencillos pasos
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ecoblue text-xl font-bold text-white">
                  1
                </div>
                <h3 className="mb-2 text-xl font-bold text-darkgray">Conecta tus dispositivos</h3>
                <p className="text-darkgray/70">
                  Instala nuestros medidores inteligentes en tu hogar y conéctalos a la aplicación
                  EcoHome.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ecoblue text-xl font-bold text-white">
                  2
                </div>
                <h3 className="mb-2 text-xl font-bold text-darkgray">Monitoriza tu consumo</h3>
                <p className="text-darkgray/70">
                  Visualiza en tiempo real el consumo de energía y agua de tu hogar desde cualquier
                  dispositivo.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ecoblue text-xl font-bold text-white">
                  3
                </div>
                <h3 className="mb-2 text-xl font-bold text-darkgray">Ahorra y optimiza</h3>
                <p className="text-darkgray/70">
                  Sigue nuestras recomendaciones personalizadas para reducir tu consumo y ahorrar en
                  tus facturas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-light-gray py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-darkgray">
                Lo que dicen nuestros usuarios
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'María García',
                  role: 'Propietaria',
                  quote:
                    'Desde que instalé EcoHome, he reducido mi factura de electricidad en un 25%. Las alertas de consumo me han ayudado a identificar aparatos que consumían demasiada energía.',
                },
                {
                  name: 'Carlos Rodríguez',
                  role: 'Administrador de fincas',
                  quote:
                    'Gestionar el consumo de agua de múltiples propiedades nunca había sido tan fácil. EcoHome nos ha permitido detectar fugas rápidamente y ahorrar miles de euros.',
                },
                {
                  name: 'Laura Martínez',
                  role: 'Inquilina',
                  quote:
                    'La aplicación es muy intuitiva y las recomendaciones son realmente útiles. He conseguido reducir mi huella de carbono y ahorrar dinero al mismo tiempo.',
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between space-y-4 rounded-lg border border-light-gray bg-white p-6 shadow-sm"
                >
                  <p className="text-darkgray/80 dark:text-gray-300 italic">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold text-darkgray dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-darkgray/70 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-darkgray">
                  Comienza a ahorrar hoy mismo
                </h2>
                <p className="mx-auto max-w-[600px] text-darkgray/70 md:text-xl">
                  Únete a miles de hogares que ya están ahorrando energía, agua y dinero con
                  EcoHome.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-ecoblue hover:bg-ecoblue/90">
                  Registrarse gratis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-ecogreen text-ecogreen hover:bg-ecogreen/10"
                >
                  Contactar con ventas
                </Button>
              </div>
              <p className="text-sm dark:text-gray-400 text-darkgray/60">
                No se requiere tarjeta de crédito para comenzar
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-light-gray bg-white dark:bg-gray-900 dark:border-gray-800 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-ecogreen" />
                <span className="text-xl font-bold text-ecoblue">EcoHome</span>
              </div>
              <p className="mt-4 text-sm dark:text-gray-400 text-darkgray/70">
                Empoderando la gestión sostenible de energía en hogares y propiedades.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-darkgray">Producto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Integraciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Casos de uso
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-darkgray">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Carreras
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-darkgray">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Términos de servicio
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-light-gray pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-darkgray/70">
              &copy; {new Date().getFullYear()} EcoHome. Todos los derechos reservados.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
              <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                <span className="sr-only">Facebook</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
              <Link href="#" className="text-darkgray/70 hover:text-ecoblue transition-colors">
                <span className="sr-only">Instagram</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
