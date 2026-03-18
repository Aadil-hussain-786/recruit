"use client";

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  
  if (key && host) {
    posthog.init(key, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: false // Handled in useEffect to avoid double counts with Next.js
    });
  }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        posthog.capture('$pageview');
    }, []);

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
