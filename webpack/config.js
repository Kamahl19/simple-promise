const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const commons = require('./common.js');

module.exports = {
    title: 'Simpor Promise',
    baseUrl: '/',
    host: 'localhost',
    port: 3000,
    devtool: 'cheap-module-eval-source-map',
    debug: true,

    entry: {
        main: [
            'babel-polyfill',
            './src/main',
            'webpack-hot-middleware/client',
        ]
    },

    output: {
        path: commons.root('dist/app'),
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js',
        publicPath: '/'
    },

    resolve: {
        extensions: [
            '',
            '.js',
            '.html',
        ],
    },

    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ],
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                include: commons.root('src')
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            inject: 'body',
            hash: true,
            minify: false
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
    ]
};
