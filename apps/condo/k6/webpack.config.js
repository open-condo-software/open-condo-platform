const path = require('path')

module.exports = {
    mode: 'production',
    entry: {
        'registerMetersReadings.test': path.join(__dirname, 'src/registerMetersReadings.test.ts'),
        'syncTourStep.test': path.join(__dirname, 'src/syncTourStep.test.ts'),
        'ticket.test': path.join(__dirname, 'src/ticket.test.ts'),
        'news.test': path.join(__dirname, 'src/news.test.ts'),
        'payment.test': path.join(__dirname, 'src/payment.test.ts'),
        'registerBillingReceiptFile.test': path.join(__dirname, 'src/registerBillingReceiptFile.test.ts'),
        'registerBillingReceipt.test': path.join(__dirname, 'src/registerBillingReceipt.test.ts'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'commonjs',
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [ '@babel/preset-typescript'],
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    target: 'web',
    externals: /^(k6|https?:\/\/)(\/.*)?/,
    devtool: 'source-map',
    stats: {
        colors: true,
    },
    optimization: {
        minimize: false,
    },
}