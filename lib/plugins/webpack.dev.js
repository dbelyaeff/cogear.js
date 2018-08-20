const webpack = require("webpack"),
	// webpackDevServer = require("webpack-dev-server"),
	express = require('express'),
	http = require('http'),
	reload = require('reload'),
	{ throttle, debounce } = require("throttle-debounce"),
	path = require("path"),
	ora = require("ora"),
	fs = require("fs"),
	fse = require("fs-extra"),
	chalk = require("chalk"),
	now = require("performance-now"),
	prettyMs = require("pretty-ms"),
	merge = require("webpack-merge"),
	loadPages = require('./loadPages'),
	compression = require('compression')
	// DynamicMiddleware = require('dynamic-middleware');
/** 
 * TODO
 * 
 * Handle add and delete files with webpack reload.
 */
module.exports = {
	apply(){
			cogear.hooks.webpackDev.tap('webpackDev',()=>{
				this.webpackDev()
			})
		},
		/** 
		 * Webpack development mode 
		 */
		async webpackDev(){
			// let options = cogear.options;
			cogear.webpackConfig = require(path.join(cogear.baseDir,"webpack.dev.js"))
			await loadPages(cogear.webpackConfig)
			cogear.compiler = webpack(cogear.webpackConfig)
			cogear.server = express()
			this.devMiddleware()
			this.hotMiddleware()
			// cogear.server.dynamicDevMiddleware = DynamicMiddleware.create(cogear.devMiddleware)
			// cogear.server.dynamicHotMiddleware = DynamicMiddleware.create(cogear.hotMiddleware)
			// cogear.server.use(cogear.server.dynamicDevMiddleware.handler())
			// cogear.server.use(cogear.server.dynamicHotMiddleware.handler())
			cogear.server.use(cogear.devMiddleware)
			cogear.server.use(cogear.hotMiddleware)
			cogear.server.use(express.static(cogear.options.output))
			// cogear.server.use(compression())
			this.done = false
			cogear.compiler.hooks.done.tap('Benchmark',()=>{
				if(!this.done){
					cogear.webpackLoader.succeed(`Webpack build is finished in ${prettyMs(now() - this.start)}!`)
					cogear.hooks.buildDone.call()
					this.done = true
					cogear.loader.succeed(
						`Your site is running at ${chalk.bold.whiteBright('http://'+cogear.config.host+':'+cogear.config.port)} (${chalk.bold("development mode")})`
					);
					console.log("Press Ctrl+C to exit…");
				} 
			})
			cogear.compiler.hooks.compilation.tap('Reload after page changes', (compilation) => {
				compilation.hooks.htmlWebpackPluginAfterEmit.tap('Reloading',(data) => {
					if(cogear.forceReload){
						cogear.hotMiddleware.publish({ action: 'reload' })
						cogear.forceReload = false
					}
				})
			})	
			// cogear.server = http.createServer(cogear.server)
			// cogear.reloadServer = reload(cogear.server)
			cogear.server.listen(cogear.options.port, cogear.options.host, (err) => {
				if (err) {
					cogear.loader.fail(err);
				} else {
					cogear.server.running = true
					this.start = now()
					cogear.webpackLoader=ora(`Webpack is running (${chalk.bold('development')})…`).start()
					this.watch()
				}
			})
	},
	watch(){
		let watchDirs = [cogear.options.srcPages,path.join(cogear.options.src,'layouts')]
		if(cogear.themeDir) watchDirs.push(path.join(cogear.themeDir,'layouts'))
		
		cogear.compiler.hooks.done.tap('Watcher',()=>{
			// if(cogear.watcher) return
			cogear.watcher = require("chokidar").watch(watchDirs,{
				ignorePermissionErrors: true,
				awaitWriteFinish: true,
				ignoreInitial: true
			});
			cogear.watcher.on("ready", () => {
					if(cogear.watcherInit) return
					cogear.watcherInit = true
					// console.log('Watcher ready')
					cogear.watcher.on("change", throttle(1000, file => {
						// console.info('Watcher change: ' + file)
						if(file.indexOf(cogear.options.srcPages) !== -1){
							let filePath = file.replace(cogear.options.srcPages + "/", "")
							cogear.hooks.buildPage.promise(filePath)
							// cogear.hotMiddleware.publish({ action: 'reload' })
							.then(()=>{
								// cogear.hotMiddleware.publish({ action: 'reload' })
								cogear.forceReload = true
							})
						}
						else {
							this.rebuildAllPages()
						}
					}));
					// cogear.watcher.on("unlink",  throttle(1000,(file)=>{
					// 	console.info('Watcher unlink: ' + file)
					// 	// if(file.indexOf(cogear.options.srcPages) !== -1){
					// 	// 	let pageName = file.replace(cogear.options.srcPages+'/','')
					// 	// 	page = cogear.pages[pageName]
					// 	// 	if(page){
					// 	// 		delete cogear.pages[pageName]
					// 	// 		let plugins = cogear.compiler.options.plugins
					// 	// 		Object.keys(plugins).forEach((key,index)=>{
					// 	// 			if(plugins[key].filename == page.path){
					// 	// 				delete plugins[key]
					// 	// 			}
					// 	// 		})
					// 	// 	}
					// 	// }
					// 	this.rebuildAllPages()
					// }));
					// cogear.watcher.on("add", (file)=>{
					// 	console.info('Watcher add: ' + file)
					// 	this.rebuildAllPages()
					// });
				});
			})
	},
	devMiddleware(){
		cogear.devMiddleware = require('webpack-dev-middleware')(cogear.compiler,{
			noInfo: !!cogear.options.verbose,
			stats: !!cogear.options.verbose,
			logLevel: 'silent',
			stats: {
				hash: false,
				version: false,
				timings: true,
				assets: false,
				chunks: false,
				modules: false,
				colors: true,
			},
			watchContentBase: true,
			overlay: true,
			inline: true,
			hot: true,
			// reload: false,
			path: `http://${cogear.options.host}:${cogear.options.port}/__webpack_hmr`,
			reload: true,
			compress: false,
			contentBase: cogear.themeDir ? [cogear.options.src,cogear.themeDir] : [cogear.options.src]
		})
	},
	hotMiddleware(){
		cogear.hotMiddleware =  require('webpack-hot-middleware')(cogear.compiler,{
			// reload: true,
			overlay: true,
			// noInfo: !cogear.options.verbose,
			// noInfo: true,
			// quiet: true,
			// reload: false,
			autoConnect: true,
			log: () =>{}
		})
	},
	rebuildAllPages(){
		cogear.hooks.build.promise()
		// debugger
		// Object.keys(cogear.compiler.options.plugins).forEach( (key,item)=>{
		// 	let plugin = cogear.compiler.options.plugins[key]
		// 	if(plugin.constructor.name == 'HTMLWebpackPlugin'){
		// 		delete cogear.compiler.options.plugins[key]
		// 	}
		// })
		// debugger
		// cogear.devMiddleware.close()
		// cogear.server.dynamicDevMiddleware.disable()
		// let configPath = path.join(cogear.baseDir,"webpack.dev.js")
		// delete require.cache[configPath]
		// cogear.webpackConfig = require(configPath)
		// cogear.compiler = webpack(loadPages(cogear.webpackConfig));
		// this.devMiddleware()
		// debugger
		// cogear.devMiddleware.invalidate()
		// cogear.server.dynamicDevMiddleware.replace(cogear.devMiddleware)
		// cogear.server.dynamicHotMiddleware.replace(cogear.hotMiddleware)
		// cogear.server.dynamicDevMiddleware.enable()
		// cogear.reloadServer.reload()
	}
}