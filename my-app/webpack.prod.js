const path = require('path');
const TerserPlugin=require('terser-webpack-plugin');

module.exports = {

  entry: {
    main:'./index.js'
  },
  output: {
    path: path.join(__dirname, 'prod-build-optimization'),
    publicPath:'/',
    filename:'[name].js',
    clean:true
  },
  mode:'production',
  target:'node',
  optimization:{
    minimize:true,
    minimizer:[new TerserPlugin({
      terserOptions:{
        compress:{
        drop_console:true
        }
      }
    })]
  },
  module: {
    rules: [
      // Add loaders for different file types (e.g., JavaScript, CSS, etc.)
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.html$/,
      
        use: 'html-loader',
      },
      {
        test: /\.cs$/,

        use: 'null-loader', // or another loader appropriate for your use case
      },
      // Add more rules for other file types as needed
    ],
  },
  // Add plugins if required (e.g., HtmlWebpackPlugin, etc.)
  // plugins: [new HtmlWebpackPlugin()],
};
