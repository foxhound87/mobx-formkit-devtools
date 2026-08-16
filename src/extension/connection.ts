import { isBridgeMessage, makeMessage, PanelEvent, PanelCommand } from '../core';

declare const chrome: any;

type Listener = (event: PanelEvent) => void;

export interface PanelBridge {
  send(type: PanelCommand['type'], payload?: any): void;
  onEvent(listener: Listener): () => void;
  dispose(): void;
}

export const createBridge = (tabId: number): PanelBridge => {
  const port = chrome?.runtime?.connect?.({ name: 'mobx-formkit-devtools' });
  const listeners = new Set<Listener>();

  port?.onMessage?.addListener((message: any) => {
    if (!isBridgeMessage(message)) return;
    if (message.type === 'pong' || message.type === 'handshake') return;
    const event = { type: message.type, payload: message.payload } as PanelEvent;
    listeners.forEach((fn) => fn(event));
  });

  port?.postMessage?.(makeMessage('handshake', { tabId }));

  return {
    send(type: PanelCommand['type'], payload?: any) {
      port?.postMessage?.(makeMessage(type, payload));
    },
    onEvent(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      try {
        port?.disconnect?.();
      } catch {
        /* noop */
      }
    },
  };
};
