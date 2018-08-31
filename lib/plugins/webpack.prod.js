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
const http = require("http");

module.exports = {
	apply(){
		cogear.on('webpack',async({mode})=>{
			if(mode == 'production'){
				await this.webpackProd();
			}
		})
		cogear.on('build.done',async ()=>{
			switch(cogear.mode){
				case 'production':
					if(cogear.server) return
					await this.runServer()
				break;
				case 'build':
					cogear.loader.succeed("Ready for deploy.")
				break;
			}
		})
		cogear.on('server.listen',()=>{
			cogear.loader.succeed(`Your site is running at ${chalk.bold.whiteBright('http://'+cogear.config.host+':'+cogear.http.address().port)} (${chalk.bold("production mode")})`);
			console.log("Press Ctrl+C to exit…");
		})
	},
	/** 
	 * Webpack production mode 
	 */
	async webpackProd(){
		cogear.webpackConfig = require(path.join(cogear.baseDir,"webpack.prod.js"))
		await cogear.emit('webpack.config',cogear.webpackConfig)
		await cogear.emit('preload')
		try {
			// debugger
			cogear.compiler = webpack(cogear.webpackConfig);
		} catch (e){
			cogear.loader.fail(chalk.red(e.stack))
			process.exit()
		}
		// cogear.webpackLoader = ora(`Webpack is working (${chalk.bold('production')})…`).start();
		// cogear.compiler.hooks.beforeRun.tap('Show loader',()=>{
		// })
		cogear.compiler.hooks.afterEmit.tap('Build pages',(compilation)=>{
			cogear.compilation = compilation;
			cogear.emit('webpack.afterEmit',compilation)
		})
		cogear.compiler.hooks.done.tap('Webpack done',(stats)=>{
			cogear.compilation = stats.compilation;
			// cogear.webpackLoader.succeed(`Webpack processing is done! (${prettyMs(stats.endTime - stats.startTime)})`)
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
	async runServer(){
		cogear.loader.start("Starting server...")
		cogear.server = express()
		cogear.server.use(express.static(cogear.options.output))
		cogear.server.use(compression())
		cogear.server.use("/",expressStaticGzip(cogear.options.output))
		await cogear.emit('server.init',cogear.server)
		cogear.server.on('error',(e)=>{
			cogear.loader.fail(e)
			// console.info(e.stack)
		})
		cogear.http = http.createServer(cogear.server).listen(cogear.config.port,cogear.config.host, async(err) => {
			if(err){
				cogear.loader.fail(err)
				process.exit()
			}
			await cogear.emit('server.listen',cogear.server)
		})
	}
}