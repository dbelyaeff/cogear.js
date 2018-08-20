const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const chalk = require("chalk");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const forEach = require('async-foreach').forEach;

module.exports = (webpackConfig) => {
		return new Promise((resolve,reject)=>{
			// Add theme script to app.js entry point
			if(cogear.themeDir){
				let themeScript = path.join(cogear.themeDir,'theme.js')
				if(fs.existsSync(themeScript) && ! webpackConfig.entry.app.includes(themeScript)){
					webpackConfig.entry.app.push(themeScript);
				}
			}
			// Iterate over pages and add them as HTML Webpack plugins
			forEach(Object.entries(cogear.pages),([file, page]) => {
				let scripts = [];				
				let config = { 
					title: cogear.config.title,
					filename: page.path, 
					template: page.buildPath, 
					templateParameters: page,
					// alwaysWriteToDisk: true,
					cache: true,
					chunks: ["app"],
					inject: page.inject || cogear.config.inject || 'head',
				};
				if(Array.isArray(page.js)){
					if(!page.keepJS) config.chunks = [] 
					for(let script of page.js){
						if(cogear.options.mode == 'development'){
							webpackConfig.entry[script] = [path.join(cogear.baseDir,'lib','hot.js'),`${cogear.options.src}/${script}`];
							// cogear.webpackConfig.entry[script] = [`webpack-dev-server/client?http://${cogear.options.host}:${cogear.options.port}`, "webpack/hot/dev-server",`${cogear.options.src}/${script}`];
						} else {
							webpackConfig.entry[script] = [`${cogear.options.src}/${script}`]
						}
						config.chunks.push(script)
					}
				}
				webpackConfig.plugins.push(new HtmlWebpackPlugin(config));
			}, () => {
				cogear.hooks.webpack.call(webpackConfig)
				resolve(webpackConfig)
			})
		})
}