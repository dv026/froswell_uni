import CopyPlugin from 'copy-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { I18nTypingsPlugin } from 'i18n-typings-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

import { BuildOptions } from './config';

export function buildPlugins({ paths, isDev, apiUrl, project }: BuildOptions): webpack.WebpackPluginInstance[] {
    const isProd = !isDev;

    const plugins = [
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true
                },
                mode: 'write-references'
            }
        }),
        new I18nTypingsPlugin({
            sourceDir: './public/locales/en',
            outDir: './src/common/helpers/i18n/dictionary'
        }),
        new HtmlWebpackPlugin({
            template: paths.html,
            favicon: './public/favicon.ico'
        }),

        new webpack.DefinePlugin({
            __IS_DEV__: JSON.stringify(isDev),
            __API__: JSON.stringify(apiUrl),
            __PROJECT__: JSON.stringify(project)
        }),
        new webpack.ProgressPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: './public/images', to: 'images' },
                { from: paths.opts, to: paths.build }
            ]
        })
        // new CircularDependencyPlugin({
        //     exclude: /node_modules/,
        //     failOnError: false
        // })
        // plugins.push(
        //     new BundleAnalyzerPlugin({
        //         openAnalyzer: false
        //     })
        // );
    ];

    if (isDev) {
        //plugins.push(new ReactRefreshWebpackPlugin({ overlay: false }));
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    if (isProd) {
        plugins.push(
            new MiniCssExtractPlugin({
                ignoreOrder: true, // todo
                filename: 'css/[name].[contenthash:8].css',
                chunkFilename: 'css/[name].[contenthash:8].css'
            })
        );
        plugins.push(
            new CopyPlugin({
                patterns: [
                    { from: paths.locales, to: paths.buildLocales },
                    { from: paths.assets, to: paths.buildAssets }
                ]
            })
        );
    }

    return plugins;
}
