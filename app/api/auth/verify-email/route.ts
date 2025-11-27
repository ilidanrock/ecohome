import { withCORS } from '@/lib/cors';
import { prisma } from '@/prisma';
import { redirect } from 'next/navigation';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const token = await searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 400 });
    }

    // Validate token format before querying database (prevents timing attacks and improves performance)
    // Tokens should be at least 32 characters and contain only alphanumeric, dash, and underscore
    if (token.length < 32 || !/^[a-zA-Z0-9_-]+$/.test(token)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    // Use findUnique for better performance (requires unique index on token)
    // Note: If token is not unique in schema, consider adding @@unique([token]) to VerificationToken model
    const verifyTokenExist = await prisma.verificationToken.findFirst({
      where: {
        token,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        email: verifyTokenExist?.identifier,
      },
    });

    if (!verifyTokenExist) {
      return withCORS(
        request,
        NextResponse.json({ error: 'Token no encontrado' }, { status: 404 })
      );
    }

    if (user?.emailVerified) {
      return withCORS(
        request,
        NextResponse.json({ error: 'Correo ya verificado' }, { status: 400 })
      );
    }

    if (verifyTokenExist.expires < new Date()) {
      return withCORS(request, NextResponse.json({ error: 'Token expirado' }, { status: 401 }));
    }

    const userUpdated = await prisma.user.update({
      where: {
        email: verifyTokenExist.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier: verifyTokenExist.identifier,
      },
    });

    if (!userUpdated) {
      return withCORS(
        request,
        NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      );
    }

    return redirect('/login?verified=true');
  } catch (error) {
    // Log error with context for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Verify Email API] Error verifying email:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    // Return appropriate error response
    const isDevelopment = process.env.NODE_ENV === 'development';

    return withCORS(
      request,
      NextResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to verify email. Please try again later.',
          ...(isDevelopment && {
            details: {
              message: errorMessage,
              ...(errorStack && { stack: errorStack }),
            },
          }),
        },
        { status: 500 }
      )
    );
  }
}

export function OPTIONS(request: NextRequest) {
  return withCORS(request, new NextResponse(null, { status: 204 }));
}
