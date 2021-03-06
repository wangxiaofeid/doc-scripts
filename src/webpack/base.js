const fs = require('fs-extra')
const path = require('path')
const log = require('../log')
const webpack = require('webpack')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ProgressBarPlugin = require('./bar')
const babelConfig = require('./babel')
const cwd = process.cwd()
const pkg = require(path.resolve(cwd, './package.json'))

const entryPath = path.resolve(__dirname, './doc-scripts-entry.js')
const iframePath = path.resolve(__dirname, './doc-scripts-iframe.js')

const getPkgPath = () => {
  try {
    const defaultPath = path.resolve(cwd, './src/index.js')
    const stat = fs.statSync(defaultPath)
    return defaultPath
  } catch (e) {
    return path.resolve(cwd, pkg.main || './index.js')
  }
}

module.exports = options => ({
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    index:[entryPath],
    iframe:[iframePath]
  },
  output: {
    path: options.output ? options.output : path.resolve(cwd, './doc-site'),
    filename: 'statics/bundle.[name].[hash].js'
  },
  stats: 'errors-only',
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, '../../node_modules')],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'react-highlight$': 'react-highlight/lib/optimized',
      'styled-components': require.resolve('styled-components'),
      [pkg.name]: getPkgPath()
    }
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-is': 'ReactIs'
  },
  plugins: [
    new ProgressBarPlugin({
      clear: true
    }),
    new CaseSensitivePathsPlugin(),
    new webpack.ContextReplacementPlugin(
      /lib[/\\]languages$/,
      /javascript|htmlbars|typescript|scss|css|bash/
    )
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: babelConfig
      },
      {
        test: /\.tsx?$/,
        use: [
          require.resolve('ts-loader'),
          {
            loader: require.resolve('react-docgen-typescript-loader'),
            options: {
              propFilter: prop => {
                if (prop.parent == null) return true
                return !prop.parent.fileName.includes('node_modules')
              }
            }
          }
        ]
      },
      {
        test: new RegExp(`${entryPath}|${iframePath}`),
        loader: require.resolve('val-loader'),
        options: options
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: require.resolve('style-loader'),
            options: {
              singleton: true
            }
          },
          require.resolve('css-loader')
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: require.resolve('style-loader'),
            options: {
              singleton: true
            }
          },
          require.resolve('css-loader'),
          require.resolve('less-loader')
        ]
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          minetype: 'application/font-woff'
        }
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          minetype: 'application/font-woff'
        }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          minetype: 'application/octet-stream'
        }
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          minetype: 'application/vnd.ms-fontobject'
        }
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          minetype: 'image/svg+xml'
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000
        }
      },
      {
        test: /\.html?$/,
        loader: require.resolve('file-loader'),
        options: {
          name: '[name].[ext]'
        }
      },
      {
        enforce: 'pre',
        test: /\.md$/,
        use: require.resolve('react-demo-loader')
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: require.resolve('style-loader'),
            options: {
              singleton: true
            }
          },
          require.resolve('css-loader'),
          require.resolve('fast-sass-loader')
        ]
      }
    ]
  }
})
