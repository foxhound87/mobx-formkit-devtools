import { isBridgeMessage } from '../core';

declare const chrome: any;

interface TabConnections {
  devtools?: any;
  content?: any;
}

const tabs = new Map<number, TabConnections>();

const getConn = (tabId: number): TabConnections => {
  let conn = tabs.get(tabId);
  if (!conn) {
    conn = {};
    tabs.set(tabId, conn);
  }
  return conn;
};

const cleanup = (tabId: number) => {
  const conn = tabs.get(tabId);
  if (conn && !conn.devtools && !conn.content) tabs.delete(tabId);
};

chrome?.runtime?.onConnect?.addListener((port: any) => {
  // Devtools panel port — bound to the inspected tab via handshake.
  if (port.name === 'mobx-formkit-devtools') {
    let tabId: number | null = null;

    port.onMessage?.addListener((message: any) => {
      if (!isBridgeMessage(message)) return;
      if (message.type === 'handshake' && (message.payload as any)?.tabId != null) {
        tabId = (message.payload as any).tabId;
        const conn = getConn(tabId);
        conn.devtools = port;
        return;
      }
      if (tabId == null) return;
      getConn(tabId).content?.postMessage(message);
    });

    port.onDisconnect?.addListener(() => {
      if (tabId == null) return;
      const conn = tabs.get(tabId);
      if (conn?.devtools === port) conn.devtools = undefined;
      cleanup(tabId);
    });
    return;
  }

  // Content script port — identified by its sender tab.
  if (port.name === 'mobx-formkit-content') {
    const tabId: number | undefined = port.sender?.tab?.id;
    if (tabId == null) return;

    const conn = getConn(tabId);
    conn.content = port;

    port.onMessage?.addListener((message: any) => {
      if (!isBridgeMessage(message)) return;
      conn.devtools?.postMessage(message);
    });

    port.onDisconnect?.addListener(() => {
      if (conn.content === port) conn.content = undefined;
      cleanup(tabId);
    });
  }
});
