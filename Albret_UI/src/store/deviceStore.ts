import { create } from 'zustand';
import { Device } from '@/types';
import { supabase } from '@/config/supabase';

interface DeviceStore {
    devices: Device[];
    selectedDevice: Device | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchDevices: (userId: string) => Promise<void>;
    selectDevice: (device: Device) => void;
    addDevice: (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: any }>;
    updateDevice: (deviceId: string, updates: Partial<Device>) => Promise<{ error?: any }>;
    deleteDevice: (deviceId: string) => Promise<{ error?: any }>;
    subscribeToDeviceUpdates: (userId: string) => () => void;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
    devices: [],
    selectedDevice: null,
    isLoading: false,
    error: null,

    fetchDevices: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('devices')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            set({
                devices: data || [],
                isLoading: false,
                selectedDevice: data?.[0] || null, // Auto-select first device
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    selectDevice: (device: Device) => {
        set({ selectedDevice: device });
    },

    addDevice: async (device) => {
        try {
            const { data, error } = await supabase
                .from('devices')
                .insert([device])
                .select()
                .single();

            if (error) return { error };

            set(state => ({
                devices: [data, ...state.devices],
            }));

            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    updateDevice: async (deviceId: string, updates: Partial<Device>) => {
        try {
            const { data, error } = await supabase
                .from('devices')
                .update(updates)
                .eq('id', deviceId)
                .select()
                .single();

            if (error) return { error };

            set(state => ({
                devices: state.devices.map(d => d.id === deviceId ? data : d),
                selectedDevice: state.selectedDevice?.id === deviceId ? data : state.selectedDevice,
            }));

            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    deleteDevice: async (deviceId: string) => {
        try {
            const { error } = await supabase
                .from('devices')
                .delete()
                .eq('id', deviceId);

            if (error) return { error };

            set(state => ({
                devices: state.devices.filter(d => d.id !== deviceId),
                selectedDevice: state.selectedDevice?.id === deviceId ? null : state.selectedDevice,
            }));

            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    subscribeToDeviceUpdates: (userId: string) => {
        const subscription = supabase
            .channel('device-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'devices',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        set(state => ({
                            devices: [payload.new as Device, ...state.devices],
                        }));
                    } else if (payload.eventType === 'UPDATE') {
                        set(state => ({
                            devices: state.devices.map(d =>
                                d.id === payload.new.id ? payload.new as Device : d
                            ),
                            selectedDevice: state.selectedDevice?.id === payload.new.id
                                ? payload.new as Device
                                : state.selectedDevice,
                        }));
                    } else if (payload.eventType === 'DELETE') {
                        set(state => ({
                            devices: state.devices.filter(d => d.id !== payload.old.id),
                            selectedDevice: state.selectedDevice?.id === payload.old.id
                                ? null
                                : state.selectedDevice,
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    },
}));
