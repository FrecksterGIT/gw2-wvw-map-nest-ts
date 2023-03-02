const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

require.extensions = false;

module.exports = {
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
    entry: './src/public/javascripts/app.js',
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'raw-loader'
                    }
                ]
            }
        ]
    },
    output: {
        filename: 'public/javascripts/app.js',
        library: 'gw2map',
        libraryTarget: 'umd2',
        path: path.resolve(__dirname, 'dist/'),
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules')
        ],
        fallback: {
            fs: false,
        }
    },
    stats: {
        warnings: false
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "src/views", to: './views'},
                {from: "src/public", to: './public'},
            ],
        }),
    ],
    watch: process.env.NODE_ENV === 'development'
};
