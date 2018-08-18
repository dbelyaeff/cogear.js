const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const chalk = require("chalk");
const HtmlWebpackPlugin = require("html-webpack-plugin");
	

module.exports = {
	apply(cogear){
		cogear.hooks.loadPagesForWebpack.tap('loadPagesForWebpack',()=>{
			this.load(cogear)
		})
	},
	load(cogear){
		// Add theme script to app.js entry point
		if(cogear.themeDir){
			let themeScript = path.join(cogear.themeDir,'theme.js')
			if(fs.existsSync(themeScript)){
				cogear.webpackConfig.entry.app.push(themeScript);
			}
		}
		// Iterate over pages and add them as HTML Webpack plugins
		Object.entries(cogear.pages).forEach(([file, page]) => {
			let scripts = [];				
			let config = { 
				title: cogear.config.site.title,
				filename: page.path, 
				template: page.buildPath, 
				templateParameters: page,
				// cache: false,
				chunks: ["app"],
				inject: page.inject || cogear.config.inject || 'head',
			};
			if(Array.isArray(page.js)){
				if(!page.keepJS) config.chunks = [] 
				for(let script of page.js){
					if(cogear.options.mode == 'development'){
						cogear.webpackConfig.entry[script] = [`webpack-dev-server/client?http://${cogear.options.host}:${cogear.options.port}`, "webpack/hot/dev-server",`${cogear.options.src}/${script}`];
					} else {
						cogear.webpackConfig.entry[script] = [`${cogear.options.src}/${script}`]
					}
					config.chunks.push(script)
				}
			}
			cogear.webpackConfig.plugins.push(new HtmlWebpackPlugin(config));
		}, cogear);
	}
}