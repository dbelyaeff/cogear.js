const webpack = require("webpack"),
	webpackDevServer = require("webpack-dev-server"),
	// webpackDevMiddleware = require('webpack-dev-middleware'),
	// webpackHotMiddleware = require('webpack-hot-middleware'),
	// app = require('express')(),
	{ throttle, debounce } = require("throttle-debounce"),
	path = require("path"),
	ora = require("ora"),
	fs = require("fs"),
	fse = require("fs-extra"),
	chalk = require("chalk"),
	now = require("performance-now"),
	prettyMs = require("pretty-ms"),
	merge = require("webpack-merge"),
	opn = require('opn');

module.exports = {
	apply(cogear){
			cogear.hooks.webpackDev.tap('webpackDev',()=>{
				this.webpackDev(cogear)
			})
		},
		/** 
		 * Webpack development mode 
		 */
		webpackDev(cogear){
			let options = cogear.options;
			cogear.server = this.webpackDevServer(cogear);
			let watchDirs = [cogear.options.srcPages,path.join(cogear.options.src,'layouts')]
			if(cogear.themeDir) watchDirs.push(path.join(cogear.themeDir,'layouts'))
			let watcher = require("chokidar").watch(watchDirs);
			let restart = () => {
				cogear.hooks.build.call();
				cogear.server.stop(()=>{
					cogear.server = this.webpackDevServer(cogear);
					setTimeout(()=>{
						cogear.server.start();
						cogear.loader.succeed(`Server has been restarted.`);
					},1000)
				});
				cogear.server.sockWrite(cogear.server.sockets, "content-changed");
			}
			watcher.on("ready", () => {
					watcher.on("change", throttle(500, file => {
						if(file.indexOf(cogear.options.srcPages) !== -1){
							cogear.hooks.buildPage.call(file.replace(options.srcPages + "/", ""))
							cogear.server.sockWrite(cogear.server.sockets, "content-changed");
							// debugger
							// debounce(1000, ()=>{
							// 	cogear.server.stop(()=>{
							// 		debugger
							// 		cogear.server = this.webpackDevServer(cogear);
							// 		cogear.server.start();
							// 	});
							// })
						}
						else {
							restart()
						}
					}))
					// To avoid false restarts just after server starts
					setTimeout(()=>{
						watcher.on("unlink",  throttle(500,(file)=>{
							if(file.indexOf(cogear.options.srcPages) !== -1){
								delete cogear.pages[file.replace(cogear.options.srcPages,'')]
							}
							restart()
						}));
						watcher.on("add", throttle(500,(file)=>{restart()}));
						watcher.on("rename", throttle(500,(file)=>{restart()}));
					},5000)
		});
		cogear.server.start()
	},
		/** 
		 * Webpack dev server instance
		 */
		webpackDevServer(cogear){
			cogear.webpackConfig = require(path.join(cogear.baseDir,"webpack.dev.js"))(cogear)
			cogear.hooks.loadPagesForWebpack.call()
			const compiler = webpack(cogear.webpackConfig);
			this.start = now()
			compiler.hooks.done.tap('Benchmark',()=>{
				if(!this.done) cogear.webpackLoader.succeed(`Webpack build is finished in ${prettyMs(now() - this.start)}!`)
				this.done = true
			})
			let server = new webpackDevServer(compiler, {
				noInfo: !cogear.options.verbose,
				watchContentBase: true,
				overlay: true,
				inline: true,
				hot: true,
				compress: true,
				contentBase: cogear.themeDir ? [cogear.options.src,cogear.themeDir] : [cogear.options.src]
			});
			server.start = () => {
				server.listen(cogear.options.port, cogear.options.host, (err) => {
					if (err) {
						cogear.loader.fail(err);
					} else {
						cogear.loader.succeed(
							`Your site is running at ${chalk.bold.whiteBright('http://'+cogear.config.host+':'+cogear.config.port)} (${chalk.bold("development mode")})`
						);
						cogear.options.open === true && opn(`http://${cogear.config.host}:${cogear.config.port}`)
						console.log("Press Ctrl+C to exit…");
						cogear.webpackLoader= ora(`Webpack is running (${chalk.bold('development')})…`).start()
					}
				});
			};
			server.stop = cb => {
				cogear.loader.info("Server is stopped.");
				server.close(cb);
			};
			return server;
	}
}