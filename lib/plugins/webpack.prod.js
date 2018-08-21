`use strict`

const webpack = require("webpack");
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const compression = require('compression');
const path = require("path");
const ora = require("ora");
const fs = require("fs");
const fse = require("fs-extra");
const chalk = require("chalk");
const now = require("performance-now");
const prettyMs = require("pretty-ms");
const merge = require("webpack-merge");

module.exports = {
	apply(){
		cogear.on('webpack',({mode})=>{
			if(mode == 'production'){
				this.webpackProd();
			}
		})
		cogear.on('build.done',()=>{
			switch(cogear.mode){
				case 'production':
					cogear.server || this.runServer()
				break;
				case 'build':
					let loader = ora().start()
					loader.succeed("Ready for deploy.")
				break;
			}
		})
	},
	/** 
	 * Webpack production mode 
	 */
	async webpackProd(){
		cogear.webpackConfig = require(path.join(cogear.baseDir,"webpack.prod.js"))
		await cogear.emit('webpack.config',cogear.webpackConfig)
		await cogear.emit('preload',cogear.webpackConfig)
		cogear.compiler = webpack(cogear.webpackConfig);
		cogear.webpackLoader = ora(`Webpack is working (${chalk.bold('production')})…`).start();
		// cogear.compiler.hooks.beforeRun.tap('Show loader',()=>{
		// })
		cogear.compiler.hooks.afterEmit.tap('Build pages',(compilation)=>{
			cogear.emit('webpack.afterEmit',compilation)
		})
		cogear.compiler.hooks.done.tap('Webpack done',(stats)=>{
			cogear.webpackLoader.succeed(`Webpack processing is done! (${prettyMs(stats.endTime - stats.startTime)})`)
			cogear.emit('webpack.done',stats.compilation)
		})
		cogear.compiler.run((err, stats) => {
			if (err) {
				cogear.webpackLoader.fail(err);
			}
			if(cogear.options.verbose){
				console.log(stats.toString({colors: true }))
			}
		})
	},
	runServer(){
		let loader = ora("Starting server...").start()
		cogear.server = express()
		cogear.server.use(express.static(cogear.options.output))
		cogear.server.use(compression())
		cogear.server.use("/",expressStaticGzip(cogear.options.output))
		cogear.emit('server.init',cogear.server)
		cogear.server.listen(cogear.options.port, (err) => {
			if(err){
				loader.fail(err)
				process.exit()
			}
			loader.succeed(`Your site is running at ${chalk.bold.whiteBright('http://'+cogear.config.host+':'+cogear.config.port)} (${chalk.bold("production mode")})`);
			console.log("Press Ctrl+C to exit…");
			cogear.emit('server.listen',cogear.server)
		})
	}
}