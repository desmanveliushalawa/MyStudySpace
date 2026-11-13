// Supabase Edge Function: google-calendar-sync
// Synchronizes reminders from MyStudySpace database to Google Calendar API
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getValidAccessToken(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('calendar_integrations')
    .select('access_token_enc, refresh_token_enc, token_expires_at, is_connected')
    .eq('user_id', userId)
    .single();

  if (error || !data || !data.is_connected) return null;

  const now = new Date();
  const expiresAt = data.token_expires_at ? new Date(data.token_expires_at) : new Date(0);

  // Jika token masih berlaku (buffer 2 menit)
  if (expiresAt.getTime() - now.getTime() > 2 * 60 * 1000) {
    return data.access_token_enc;
  }

  // Refresh token kedaluwarsa, lakukan refresh
  if (!data.refresh_token_enc) return null;

  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: data.refresh_token_enc,
      grant_type: 'refresh_token',
    }),
  });

  if (!refreshRes.ok) return null;

  const refreshData = await refreshRes.json();
  const newAccessToken = refreshData.access_token;
  const newExpiresAt = new Date(Date.now() + (refreshData.expires_in || 3600) * 1000).toISOString();

  await supabaseAdmin
    .from('calendar_integrations')
    .update({
      access_token_enc: newAccessToken,
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return newAccessToken;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '';
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Ambil payload event sinkronisasi
    const body = await req.json();
    const { reminder_id, action } = body; // action: 'create' | 'update' | 'delete'

    if (!reminder_id) {
      return new Response(JSON.stringify({ error: 'reminder_id diperlukan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ambil data reminder
    const { data: reminder, error: remError } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('id', reminder_id)
      .single();

    if (remError || !reminder) {
      return new Response(JSON.stringify({ error: 'Reminder tidak ditemukan' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Dapatkan token akses yang valid
    const accessToken = await getValidAccessToken(
      supabaseAdmin,
      reminder.user_id,
      clientId,
      clientSecret
    );

    if (!accessToken) {
      await supabaseAdmin
        .from('reminders')
        .update({
          sync_status: 'failed',
          sync_error: 'Google Calendar belum terhubung atau token telah dicabut.',
        })
        .eq('id', reminder_id);

      return new Response(JSON.stringify({ error: 'Kalender belum terhubung' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Hitung offset menit untuk notifikasi
    let minutesBefore = 30;
    if (reminder.notification_lead_time === '10m') minutesBefore = 10;
    if (reminder.notification_lead_time === '1h') minutesBefore = 60;
    if (reminder.notification_lead_time === '1d') minutesBefore = 1440;

    const startDate = new Date(reminder.remind_at);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Durasi 1 jam

    const eventPayload = {
      summary: `[MyStudySpace] ${reminder.title}`,
      description: reminder.description || 'Pengingat dari aplikasi MyStudySpace',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Asia/Jakarta',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: reminder.notification_type === 'email' ? 'email' : 'popup', minutes: minutesBefore },
        ],
      },
    };

    // ACTION: DELETE
    if (action === 'delete' && reminder.google_event_id) {
      const delRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${reminder.google_event_id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (delRes.status === 204 || delRes.status === 404) {
        await supabaseAdmin
          .from('reminders')
          .update({ google_event_id: null, sync_status: 'synced', sync_error: null })
          .eq('id', reminder_id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: UPDATE / CREATE
    let targetUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    let method = 'POST';

    if (reminder.google_event_id) {
      targetUrl = `${targetUrl}/${reminder.google_event_id}`;
      method = 'PUT';
    }

    const gRes = await fetch(targetUrl, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    const gData = await gRes.json();

    if (gRes.ok) {
      await supabaseAdmin
        .from('reminders')
        .update({
          google_event_id: gData.id,
          sync_status: 'synced',
          sync_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminder_id);

      return new Response(JSON.stringify({ success: true, event_id: gData.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Jika error 404 pada update, coba buat baru (create)
      await supabaseAdmin
        .from('reminders')
        .update({
          sync_status: 'failed',
          sync_error: gData.error?.message || 'Gagal sinkronisasi Google Calendar',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminder_id);

      return new Response(JSON.stringify({ error: gData.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

