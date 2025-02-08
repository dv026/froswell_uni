import path from 'path';

import { buildDevServer } from './buildDevServer';
import { buildPlugins } from './buildPlugins';
import { buildLoaders } from './buildLoaders';
import { buildResolvers } from './buildResolvers';

export function buildWebpackConfig(options: BuildOptions) {
    const { mode, paths, isDev } = options;

    return {
        mode,
        entry: paths.entry,
        output: {
            filename: '[name].[contenthash].js',
            path: paths.build,
            clean: true,
            publicPath: '/'
        },
        plugins: buildPlugins(options),
        module: {
            rules: buildLoaders(options)
        },
        resolve: buildResolvers(options),
        devtool: isDev ? 'eval-cheap-module-source-map' : undefined,
        devServer: isDev ? buildDevServer(options) : undefined
    };
}


function getApiUrl(mode: BuildType, apiUrl?: string) {
    if (apiUrl) {
        return apiUrl;
    }

    if (mode === 'production') {
        return '/api';
    }

    return 'http://localhost:9002';
}

export default (env: BuildEnv) => {
    const htmlPath = path.resolve(__dirname, 'public', env.metrik ? 'index_release.html' : 'index.html');

    const paths: BuildPaths = {
        entry: path.resolve(__dirname, 'src', 'index.tsx'),
        build: path.resolve(__dirname, 'dist'),
        html: htmlPath,
        src: path.resolve(__dirname, 'src'),
        locales: path.resolve(__dirname, 'public', 'locales'),
        opts: path.resolve(__dirname, 'public', 'opts.js'),
        buildLocales: path.resolve(__dirname, 'dist', 'locales'),
        assets: path.resolve(__dirname, 'public', 'upload'),
        buildAssets: path.resolve(__dirname, 'dist', 'public', 'upload')
    };

    const mode = env?.mode || 'development';
    const port = env?.port || 9001;
    const apiUrl = getApiUrl(env.mode, env?.apiUrl);

    const isDev = mode === 'development';

    return buildWebpackConfig({
        mode,
        paths,
        isDev,
        port,
        apiUrl,
        project: 'frontend'
    });
};

export type BuildType = 'production' | 'development';

export interface BuildPaths {
    entry: string;
    build: string;
    html: string;
    src: string;
    locales: string;
    opts: string;
    buildLocales: string;
    assets: string;
    buildAssets: string;
}

export interface BuildOptions {
    mode: BuildType;
    paths: BuildPaths;
    isDev: boolean;
    port: number;
    apiUrl: string;
    project: 'frontend' | 'storybook' | 'jest';
}

export interface BuildEnv {
    mode: BuildType;
    port: number;
    apiUrl: string;
    metrik: string;
}
