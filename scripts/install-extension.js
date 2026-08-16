#!/usr/bin/env node
/**
 * Launch a browser with the unpacked devtools extension loaded, straight from
 * the command line. This is a development convenience, NOT a store install:
 * - Chromium (Chrome / Edge): launches a dedicated --user-data-dir profile with
 *   --load-extension pointing at extension/dist/<target>.
 * - Firefox: uses `web-ext run` (official Mozilla tool) to install the add-on
 *   temporarily.
 *
 * Usage:
 *   node scripts/install-extension.js <chrome|firefox|edge> [options]
 *
 * Options:
 *   --url <url>      Page to open (default: http://localhost:5173/)
 *   --no-url         Do not open any page
 *   --no-build       Skip `npm run build:ext` (assumes dist/ is already built)
 *   --help, -h       Show this help
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const DEMO_URL = 'http://localhost:5173/';

const BINARIES = {
  chrome: {
    label: 'Google Chrome',
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
    linux: ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'],
    win32: [
      `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
      `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    ],
  },
  edge: {
    label: 'Microsoft Edge',
    darwin: ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
    linux: ['microsoft-edge', 'microsoft-edge-stable'],
    win32: [
      `${process.env.PROGRAMFILES}\\Microsoft\\Edge\\Application\\msedge.exe`,
      `${process.env['PROGRAMFILES(X86)']}\\Microsoft\\Edge\\Application\\msedge.exe`,
    ],
  },
};

const help = () => {
  console.log(`
Usage: node scripts/install-extension.js <chrome|firefox|edge> [options]

Options:
  --url <url>   Page to open (default: ${DEMO_URL})
  --no-url      Do not open any page
  --no-build    Skip \`npm run build:ext\`
  --help, -h    Show this help
`);
};

const parseArgs = (argv) => {
  const args = { target: null, url: DEMO_URL, build: true };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg.startsWith('--url=')) args.url = arg.slice('--url='.length);
    else if (arg === '--no-url') args.url = null;
    else if (arg === '--no-build') args.build = false;
    else if (arg.startsWith('--')) {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    } else args.target = arg;
  }
  return args;
};

const findBinary = (candidates) => {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.includes('/') || candidate.includes('\\')) {
      if (fs.existsSync(candidate)) return candidate;
    } else {
      const which = spawnSync('which', [candidate]);
      if (which.status === 0 && which.stdout) return which.stdout.toString().trim();
    }
  }
  return null;
};

const build = () => {
  console.log('▶ Building extension (npm run build:ext)…');
  const result = spawnSync('npm', ['run', 'build:ext'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error('✗ build:ext failed');
    process.exit(result.status || 1);
  }
};

const launchChromium = (target) => {
  const meta = BINARIES[target];
  const binary = findBinary(meta[process.platform] || []);
  if (!binary) {
    console.error(`✗ ${meta.label} not found. Install it or set the binary path.`);
    process.exit(1);
  }

  const dist = path.join(root, 'extension', 'dist', target);
  if (!fs.existsSync(path.join(dist, 'manifest.json'))) {
    console.error(`✗ ${dist} does not contain a manifest.json — run npm run build:ext first.`);
    process.exit(1);
  }

  const profileDir = path.join(os.tmpdir(), `mobx-formkit-devtools-${target}-profile`);
  const flags = [
    `--user-data-dir=${profileDir}`,
    `--load-extension=${dist}`,
    '--no-first-run',
    '--no-default-browser-check',
  ];
  if (args.url) flags.push(args.url);

  console.log(`▶ Launching ${meta.label} with the unpacked extension…`);
  console.log(`   Extension: ${dist}`);
  console.log(`   Profile:   ${profileDir}`);
  if (args.url) console.log(`   URL:       ${args.url}`);

  spawn(binary, flags, { detached: true, stdio: 'ignore' }).unref();
  console.log('\nDone. Open DevTools (Cmd/Ctrl+Opt+Shift+I) → tab "MobX FormKit".');
};

const launchFirefox = () => {
  const dist = path.join(root, 'extension', 'dist', 'firefox');
  if (!fs.existsSync(path.join(dist, 'manifest.json'))) {
    console.error(`✗ ${dist} does not contain a manifest.json — run npm run build:ext first.`);
    process.exit(1);
  }

  console.log('▶ Launching Firefox via web-ext (temporary add-on)…');
  console.log(`   Extension: ${dist}`);

  const webExtArgs = ['--yes', 'web-ext', 'run', '--source-dir', dist];
  if (args.url) webExtArgs.push('--start-url', args.url);

  // Keep web-ext in the foreground (Ctrl+C stops it and closes Firefox).
  const child = spawn('npx', webExtArgs, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  child.on('exit', (code) => process.exit(code || 0));
};

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch {
  process.exit(2);
}

if (args.help) {
  help();
  process.exit(0);
}

if (!['chrome', 'firefox', 'edge'].includes(args.target)) {
  console.error('Please provide a target: chrome | firefox | edge');
  help();
  process.exit(2);
}

if (args.build) build();

if (args.target === 'firefox') launchFirefox();
else launchChromium(args.target);
