import {
  HOOK_KEY,
  isBridgeMessage,
  makeMessage,
  DevtoolsEvent,
  PanelCommand,
} from '../core';

const globalRef = globalThis as any;

const getHook = (): any => globalRef[HOOK_KEY];

let subscribed = false;
let active = false;
let pendingConnect = false;

const post = (type: any, payload?: any) => {
  window.postMessage(makeMessage(type, payload), '*');
};

/** Translate a page-hook event into a serializable panel event. */
const forward = (event: DevtoolsEvent) => {
  if (!active) return;

  switch (event.type) {
    case 'connected':
      post('connected', { connected: event.connected });
      break;
    case 'snapshot':
      post('snapshot', event.payload);
      break;
    case 'form:new':
    case 'register':
      post('form:new', {
        key: event.key,
        name: event.form?.name ?? getHook()?.registry?.get?.(event.key)?.name,
      });
      break;
    case 'unregister':
      post('form:unregister', { key: event.key });
      break;
    default:
      break;
  }
};

const subscribe = () => {
  const hook = getHook();
  if (!hook || subscribed) return;
  hook.subscribe(forward);
  subscribed = true;
};

let polling = false;

/** Connect on demand; the hook may appear after the page lib loads. */
const connect = () => {
  const hook = getHook();
  if (!hook) {
    pendingConnect = true;
    if (!polling) {
      polling = true;
      poll();
    }
    return;
  }
  active = true;
  subscribe();
  hook.connect?.();
  // `hook.connect()` only emits a "connected" event the first time it
  // transitions; a panel that (re)connects to an already-connected hook
  // would otherwise never learn the status. Report it explicitly.
  post('connected', { connected: hook.connected === true });
};

const runCommand = (command: PanelCommand) => {
  switch (command.type) {
    case 'connect':
      connect();
      break;
    case 'request-snapshot':
      getHook()?.requestSnapshot?.();
      break;
    case 'form:submit':
    case 'form:clear':
    case 'form:reset':
    case 'form:validate': {
      const key = command.payload?.key;
      const form = getHook()?.registry?.get?.(key);
      const method = command.type.slice('form:'.length);
      if (form && typeof form[method] === 'function') form[method]();
      break;
    }
    case 'form:option': {
      const { key, option, value } = command.payload ?? ({} as any);
      const form = getHook()?.registry?.get?.(key);
      form?.state?.options?.set?.({ [option]: value });
      break;
    }
    default:
      break;
  }
};

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window || !isBridgeMessage(event.data)) return;
  const message = event.data;

  if (message.type === 'ping') {
    post('pong', { connected: !!getHook()?.connected });
    return;
  }

  runCommand(message as unknown as PanelCommand);
});

// The hook is installed by the page lib after this script runs
// (document_start). Poll while a connection is still pending.
const poll = () => {
  if (!pendingConnect) {
    polling = false;
    return;
  }
  if (getHook()) {
    pendingConnect = false;
    polling = false;
    connect();
    return;
  }
  setTimeout(poll, 300);
};
