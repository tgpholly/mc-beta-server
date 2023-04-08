const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	target: 'node',
	externals: [ nodeExternals() ],
	entry: './build/index.js',
	output: {
		path: path.join(__dirname, 'bundle'),
		filename: 'MCBS.js',
	},
	optimization: {
		minimize: true,
	},
};