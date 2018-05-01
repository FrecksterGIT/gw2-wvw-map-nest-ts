const path = require('path');

require.extensions = false;

module.exports = {
  devtool: process.env.NODE_ENV === 'development' ? 'eval' : false,
  entry: './src/public/javascripts/app.js',
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },
  node: {
    fs: 'empty'
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist/public/javascripts')
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules')
    ]
  },
  stats: {
    warnings: false
  },
  watch: process.env.NODE_ENV === 'development'
};
