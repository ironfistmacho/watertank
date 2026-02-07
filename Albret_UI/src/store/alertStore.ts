import { create } from 'zustand';
import { Alert } from '@/types';
import { supabase } from '@/config/supabase';

interface AlertStore {
    alerts: Alert[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAlerts: (userId: string) => Promise<void>;
    acknowledgeAlert: (alertId: string) => Promise<{ error?: any }>;
    subscribeToAlerts: (userId: string) => () => void;
    clearAlerts: () => void;
    getUnreadCount: () => number;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
    alerts: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchAlerts: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('alerts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const unreadCount = data?.filter(alert => !alert.is_acknowledged).length || 0;

            set({
                alerts: data || [],
                unreadCount,
                isLoading: false,
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    acknowledgeAlert: async (alertId: string) => {
        try {
            const { error } = await supabase
                .from('alerts')
                .update({
                    is_acknowledged: true,
                    acknowledged_at: new Date().toISOString(),
                })
                .eq('id', alertId);

            if (error) return { error };

            set(state => ({
                alerts: state.alerts.map(alert =>
                    alert.id === alertId
                        ? { ...alert, is_acknowledged: true, acknowledged_at: new Date().toISOString() }
                        : alert
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));

            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    subscribeToAlerts: (userId: string) => {
        const subscription = supabase
            .channel('alerts-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'alerts',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newAlert = payload.new as Alert;

                    set(state => ({
                        alerts: [newAlert, ...state.alerts],
                        unreadCount: state.unreadCount + 1,
                    }));
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    },

    clearAlerts: () => {
        set({
            alerts: [],
            unreadCount: 0,
        });
    },

    getUnreadCount: () => {
        return get().unreadCount;
    },
}));
