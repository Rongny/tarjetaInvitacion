import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GuestInvitationView from './GuestInvitationView';

// Force dynamic rendering to ensure guest status is fetched fresh on load
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  // Fetch guest and associated event details from Supabase
  const { data: guest, error } = await supabase
    .from('guests')
    .select(`
      *,
      events (
        *
      )
    `)
    .eq('id', id)
    .single();

  if (error || !guest || !guest.events) {
    console.error('Error fetching guest invitation:', error);
    return notFound();
  }

  return <GuestInvitationView guest={guest} />;
}
