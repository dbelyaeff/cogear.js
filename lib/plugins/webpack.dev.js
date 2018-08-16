const webpack = require("webpack"),
	webpackDevServer = require("webpack-dev-server"),
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
			cogear.loader.start(`Webpack is working (${chalk.bold('development')})…`)
			let options = cogear.options;
			cogear.server = this.webpackDevServer(cogear);
			let watchDirs = [cogear.options.srcPages,path.join(cogear.options.src,'layouts')]
			if(cogear.themeDir) watchDirs.push(path.join(cogear.themeDir,'layouts'))
			let watcher = require("chokidar").watch(watchDirs);
			watcher.on("ready", () => {
					watcher.on("change", throttle(1000, file => {
						if(file.indexOf(cogear.options.srcPages) !== -1){
							cogear.hooks.buildPage.call(file.replace(options.srcPages + "/", ""))
							throttle(1000, ()=>{
								cogear.server.stop();
								cogear.server = this.webpackDevServer(cogear);
								cogear.server.start();
							})
						}
						else {
							this.webpackDevRestart(cogear)
						}
					}))
					// To avoid false restarts just after server starts
					setTimeout(()=>{
						watcher.on("unlink",  throttle(1000,()=>{this.webpackDevRestart(cogear)}));
						watcher.on("add", throttle(1000,()=>{this.webpackDevRestart(cogear)}));
						watcher.on("rename", throttle(1000,()=>{this.webpackDevRestart(cogear)}));
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
				if(!this.done) cogear.loader.succeed(`Webpack build is finished in ${prettyMs(now() - this.start)}!`)
				this.done = true
			})
			let server = new webpackDevServer(compiler, {
				noInfo: !cogear.options.verbose,
				watchContentBase: true,
				overlay: true,
				inline: true,
				hot: true,
				contentBase: cogear.themeDir ? [cogear.options.src,cogear.themeDir] : [cogear.options.src]
			});
			server.start = () => {
				server.listen(cogear.options.port, cogear.options.host, (err) => {
					if (err) {
						loader.fail(err);
					} else {
						cogear.loader.succeed(
							`Your site is running at http://${cogear.config.host}:${cogear.config.port} (${chalk.bold("development mode")})`
						);
						cogear.options.open === true && opn(`http://${cogear.config.host}:${cogear.config.port}`)
						console.log("Press Ctrl+C to exit…");
					}
				});
			};
			server.stop = cb => {
				cogear.loader.info("Server is stopped.");
				server.close(cb);
			};
			server.restart = () => {
				server.stop(() => {
					server.start();
				});
				cogear.loader.succeed(`Server has been restarted.`);
			};
			return server;
		},
		/** 
		 * Rebuild pages and restarts webpack dev server
		 */
		webpackDevRestart(cogear){
			cogear.hooks.build.call();
			if(cogear.server){
				throttle(1000, ()=>{
					cogear.server.stop();
					cogear.server = this.webpackDevServer(cogear);
					cogear.server.start();
				});
			}

		}
	}