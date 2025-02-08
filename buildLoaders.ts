import path from 'path';
import webpack from 'webpack';

import { buildCssLoaders } from './buildCssLoaders';
import { BuildOptions } from './config';

export function buildLoaders({ isDev }: BuildOptions): webpack.RuleSetRule[] {
    const svgLoader = {
        test: /\.svg$/,
        use: ['@svgr/webpack']
    };

    const fileLoader = {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        loader: 'file-loader',
        options: {
            context: path.join(__dirname, '..', 'styles', 'common'),
            name: '[path][name].[ext]'
        }
    };

    const urlLoader = {
        test: /\.(ico)$/,
        loader: 'url-loader'
    };

    const babelLoader = {
        test: /\.(js|jsx|tsx)$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }
    };

    const typescriptLoader = {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
    };

    const cssLoader = buildCssLoaders(isDev);

    return [babelLoader, fileLoader, urlLoader, typescriptLoader, cssLoader];
}
