const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve(dir) {
  return path.join(__dirname, dir);
}

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBUSY') filelist = [...filelist, dirFile];
      else throw err;
    }
  });
  return filelist;
}

function getEntries() {
  return walkSync('./services')
    .filter((file) => file.match(/.*\.service\.ts$/))
    .map((file) => {
      return {
        name: file.substring(0, file.length - 3),
        path: `./${file}`
      };
    })
    .reduce((memo, file) => {
      let outputFileName = file.name.replace('src/', '');
      // const segments = outputFileName.split('/');
      // outputFileName = `${segments[0]}/${segments[1]}.service`;
      memo[outputFileName] = file.path;
      return memo;
    }, {});
}

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

if (fs.existsSync('../../node_modules')) {
  console.log('Existed parent node_modules');
  fs.readdirSync('../../node_modules')
    .filter(function (x) {
      return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
      nodeModules[mod] = 'commonjs ' + mod;
    });
}

module.exports = {
  mode: 'production',
  target: 'node',
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: true,
    __dirname: true
  },
  externals: nodeModules,
  entry: {
    'moleculer.config': './moleculer.config.ts',
    ...getEntries()
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.graphql', '.gql'],
    alias: {
      utils: resolve('utils'),
      mixins: resolve('mixins'),
      services: resolve('services'),
      errors: resolve('errors'),
      tests: resolve('tests')
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: '[name]',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new CopyWebpackPlugin(
      [
        {
          from: 'package.json',
          to: 'package.json',
          toType: 'file'
        },
        {
          from: 'graphql',
          to: 'graphql'
        },
        {
          from: 'services/mail/templates',
          to: 'services/mail/templates'
        }
      ],
      {}
    )
  ]
};
