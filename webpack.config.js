const path = require('path');

require.extensions = false;

module.exports = {
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
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
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'raw-loader'
          }
        ]
      }
    ]
  },
  output: {
    filename: 'app.js',
    library: 'gw2map',
    libraryTarget: 'umd2',
    path: path.resolve(__dirname, 'dist/public/javascripts')
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules')
    ],
    fallback: {
      fs: false,
    }
  },
  stats: {
    warnings: false
  },
  watch: process.env.NODE_ENV === 'development'
};
