const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const MINIFY = process.env.MINIFY === 'YES';

module.exports = {
  mode: MINIFY ? 'production' : 'development',
  devtool: 'source-map',
  entry: './src/index.ts',
  output: {
    path: path.join(__dirname, 'umd'),
    library: 'MobxFormkitDevTools',
    libraryTarget: 'umd',
    filename: MINIFY ? 'MobxFormkitDevTools.min.js' : 'MobxFormkitDevTools.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  externals: {
    'mobx-formkit': 'mobx-formkit',
    'mobx-react-form': 'mobx-react-form',
    'mobx-react': 'mobx-react',
    'react': 'react',
    'react-dom': 'react-dom',
    'mobx': 'mobx',
  },
  optimization: {
    minimize: MINIFY,
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};