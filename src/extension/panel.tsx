import React, { useEffect, useState, useCallback } from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';
import JSONTree from 'react-json-tree';
import {
  CircleDot,
  Eraser,
  RotateCw,
  CheckCircle,
  LayoutGrid,
  Menu,
  List,
  Wrench,
  Settings,
  ChevronDown,
} from 'lucide-react';

import store from './store';
import { createBridge, PanelBridge } from './connection';
import { FieldSnapshot, FormSnapshot } from '../core';
import theme from '../react/styles/_.theme';
import style from './styles';

const fieldKey = (field: FieldSnapshot, index: number): string =>
  field.path ?? field.name ?? field.key ?? `field-${index}`;

const toValues = (fields: FieldSnapshot[] = []): Record<string, any> => {
  const out: Record<string, any> = {};
  fields.forEach((field, index) => {
    const key = fieldKey(field, index);
    out[key] =
      field.fields && field.fields.length ? toValues(field.fields) : field.value;
  });
  return out;
};

const HELPERS = [
  { label: 'errors', prop: 'error' },
  { label: 'labels', prop: 'label' },
  { label: 'placeholders', prop: 'placeholder' },
  { label: 'defaults', prop: 'default' },
  { label: 'initials', prop: 'initial' },
  { label: 'types', prop: 'type' },
  { label: 'disabled', prop: 'disabled' },
  { label: 'checked', prop: 'checked' },
  { label: 'related', prop: 'related' },
  { label: 'rules', prop: 'rules' },
  { label: 'options', prop: 'options' },
  { label: 'extra', prop: 'extra' },
  { label: 'bindings', prop: 'bindings' },
  { label: 'validators', prop: 'validators' },
  { label: 'validatedWith', prop: 'validatedWith' },
  { label: 'hooks', prop: 'hooks' },
  { label: 'handlers', prop: 'handlers' },
];

const OPTION_GROUPS: Array<{ label: string; test: RegExp }> = [
  { label: 'Errors', test: /^showErrors/ },
  { label: 'Validation', test: /^validate|^resetValidation|^stopValidation/ },
  { label: 'Strict', test: /^strict/ },
  { label: 'Retrieve', test: /^retrieve/ },
  { label: 'Input converter', test: /^applyInputConverter/ },
];

const groupOptions = (
  names: string[]
): Array<{ label: string; names: string[] }> => {
  const groups = OPTION_GROUPS.map((group) => ({
    label: group.label,
    names: names.filter((name) => group.test.test(name)).sort(),
  }));
  const grouped = new Set<string>();
  for (const group of groups) {
    for (const name of group.names) grouped.add(name);
  }
  const other = names.filter((name) => !grouped.has(name)).sort();
  if (other.length) groups.push({ label: 'Other', names: other });
  return groups.filter((group) => group.names.length > 0);
};

const formData = (snapshot: FormSnapshot | null): Record<string, any> => {
  if (!snapshot) return {};
  const { fields, helpers, options, ...rest } = snapshot as any;
  return rest;
};

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, title, right, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <div className={style.section}>
      <div className={style.sectionHeading} onClick={toggle}>
        <span className={style.sectionLabel}>
          {icon}
          {title}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {right}
          <span className={style.chevron} data-collapsed={collapsed}>
            <ChevronDown size={13} />
          </span>
        </span>
      </div>
      {!collapsed && <div className={style.content}>{children}</div>}
    </div>
  );
};

const Empty = () => (
  <div className={style.empty}>
    No forms connected yet.
    <div className={style.hint}>
      Make sure the page imports <code>mobx-formkit/devtools</code> to install the hook.
    </div>
  </div>
);

const Panel: React.FC<{ bridge: PanelBridge }> = observer(({ bridge }) => {
  const selectedKey = store.selectedKey;
  const snapshot = store.selectedSnapshot;
  const [helper, setHelper] = useState('error');
  const [optionQuery, setOptionQuery] = useState('');
  const optionNames = snapshot?.options ? Object.keys(snapshot.options) : [];

  const query = optionQuery.trim().toLowerCase();
  const filteredOptions = query
    ? optionNames.filter((name) => name.toLowerCase().includes(query))
    : optionNames;
  const optionGroups = groupOptions(filteredOptions);

  useEffect(() => {
    const unsubscribe = bridge.onEvent((event) => store.applyEvent(event));

    // Keep re-attempting the handshake until the page hook reports connected,
    // covering the race where the content script's port is not ready yet.
    const attempt = () => {
      bridge.send('connect');
      bridge.send('request-snapshot');
    };
    attempt();
    const timer = setInterval(() => {
      if (!store.connected) attempt();
    }, 1000);

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [bridge]);

  const run = (type: 'form:submit' | 'form:clear' | 'form:reset' | 'form:validate') => {
    if (!selectedKey) return;
    bridge.send(type, { key: selectedKey });
  };

  return (
    <div className={style.root}>
      <div className={style.header}>
        <div className={style.brand}>
          <span>MOBX FORMKIT</span>
          <span>DEVTOOLS</span>
        </div>
        <div className={style.status}>
          <span className={style.dot} data-on={store.connected} />
          {store.connected ? 'connected' : 'disconnected'}
        </div>
      </div>

      <div className={style.body}>
        {store.list.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div className={style.toolbar}>
              <select
                className={style.select}
                value={selectedKey ?? ''}
                onChange={(e) => store.select(e.target.value || null)}
              >
                {store.list.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.name}
                  </option>
                ))}
              </select>

              <div className={style.controls}>
                <button
                  type="button"
                  className={style.button}
                  onClick={() => run('form:submit')}
                  disabled={!selectedKey}
                  title="Submit form"
                >
                  <CircleDot size={13} /> Submit
                </button>
                <button
                  type="button"
                  className={style.button}
                  onClick={() => run('form:validate')}
                  disabled={!selectedKey}
                  title="Validate form"
                >
                  <CheckCircle size={13} /> Validate
                </button>
                <button
                  type="button"
                  className={style.button}
                  onClick={() => run('form:reset')}
                  disabled={!selectedKey}
                  title="Reset form"
                >
                  <RotateCw size={13} /> Reset
                </button>
                <button
                  type="button"
                  className={style.button}
                  onClick={() => run('form:clear')}
                  disabled={!selectedKey}
                  title="Clear form"
                >
                  <Eraser size={13} /> Clear
                </button>
              </div>
            </div>

            <Section icon={<LayoutGrid size={13} />} title="Form">
              {snapshot ? (
                <JSONTree
                  hideRoot
                  data={formData(snapshot)}
                  theme={theme}
                  invertTheme={false}
                />
              ) : (
                <div className={style.hint}>Waiting for snapshot…</div>
              )}
            </Section>

            <Section
              icon={<Settings size={13} />}
              title={`Options (${optionNames.length})`}
            >
              {optionNames.length === 0 ? (
                <div className={style.hint}>No boolean options.</div>
              ) : (
                <>
                  <input
                    className={style.optionSearch}
                    placeholder="Search options…"
                    value={optionQuery}
                    onChange={(e) => setOptionQuery(e.target.value)}
                  />
                  {optionGroups.length === 0 ? (
                    <div className={style.hint}>No matches.</div>
                  ) : (
                    optionGroups.map((group) => (
                      <div key={group.label} className={style.optionGroup}>
                        <div className={style.optionGroupTitle}>
                          {group.label}
                        </div>
                        <div className={style.optionsList}>
                          {group.names.map((name) => (
                            <label key={name} className={style.optionLabel}>
                              <input
                                type="checkbox"
                                className={style.optionInput}
                                checked={!!snapshot?.options?.[name]}
                                onChange={(e) =>
                                  selectedKey &&
                                  bridge.send('form:option', {
                                    key: selectedKey,
                                    option: name,
                                    value: e.target.checked,
                                  })
                                }
                              />
                              {name}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </Section>

            <Section icon={<List size={13} />} title="Values">
              {snapshot ? (
                <JSONTree
                  hideRoot
                  data={toValues(snapshot.fields)}
                  theme={theme}
                  invertTheme={false}
                />
              ) : (
                <div className={style.hint}>Waiting for snapshot…</div>
              )}
            </Section>

            <Section icon={<Menu size={13} />} title="Fields">
              {snapshot ? (
                <JSONTree
                  hideRoot
                  data={snapshot.fields}
                  theme={theme}
                  invertTheme={false}
                />
              ) : (
                <div className={style.hint}>Waiting for snapshot…</div>
              )}
            </Section>

            <Section
              icon={<Wrench size={13} />}
              title="Helpers"
              right={
                <select
                  value={helper}
                  onChange={(e) => setHelper(e.target.value)}
                  className={style.select}
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 'none', minWidth: 'auto' }}
                >
                  {HELPERS.map((h) => (
                    <option key={h.prop} value={h.prop}>
                      {h.label}
                    </option>
                  ))}
                </select>
              }
            >
              {snapshot ? (
                <JSONTree
                  hideRoot
                  data={snapshot.helpers?.[helper] ?? {}}
                  theme={theme}
                  invertTheme={false}
                />
              ) : (
                <div className={style.hint}>Waiting for snapshot…</div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
});

export const renderPanel = (tabId: number): void => {
  const root = document.getElementById('root');
  if (!root) return;
  const bridge = createBridge(tabId);
  render(<Panel bridge={bridge} />, root);
};
