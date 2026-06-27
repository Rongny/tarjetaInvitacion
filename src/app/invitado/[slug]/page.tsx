import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GuestInvitationView from './GuestInvitationView';

// Force dynamic rendering to ensure guest status is fetched fresh on load
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

  // Fetch guest and associated event details from Supabase by slug or id fallback
  const query = supabase
    .from('guests')
    .select(`
      *,
      events (
        *
      )
    `);

  const { data: guest, error } = await (isUuid
    ? query.eq('id', slug).single()
    : query.eq('slug', slug).single()
  );

  if (error || !guest || !guest.events) {
    console.error('Error fetching guest invitation:', error);
    return notFound();
  }

  return <GuestInvitationView guest={guest} />;
}
