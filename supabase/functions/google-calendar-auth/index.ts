// Supabase Edge Function: google-calendar-auth
// Handles OAuth 2.0 authorization code flow with offline access for Google Calendar API
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Generate Authorization URL
    if (action === 'authorize') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verifikasi token user
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'User tidak valid' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const state = btoa(JSON.stringify({ userId: user.id }));
      const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri || ''
      )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

      return new Response(JSON.stringify({ url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Callback handler from Google
    if (action === 'callback') {
      const code = url.searchParams.get('code');
      const stateParam = url.searchParams.get('state');

      if (!code || !stateParam) {
        return new Response('Parameter code atau state tidak valid', { status: 400 });
      }

      const { userId } = JSON.parse(atob(stateParam));

      // Tukarkan code dengan token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId || '',
          client_secret: clientSecret || '',
          redirect_uri: redirectUri || '',
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        return new Response(`Gagal mendapatkan token: ${tokenData.error_description || tokenData.error}`, {
          status: 400,
        });
      }

      const { access_token, refresh_token, expires_in } = tokenData;

      // Ambil email Google pengguna
      let googleEmail = '';
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const userInfo = await userInfoRes.json();
        googleEmail = userInfo.email || '';
      } catch {
        // Lewati jika profil gagal
      }

      const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

      // Simpan ke calendar_integrations menggunakan admin client
      const { error: upsertError } = await supabaseAdmin
        .from('calendar_integrations')
        .upsert(
          {
            user_id: userId,
            provider: 'google',
            access_token_enc: access_token,
            refresh_token_enc: refresh_token || null,
            token_expires_at: expiresAt,
            google_email: googleEmail,
            is_connected: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (upsertError) {
        return new Response(`Database error: ${upsertError.message}`, { status: 500 });
      }

      // Redirect kembali ke halaman pengingat di aplikasi
      return Response.redirect(`${url.origin.replace(':54321', ':5173')}/reminders?connected=true`, 302);
    }

    return new Response(JSON.stringify({ error: 'Aksi tidak dikenal' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

