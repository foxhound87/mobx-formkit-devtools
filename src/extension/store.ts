import { makeAutoObservable } from 'mobx';
import { FormSnapshot, PanelEvent } from '../core';

export interface FormEntry {
  key: string;
  name?: string;
  snapshot: FormSnapshot | null;
}

const createStore = () =>
  makeAutoObservable({
    connected: false,
    entries: {} as Record<string, FormEntry>,
    order: [] as string[],
    selectedKey: null as string | null,

    get selected(): FormEntry | null {
      return this.selectedKey ? this.entries[this.selectedKey] ?? null : null;
    },

    get selectedSnapshot(): FormSnapshot | null {
      return this.selected?.snapshot ?? null;
    },

    get list(): Array<{ key: string; name: string }> {
      return this.order.map((key) => {
        const entry = this.entries[key];
        return { key, name: entry?.snapshot?.name ?? entry?.name ?? key };
      });
    },

    setConnected(value: boolean) {
      this.connected = value;
    },

    applyEvent(event: PanelEvent) {
      switch (event.type) {
        case 'connected':
          this.setConnected(event.payload.connected);
          break;
        case 'form:new':
          this.upsert(event.payload.key, event.payload.name);
          break;
        case 'form:unregister':
          this.remove(event.payload.key);
          break;
        case 'snapshot':
          this.applySnapshot(event.payload);
          break;
        default:
          break;
      }
    },

    upsert(key: string, name?: string) {
      if (!this.entries[key]) {
        this.entries[key] = { key, name, snapshot: null };
        this.order.push(key);
      } else if (name && !this.entries[key].name) {
        this.entries[key].name = name;
      }
      if (!this.selectedKey) this.selectedKey = key;
    },

    applySnapshot(snapshot: FormSnapshot) {
      const key = snapshot.key;
      const existing = this.entries[key];
      this.entries[key] = { key, name: snapshot.name ?? existing?.name, snapshot };
      if (!this.order.includes(key)) this.order.push(key);
      if (!this.selectedKey) this.selectedKey = key;
    },

    remove(key: string) {
      delete this.entries[key];
      this.order = this.order.filter((k) => k !== key);
      if (this.selectedKey === key) this.selectedKey = this.order[0] ?? null;
    },

    select(key: string | null) {
      this.selectedKey = key;
    },
  });

export type PanelStore = ReturnType<typeof createStore>;

export default createStore();
