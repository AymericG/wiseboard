const webpack = require('webpack'),
         path = require('path'),
      helpers = require('./helpers');

const plugins = {
    // https://github.com/webpack-contrib/mini-css-extract-plugin
    MiniCssExtractPlugin: require('mini-css-extract-plugin'),
    // https://github.com/dividab/tsconfig-paths-webpack-plugin
    TsconfigPathsPlugin: require('tsconfig-paths-webpack-plugin')
};

module.exports = {
    /**
     * Options affecting the resolving of modules.
     *
     * See: https://webpack.js.org/configuration/resolve/
     */
    resolve: {
        /**
         * An array of extensions that should be used to resolve modules.
         *
         * See: https://webpack.js.org/configuration/resolve/#resolve-extensions
         */
        extensions: ['.js', '.ts', '.tsx', '.css', '.scss'],
        modules: [
            helpers.root('src'),
            helpers.root('src', 'style'),
            helpers.root('node_modules')
        ],

        plugins: [
            new plugins.TsconfigPathsPlugin()
        ]
    },

    /**
     * Options affecting the normal modules.
     *
     * See: https://webpack.js.org/configuration/module/
     */
    module: {
        /**
         * An array of Rules which are matched to requests when modules are created.
         *
         * See: https://webpack.js.org/configuration/module/#module-rules
         */
        rules: [{
			test: /\.ts[x]?$/,
			use: [{
				loader: 'awesome-typescript-loader', options: { useCache: true, useBabel: true }
			}],
		}, {
			test: /\.(woff|woff2|ttf|eot)(\?.*$|$)/,
			use: [{
				loader: 'file-loader?name=assets/[name].[hash].[ext]'
			}]
		}, {
			test: /\.(png|jpe?g|gif|svg|ico)(\?.*$|$)/,
			use: [{
				loader: 'file-loader?name=assets/[name].[hash].[ext]'
			}]
		}, {
			test: /\.html$/,
			use: [{
				loader: 'raw-loader' 
			}]
		}, {
			test: /\.css$/,
			use: [
				plugins.MiniCssExtractPlugin.loader,
			{
				loader: 'css-loader'
			}]
		}, {
			test: /\.scss$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: 'css-loader'
			}, {
				loader: 'sass-loader?sourceMap', options: { includePaths: [helpers.root('src', 'style')] }
			}]
		}]
    },

    plugins: [
        /**
         * Puts each bundle into a file and appends the hash of the file to the path.
         * 
         * See: https://github.com/webpack-contrib/mini-css-extract-plugin
         */
        new plugins.MiniCssExtractPlugin('[name].css'),

        new webpack.LoaderOptionsPlugin({
            options: {
                htmlLoader: {
                    /**
                     * Define the root for images, so that we can use absolute urls.
                     * 
                     * See: https://github.com/webpack/html-loader#Advanced_Options
                     */
                    root: helpers.root('src', 'images')
                },
                context: '/'
            }
        })
    ]
};