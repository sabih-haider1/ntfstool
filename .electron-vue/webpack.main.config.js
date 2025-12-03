'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

let mainConfig = {
  entry: {
    main: path.join(__dirname, '../src/main/index.js')
  },
  externals: [
    // Externalize all node_modules except renderer-specific ones
    function({ context, request }, callback) {
      // Don't bundle element-ui, element-plus, vue, vue-router, vuex, vue-i18n
      // These are renderer-only libraries - return false to prevent them from being resolved
      if (/^(element-ui|element-plus|vue|vue-router|vuex|vue-i18n)/.test(request)) {
        // Return commonjs to externalize but it will fail at runtime
        // Better to use resolve.alias to provide empty module
        return callback(null, 'commonjs ' + request);
      }
      
      // Externalize all other dependencies
      if (dependencies && Object.keys(dependencies).includes(request)) {
        return callback(null, 'commonjs ' + request);
      }
      
      callback();
    }
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src'),
      // Provide empty module for renderer-only libraries that might be accidentally imported
      'element-ui': path.join(__dirname, 'empty-module.js'),
      'element-plus': path.join(__dirname, 'empty-module.js'),
      'vue$': path.join(__dirname, 'empty-module.js'),
      'vue-router$': path.join(__dirname, 'empty-module.js'),
      'vuex': path.join(__dirname, 'empty-module.js'),
      'vue-i18n': path.join(__dirname, 'empty-module.js')
    },
    extensions: ['.js', '.json', '.node']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [],
  target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.mode = 'production'
  mainConfig.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: false
          }
        }
      })
    ]
  }
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
} else {
  mainConfig.mode = 'development'
}

module.exports = mainConfig
