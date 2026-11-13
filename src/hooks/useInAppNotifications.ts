import { useEffect, useState, useRef } from 'react';
import { useReminders } from './useReminders';
import { toast } from 'sonner';

function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // 3-tone arpeggiated melodic chime
    const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch {
    // Silent fail if AudioContext is not permitted yet
  }
}

export function useInAppNotifications() {
  const { reminders, toggleReminderComplete } = useReminders();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const notifiedIds = useRef<Set<string>>(new Set());

  // Load previously notified IDs from sessionStorage to prevent spamming on page navigation
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mystudyspace_notified_reminders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          notifiedIds.current = new Set(parsed);
        }
      }
    } catch {
      // Ignore sessionStorage parsing issues
    }
  }, []);

  // Request browser notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Browser ini tidak mendukung notifikasi sistem.');
      return false;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        playNotificationChime();
        toast.success('Izin notifikasi browser berhasil diaktifkan!');
        try {
          new Notification('🔔 [MyStudySpace] Notifikasi Aktif', {
            body: 'Notifikasi sistem dan pengingat deadline Anda siap bekerja!',
            icon: '/favicon.svg',
          });
        } catch {
          // Ignore
        }
        return true;
      } else if (res === 'denied') {
        toast.error('Izin notifikasi diblokir di setelan browser. Izinkan via ikon gembok pada URL bar.');
        return false;
      } else {
        toast.info('Izin notifikasi belum disetujui.');
        return false;
      }
    } catch {
      return false;
    }
  };

  // Trigger immediate test notification
  const sendTestNotification = () => {
    playNotificationChime();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([200, 100, 200]);
    }

    // 1. In-app Sonner toast
    toast.info('🔔 Pengingat Uji Coba: MyStudySpace', {
      description: 'Sistem pengingat dan suara notifikasi berjalan dengan sempurna!',
      duration: 5000,
    });

    // 2. Native browser Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🔔 [MyStudySpace] Pengingat Uji Coba', {
          body: 'Notifikasi pop-up sistem dan suara berhasil dibunyikan!',
          icon: '/favicon.svg',
        });
      } catch {
        // Ignore
      }
    } else if (permission !== 'granted') {
      toast.warning('Notifikasi browser belum diizinkan. Klik "Aktifkan Notifikasi Browser" di atas.', {
        duration: 6000,
      });
    }
  };

  // Periodic interval check (every 10 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();

      reminders.forEach((rem) => {
        if (rem.is_completed) return;
        if (notifiedIds.current.has(rem.id)) return;

        const remindTime = new Date(rem.remind_at).getTime();

        // Calculate lead time offset
        let leadMs = 0;
        if (rem.notification_lead_time === '10m') leadMs = 10 * 60 * 1000;
        else if (rem.notification_lead_time === '30m') leadMs = 30 * 60 * 1000;
        else if (rem.notification_lead_time === '1h') leadMs = 60 * 60 * 1000;
        else if (rem.notification_lead_time === '1d') leadMs = 24 * 60 * 60 * 1000;

        const triggerTime = remindTime - leadMs;

        // Trigger if current time has reached or passed triggerTime, up to 2 hours after
        if (now >= triggerTime && now <= remindTime + 2 * 60 * 60 * 1000) {
          notifiedIds.current.add(rem.id);

          try {
            sessionStorage.setItem(
              'mystudyspace_notified_reminders',
              JSON.stringify(Array.from(notifiedIds.current))
            );
          } catch {
            // Ignore
          }

          // Sound & Haptic
          playNotificationChime();
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.([200, 100, 200]);
          }

          // In-app Sonner toast with action
          const timeLabel = new Date(rem.remind_at).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          });

          toast.warning(`🔔 Pengingat: ${rem.title}`, {
            description: rem.description || `Jatuh tempo pada ${timeLabel} WIB`,
            duration: 10000,
            action: {
              label: 'Tandai Selesai',
              onClick: () =>
                toggleReminderComplete.mutate({ id: rem.id, is_completed: false }),
            },
          });

          // Native browser notification
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              const notif = new Notification(`🔔 [MyStudySpace] ${rem.title}`, {
                body: rem.description || `Pengingat jadwal: ${timeLabel} WIB`,
                icon: '/favicon.svg',
                tag: rem.id,
              });
              notif.onclick = () => {
                window.focus();
              };
            } catch {
              // Ignore
            }
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    checkReminders(); // Run immediately on mount or when reminders change

    return () => clearInterval(interval);
  }, [reminders, toggleReminderComplete]);

  return {
    permission,
    requestPermission,
    sendTestNotification,
  };
}
