/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
    devServer: {
        static: {
            directory: path.join(__dirname, '/dist')
        },
        historyApiFallback: true,
        allowedHosts: 'all',
        port: 9001,
        client: {
            overlay: {
                errors: true,
                warnings: false
            }
        }
    },

    devtool: 'eval-cheap-module-source-map',

    mode: 'development'
};
