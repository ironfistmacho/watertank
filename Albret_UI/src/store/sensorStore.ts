import { create } from 'zustand';
import { SensorReading } from '@/types';
import { supabase } from '@/config/supabase';

interface SensorStore {
    latestReading: SensorReading | null;
    readings: SensorReading[];
    isLoading: boolean;
    error: string | null;
    lastUpdate: Date | null;

    // Actions
    fetchLatestReading: (deviceId: string) => Promise<void>;
    fetchReadings: (deviceId: string, limit?: number) => Promise<void>;
    subscribeToReadings: (deviceId: string) => () => void;
    clearReadings: () => void;
}

export const useSensorStore = create<SensorStore>((set, get) => ({
    latestReading: null,
    readings: [],
    isLoading: false,
    error: null,
    lastUpdate: null,

    fetchLatestReading: async (deviceId: string) => {
        try {
            const { data, error } = await supabase
                .from('sensor_readings')
                .select('*')
                .eq('device_id', deviceId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

            set({
                latestReading: data || null,
                lastUpdate: new Date(),
            });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchReadings: async (deviceId: string, limit = 100) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('sensor_readings')
                .select('*')
                .eq('device_id', deviceId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            set({
                readings: data || [],
                latestReading: data?.[0] || null,
                isLoading: false,
                lastUpdate: new Date(),
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    subscribeToReadings: (deviceId: string) => {
        const subscription = supabase
            .channel(`sensor-readings-${deviceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'sensor_readings',
                    filter: `device_id=eq.${deviceId}`,
                },
                (payload) => {
                    const newReading = payload.new as SensorReading;

                    set(state => ({
                        latestReading: newReading,
                        readings: [newReading, ...state.readings.slice(0, 99)], // Keep last 100
                        lastUpdate: new Date(),
                    }));
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    },

    clearReadings: () => {
        set({
            latestReading: null,
            readings: [],
            lastUpdate: null,
        });
    },
}));
