import { isBridgeMessage } from '../core';

declare const chrome: any;

let port: any = null;

const ensurePort = () => {
  if (!port) {
    port = chrome?.runtime?.connect?.({ name: 'mobx-formkit-content' });

    port?.onMessage?.addListener((message: any) => {
      if (isBridgeMessage(message)) window.postMessage(message, '*');
    });

    port?.onDisconnect?.addListener(() => {
      port = null;
    });
  }
  return port;
};

// Open the port eagerly so the background can route to it as soon as the
// devtools panel sends its first message.
ensurePort();

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window || !isBridgeMessage(event.data)) return;
  const current = port || ensurePort();
  current?.postMessage(event.data);
});
