import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useVesselStream } from './useVesselStream';

export function useVessels() {
  return useQuery({
    queryKey: ['vessels'],
    queryFn: () => api.get('/vessels').then((r) => r.data),
  });
}

/** Vessel list with WebSocket live position stream. */
export function useLiveVessels() {
  const query = useVessels();
  const { status: connectionStatus } = useVesselStream();
  return { ...query, connectionStatus };
}

export function useWarningZones() {
  return useQuery({
    queryKey: ['warnings', 'zones'],
    queryFn: () => api.get('/warnings/zones').then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useWarnings(status = 'ACTIVE') {
  return useQuery({
    queryKey: ['warnings', status],
    queryFn: () => api.get('/warnings', { params: { status } }).then((r) => r.data),
  });
}

export function useWeather() {
  return useQuery({
    queryKey: ['weather'],
    queryFn: () => api.get('/weather').then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function usePorts(search = '') {
  return useQuery({
    queryKey: ['ports', search],
    queryFn: () =>
      api.get('/ports', { params: search ? { q: search } : {} }).then((r) => r.data),
  });
}

export function useSchedules(portId = '') {
  return useQuery({
    queryKey: ['schedules', portId],
    queryFn: () =>
      api.get('/schedules', { params: portId ? { portId } : {} }).then((r) => r.data),
  });
}

export function useActiveAlerts() {
  return useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: () => api.get('/alerts/active').then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data),
  });
}
