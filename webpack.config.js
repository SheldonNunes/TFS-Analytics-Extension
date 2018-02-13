const webpack = require('webpack');

module.exports = {
    entry: './src/main.ts',
    output: {
        path: __dirname + '/dist',
        filename: 'main.js'
    },
    externals: [
        /^TFS\//, // Ignore TFS/* since they are coming from VSTS host
        /^VSS\//  // Ignore VSS/* since they are coming from VSTS host
    ],
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
          'vue$': 'vue/dist/vue.esm.js'
        }
      },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        },       
        {
            test: /\.vue$/,
            loader: 'vue-loader'
          },
        {
            loader: 'ts-loader',
            test: /\.ts$/,
            options: {
              appendTsSuffixTo: [/\.vue$/]
            }
        }]
    }
};