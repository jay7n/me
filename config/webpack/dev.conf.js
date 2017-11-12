var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var Conf = require('../conf')
var baseWebpackConfig = require('./base.conf')

var devWebpackConfig = merge(baseWebpackConfig, {
    output: {
        publicPath: `http://${Conf.Dev.Host}:${Conf.Dev.Port}/`,
    } ,
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: Conf.Dev.HtmlTitle,
            template: path.resolve(Conf.RootPath, 'source', 'app.html'),
            filename: 'app.html',
            inject: true,
            chunksSortMode: 'dependency'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),

        new webpack.DefinePlugin({
            BUILD: {
                MODE: JSON.stringify('develop'),
                DEBUG: true,
            }
        }),
    ]
})

module.exports = devWebpackConfig
