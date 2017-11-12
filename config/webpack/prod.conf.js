var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var Conf = require('../conf')
var baseWebpackConfig = require('./base.conf')

var prodWebpackConfig = merge(baseWebpackConfig, {
    output: {
        filename: 'js/[name].[chunkhash].js',
    },
    plugins: [
        new CleanWebpackPlugin([path.basename(Conf.DistPath)], {
            root: path.dirname(Conf.DistPath),
            verbose: true,
            dry: false,
        }),

        new webpack.DefinePlugin({
            BUILD: {
                MODE: JSON.stringify('production'),
                DEBUG: false,
            }
        }),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true
        }),

        new CopyWebpackPlugin([
            {
                from: path.resolve(Conf.RootPath, 'assets'),
                to: path.resolve(Conf.DistPath, 'assets'),
                ignore: ['.*']
            },
        ]),

        new HtmlWebpackPlugin({
            title: Conf.Prod.HtmlTitle,
            template: path.resolve(Conf.RootPath, 'source', 'app.html'),
            filename: 'app.html',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
    ]
})

module.exports = prodWebpackConfig
