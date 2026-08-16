export const HOOK_KEY = '__MOBX_FORMKIT_DEVTOOLS_HOOK__';

export const BRIDGE_SOURCE = 'mobx-formkit-devtools';

export interface FieldSnapshot {
  key?: string;
  path?: string;
  name?: string;
  id?: string;
  type?: string;
  value?: any;
  default?: any;
  initial?: any;
  error?: any;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  related?: any;
  rules?: any;
  options?: any;
  bindings?: any;
  extra?: any;
  checked?: any;
  validators?: any;
  validatedWith?: any;
  hasError?: boolean;
  isValid?: boolean;
  isDirty?: boolean;
  isPristine?: boolean;
  isDefault?: boolean;
  isEmpty?: boolean;
  disabled?: boolean;
  touched?: boolean;
  focused?: boolean;
  blurred?: boolean;
  changed?: boolean;
  deleted?: boolean;
  validating?: boolean;
  clearing?: boolean;
  resetting?: boolean;
  submitting?: boolean;
  size?: number;
  submitted?: boolean;
  validated?: boolean;
  fields?: FieldSnapshot[];
}

export interface FormSnapshot {
  key: string;
  name?: string;
  size?: number;
  submitted?: boolean;
  validated?: boolean;
  submitting?: boolean;
  validating?: boolean;
  clearing?: boolean;
  resetting?: boolean;
  hasError?: boolean;
  isValid?: boolean;
  isDirty?: boolean;
  isPristine?: boolean;
  isDefault?: boolean;
  isEmpty?: boolean;
  disabled?: boolean;
  deleted?: boolean;
  touched?: boolean;
  focused?: boolean;
  blurred?: boolean;
  changed?: boolean;
  error?: any;
  options?: Record<string, any>;
  helpers?: Record<string, any>;
  fields: FieldSnapshot[];
}

export type DevtoolsEvent =
  | { type: 'connected'; connected: boolean }
  | { type: 'form:new'; key: string; form: any }
  | { type: 'register'; key: string; form: any }
  | { type: 'unregister'; key: string }
  | { type: 'snapshot'; payload: FormSnapshot };

/**
 * Events forwarded from the page hook to the devtools panel.
 * These are serializable (unlike DevtoolsEvent, whose form payload
 * cannot cross the postMessage / chrome.runtime boundary).
 */
export type PanelEvent =
  | { type: 'connected'; payload: { connected: boolean } }
  | { type: 'form:new'; payload: { key: string; name?: string } }
  | { type: 'form:unregister'; payload: { key: string } }
  | { type: 'snapshot'; payload: FormSnapshot };

/**
 * Commands sent from the devtools panel to the page hook / form.
 */
export type PanelCommand =
  | { type: 'connect' }
  | { type: 'request-snapshot' }
  | { type: 'form:submit'; payload: { key: string } }
  | { type: 'form:clear'; payload: { key: string } }
  | { type: 'form:reset'; payload: { key: string } }
  | { type: 'form:validate'; payload: { key: string } }
  | { type: 'form:option'; payload: { key: string; option: string; value: boolean } };

export type BridgeEventType =
  | 'handshake'
  | 'ping'
  | 'pong'
  | 'connect'
  | 'request-snapshot'
  | 'connected'
  | 'form:new'
  | 'form:unregister'
  | 'snapshot'
  | 'form:submit'
  | 'form:clear'
  | 'form:reset'
  | 'form:validate'
  | 'form:option';

export interface DevtoolsHook {
  connected: boolean;
  registry: Map<string, any>;
  emit(event: DevtoolsEvent): void;
  subscribe(listener: (event: DevtoolsEvent) => void): () => void;
  register(key: string, form: any): void;
  unregister(key: string): void;
  connect(): void;
  disconnect(): void;
  requestSnapshot(): void;
}

export interface BridgeMessage<T = unknown> {
  source: typeof BRIDGE_SOURCE;
  type: string;
  payload?: T;
  id: string;
}

export const isBridgeMessage = (value: unknown): value is BridgeMessage => {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value as any).source === BRIDGE_SOURCE &&
      typeof (value as any).type === 'string'
  );
};

export const makeId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const makeMessage = <T = unknown>(
  type: BridgeEventType,
  payload?: T
): BridgeMessage<T> => ({
  source: BRIDGE_SOURCE,
  type,
  payload,
  id: makeId(),
});