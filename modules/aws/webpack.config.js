const path = require('path');

exports.default = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist', 'lambda'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'inline-source-map',
};
