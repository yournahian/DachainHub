'use client';
/**
 * /builder route — OAuth callback landing page.
 * Twitter redirects here after authentication with ?auth_success=1 or ?auth_error=...
 * We pass these params to the root app and navigate to the builder view.
 */
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BuilderRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    // Redirect to root, preserving auth params, with hash to signal builder view
    router.replace(params ? `/?${params}&view=builder` : '/?view=builder');
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        fontFamily: 'monospace',
        color: '#22c55e',
        fontSize: '14px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '8px' }}>&gt; OAUTH_HANDSHAKE_COMPLETE</div>
        <div style={{ color: '#888', fontSize: '12px' }}>Redirecting to workspace...</div>
      </div>
    </div>
  );
}

export default function BuilderRedirectPage() {
  return (
    <Suspense>
      <BuilderRedirectInner />
    </Suspense>
  );
}
