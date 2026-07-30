import { onMounted, onUnmounted } from 'vue';

const CHANNEL_NAME = 'startc_cms_sync';
let channel = null;

if (typeof BroadcastChannel !== 'undefined') {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch {}
}

export function notifyCmsChange(entity = 'content') {
  if (channel) {
    try {
      channel.postMessage({ type: 'CMS_UPDATED', entity, timestamp: Date.now() });
    } catch {}
  }
  try {
    localStorage.setItem('startc_cms_updated', `${entity}_${Date.now()}`);
  } catch {}
}

export function useCmsSync(onUpdateCallback) {
  let eventSource = null;
  let debounceTimer = null;

  function triggerUpdate(eventData) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (onUpdateCallback) onUpdateCallback(eventData);
    }, 150);
  }

  onMounted(() => {
    if (channel) {
      channel.onmessage = (e) => {
        if (e.data?.type === 'CMS_UPDATED') {
          triggerUpdate(e.data);
        }
      };
    }

    const storageHandler = (e) => {
      if (e.key === 'startc_cms_updated') {
        triggerUpdate({ type: 'CMS_UPDATED', key: e.newValue });
      }
    };
    window.addEventListener('storage', storageHandler);

    if (typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource('/api/events');
        eventSource.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed?.type === 'CMS_UPDATED') {
              triggerUpdate(parsed);
            }
          } catch {}
        };
      } catch {}
    }

    onUnmounted(() => {
      window.removeEventListener('storage', storageHandler);
      if (debounceTimer) clearTimeout(debounceTimer);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    });
  });
}
