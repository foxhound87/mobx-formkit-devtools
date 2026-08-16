import { renderPanel } from './panel';

declare const chrome: any;

const boot = () => {
  if (!document.getElementById('root')) return;
  const tabId = chrome?.devtools?.inspectedWindow?.tabId ?? 0;
  renderPanel(tabId);
  chrome?.devtools?.panels?.create?.('MobX FormKit', '', 'devtools_page.html', () => {});
};

if (chrome?.devtools) boot();
