import { useEffect, useState } from 'react';
import { api } from './api';

const STORAGE_KEY = 'presence_id';
const HEARTBEAT_INTERVAL_MS = 20_000;

function getOrCreateId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

// Реальный счётчик посетителей онлайн: раз в 20с шлём heartbeat со своим
// анонимным id, сервер отвечает числом id, "постучавшихся" за последние 45с.
export function useOnlineCount(): number | null {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const id = getOrCreateId();
    let cancelled = false;

    function beat() {
      api
        .heartbeat(id)
        .then((res) => {
          if (!cancelled) setOnline(res.online);
        })
        .catch(() => {});
    }

    beat();
    const interval = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return online;
}
