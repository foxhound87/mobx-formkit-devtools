const path = require('path');

const targets = ['chrome', 'firefox', 'edge'];

const makeConfig = (target) => ({
  mode: 'production',
  devtool: false,
  entry: {
    'content-main': './src/extension/content.ts',
    'content-isolated': './src/extension/content-isolated.ts',
    background: './src/extension/background.ts',
    devtools: './src/extension/devtools.ts',
  },
  output: {
    path: path.join(__dirname, 'extension', 'dist', target),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
      },
    ],
  },
});

module.exports = { targets, makeConfig };