import path from 'path';

import { buildWebpackConfig } from './config/build/buildWebpackConfig';
import { BuildEnv, BuildType, BuildPaths } from './config/build/types/config';

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
