const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { targets, makeConfig } = require('../webpack.ext.config');

const root = path.resolve(__dirname, '..');

const build = (target) =>
  new Promise((resolve, reject) => {
    webpack(makeConfig(target), (err, stats) => {
      if (err) return reject(err);
      if (stats.hasErrors()) {
        return reject(new Error(stats.toString({ colors: false, all: false, errors: true })));
      }
      const summary = stats.toString({
        colors: false,
        chunks: false,
        modules: false,
        assets: true,
      });
      console.log(`[${target}] ${summary}`);
      const manifest = path.join(root, 'extension', 'targets', target, 'manifest.json');
      const page = path.join(root, 'extension', 'devtools_page.html');
      const dist = path.join(root, 'extension', 'dist', target);
      fs.copyFileSync(manifest, path.join(dist, 'manifest.json'));
      fs.copyFileSync(page, path.join(dist, 'devtools_page.html'));
      resolve();
    });
  });

const run = async () => {
  for (const target of targets) {
    await build(target);
  }
  console.log('build:ext done — extension/dist/<target>/');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});