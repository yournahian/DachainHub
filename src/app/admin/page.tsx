'use client';
/**
 * /admin route — Secret admin landing page.
 * We redirect to the root page with ?view=admin to trigger the Admin view.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to root, signaling the admin view
    router.replace('/?view=admin');
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        fontFamily: 'monospace',
        color: '#aa3011',
        fontSize: '14px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '8px' }}>&gt; SECURE_ADMIN_TERMINAL_LOAD</div>
        <div style={{ color: '#888', fontSize: '12px' }}>Redirecting to workspace...</div>
      </div>
    </div>
  );
}
