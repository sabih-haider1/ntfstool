'use strict'

const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const { say } = require('cfonts')
const { spawn } = require('child_process')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')

let electronProcess = null
let manualRestart = false
let hotMiddleware

function logStats (proc, data) {
  let log = ''

  log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
  log += '\n\n'

  if (typeof data === 'object') {
    data.toString({
      colors: true,
      chunks: false
    }).split(/\r?\n/).forEach(line => {
      log += '  ' + line + '\n'
    })
  } else {
    log += `  ${data}\n`
  }

  log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

  console.log(log)
}

function startRenderer () {
  return new Promise((resolve, reject) => {
    rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer)

    const compiler = webpack(rendererConfig)
    hotMiddleware = webpackHotMiddleware(compiler, { 
      log: false, 
      heartbeat: 2500 
    })

    // Webpack 5 compatible hooks API
    if (compiler.hooks && compiler.hooks.compilation) {
      compiler.hooks.compilation.tap('DevRunner', compilation => {
        const HtmlWebpackPlugin = require('html-webpack-plugin')
        const hooks = HtmlWebpackPlugin.getHooks(compilation)
        
        if (hooks && hooks.afterEmit) {
          hooks.afterEmit.tapAsync('DevRunner', (data, cb) => {
            hotMiddleware.publish({ action: 'reload' })
            cb()
          })
        }
      })
    } else if (typeof compiler.plugin === 'function') {
      // Fallback for Webpack 4
      compiler.plugin('compilation', compilation => {
        compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
          hotMiddleware.publish({ action: 'reload' })
          cb()
        })
      })
    }

    if (compiler.hooks && compiler.hooks.done) {
      compiler.hooks.done.tap('DevRunner', stats => {
        logStats('Renderer', stats)
      })
    } else if (typeof compiler.plugin === 'function') {
      compiler.plugin('done', stats => {
        logStats('Renderer', stats)
      })
    }

    const server = new WebpackDevServer(
      {
        static: {
          directory: path.join(__dirname, '../')
        },
        setupMiddlewares: (middlewares, devServer) => {
          // Add hot middleware at the beginning
          devServer.app.use(hotMiddleware)
          return middlewares
        },
        hot: true,
        compress: true,
        port: 9080,
        host: 'localhost',
        // Fix for Electron: allow all hosts to prevent WebSocket disconnections
        allowedHosts: 'all',
        // Use 'ws' for better compatibility with Electron
        webSocketServer: {
          type: 'ws',
          options: {
            // Allow multiple connections from same client (multiple Electron windows)
            perMessageDeflate: false,
            clientTracking: true
          }
        },
        client: {
          logging: 'info',
          overlay: {
            errors: true,
            warnings: false
          },
          // Enable reconnection with reasonable retry limit
          reconnect: 5,
          // Ensure WebSocket connects to the correct URL in Electron
          webSocketURL: {
            hostname: 'localhost',
            pathname: '/ws',
            port: 9080,
            protocol: 'ws'
          }
        }
      },
      compiler
    )

    // Wait for compilation to finish before resolving
    compiler.hooks.done.tap('DevRunnerReady', () => {
      resolve()
    })

    server.start().catch(err => {
      console.error('Failed to start dev server:', err)
      reject(err)
    })
  })
}

function startMain () {
  return new Promise((resolve, reject) => {
    mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main)

    const compiler = webpack(mainConfig)

    // Webpack 5 compatible hooks API
    if (compiler.hooks && compiler.hooks.watchRun) {
      compiler.hooks.watchRun.tapAsync('DevRunner', (compilation, done) => {
        logStats('Main', chalk.white.bold('compiling...'))
        hotMiddleware.publish({ action: 'compiling' })
        done()
      })
    } else if (typeof compiler.plugin === 'function') {
      // Fallback for Webpack 4
      compiler.plugin('watch-run', (compilation, done) => {
        logStats('Main', chalk.white.bold('compiling...'))
        hotMiddleware.publish({ action: 'compiling' })
        done()
      })
    }

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err)
        return
      }

      logStats('Main', stats)

      if (electronProcess && electronProcess.kill) {
        manualRestart = true
        process.kill(electronProcess.pid)
        electronProcess = null
        startElectron()

        setTimeout(() => {
          manualRestart = false
        }, 5000)
      }

      resolve()
    })
  })
}

function startElectron () {
  // electronProcess = spawn(electron, ['--inspect=5858', path.join(__dirname, '../dist/electron/main.js')])
  electronProcess = spawn(electron, [path.join(__dirname, '../dist/electron/main.js')])

  electronProcess.stdout.on('data', data => {
    ntfstoolLog(data, 'blue')
  })
  electronProcess.stderr.on('data', data => {
    ntfstoolLog(data, 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

function ntfstoolLog (data, color) {
  let log = ''
  data = data.toString().split(/\r?\n/)
  data.forEach(line => {
    log += `  ${line}\n`
  })
  if (/[0-9A-z]+/.test(log)) {
    console.log(
      chalk[color].bold('┏ NtfstoolLog -------------------') +
      '\n\n' +
      log +
      chalk[color].bold('┗ ----------------------------') +
      '\n'
    )
  }
}

function greeting () {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 104) text = 'electron-vue'
  else if (cols > 76) text = 'electron-|vue'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold('\n  electron-vue'))
  console.log(chalk.blue('  getting ready...') + '\n')
}

function init () {
  greeting()

  Promise.all([startRenderer(), startMain()])
    .then(() => {
      startElectron()
    })
    .catch(err => {
      console.error(err)
    })
}

init()
