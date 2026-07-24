import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getVesselWsUrl } from '../utils/wsUrl';

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const PING_INTERVAL_MS = 30000;

function mergeVesselUpdates(existing, updates) {
  if (!existing?.length) return existing;
  const byId = new Map(updates.map((u) => [u.id, u]));
  return existing.map((v) => {
    const patch = byId.get(v.id);
    return patch ? { ...v, ...patch } : v;
  });
}

export function useVesselStream() {
  const queryClient = useQueryClient();
  const wsRef = useRef(null);
  const reconnectAttempt = useRef(0);
  const pingTimer = useRef(null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer = null;

    function scheduleReconnect() {
      if (cancelled) return;
      const delay = Math.min(
        RECONNECT_BASE_MS * 2 ** reconnectAttempt.current,
        RECONNECT_MAX_MS
      );
      reconnectAttempt.current += 1;
      setStatus('reconnecting');
      reconnectTimer = setTimeout(connect, delay);
    }

    function connect() {
      if (cancelled) return;

      const ws = new WebSocket(getVesselWsUrl());
      wsRef.current = ws;
      setStatus(reconnectAttempt.current === 0 ? 'connecting' : 'reconnecting');

      ws.onopen = () => {
        reconnectAttempt.current = 0;
        setStatus('connected');
        pingTimer.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'snapshot') {
            queryClient.setQueryData(['vessels'], msg.data);
          } else if (msg.type === 'positions_batch' && Array.isArray(msg.data)) {
            queryClient.setQueryData(['vessels'], (old) => mergeVesselUpdates(old, msg.data));
          }
        } catch {
          /* ignore malformed messages */
        }
      };

      ws.onclose = () => {
        clearInterval(pingTimer.current);
        if (!cancelled) scheduleReconnect();
        else setStatus('disconnected');
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      clearInterval(pingTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setStatus('disconnected');
    };
  }, [queryClient]);

  return { status };
}
