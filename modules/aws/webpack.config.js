exports.default = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: __dirname,
    filename: './bundle.js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'inline-source-map',
};
