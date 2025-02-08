/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const { I18nTypingsPlugin } = require('i18n-typings-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
/* eslint-enable @typescript-eslint/no-var-requires */

const loaderOpts = (loader, opts) => ({
    loader: loader,
    options: opts
});

const cssLoaderOpts = loaderOpts('css-loader', {
    importLoaders: 2,
    sourceMap: false,
    url: false
    // modules: {
    //     localIdentName: '[local]___[hash:base64:5]'
    // }
});
const postCssLoaderOpts = loaderOpts('postcss-loader');
const lessLoaderOpts = loaderOpts('less-loader', { lessOptions: { sourceMap: false, javascriptEnabled: true } });
const styleLoaderOpts = loaderOpts('style-loader');

// const stylesRule = [styleLoaderOpts, cssLoaderOpts, postCssLoaderOpts, lessLoaderOpts];
const stylesRule = [MiniCssExtractPlugin.loader, cssLoaderOpts, postCssLoaderOpts, lessLoaderOpts];

const localStylesRule = [
    styleLoaderOpts,
    {
        loader: 'css-loader',
        options: {
            importLoaders: 2,
            sourceMap: false,
            url: false,
            modules: {
                localIdentName: '[local]___[contenthash:base64:5]'
            }
        }
    },
    postCssLoaderOpts,
    lessLoaderOpts
];

module.exports = {
    mode: 'production',

    entry: {
        scripts: './src/index.tsx',
        styles: './styles/index.js'
    },

    module: {
        rules: [
            {
                test: /\.ts(x)?$/,
                exclude: [/node_modules/, /local_modules/],
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            },
            {
                test: /\.less$/,
                use: stylesRule,
                include: [path.resolve(__dirname, '../styles')],
                exclude: [path.resolve(__dirname, '../styles/shared')]
            },
            {
                test: /\.less$/,
                use: localStylesRule,
                include: [path.resolve(__dirname, '../src'), path.resolve(__dirname, '../styles/shared')]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        context: path.join(__dirname + '/../styles/common'),
                        name: '[path][name].[ext]'
                    }
                }
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, '/../dist'),
        pathinfo: false,
        publicPath: '/'
    },

    plugins: [
        new ForkTsCheckerWebpackPlugin({
            eslint: {
                files: './src/**/*.{ts,tsx,js,jsx}'
            }
        }),
        new I18nTypingsPlugin({
            sourceDir: './assets/locales/en',
            outDir: './src/common/helpers/i18n/dictionary'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new webpack.ProvidePlugin({
            Set: 'core-js/es/set',
            Map: 'core-js/es/map',
            Promise: 'core-js/es/promise'
        }),
        new HtmlWebpackPlugin({
            hash: true,
            minify: true,
            template: './index_release.html',
            filename: 'index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: './favicon.ico' },
                { from: './styles/common/images', to: 'images' },
                { from: './assets/', to: 'assets' }
            ]
        }),
        new CaseSensitivePathsPlugin()
    ],

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        symlinks: false,
        cacheWithContext: false
    }
};
