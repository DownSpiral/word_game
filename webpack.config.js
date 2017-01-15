var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public/js');
var IMAGES = path.resolve(__dirname, 'public/images');
var APP_DIR = path.resolve(__dirname, 'private/react');

var config = {
  entry: APP_DIR + '/index.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel'
      }, {
        test: /\.scss$/,
        include: APP_DIR,
        loaders: ['style', 'css', 'sass']
      }, {
        test: /\.png$/,
        use: { loader: 'url-loader', options: { limit: 100000 } },
      }, {
        test: /\.(jpe?g|gif|png)$/,
        loader: 'file-loader?emitFile=false&name=[path][name].[ext]'
      },
    ]
  }
};

module.exports = config;
