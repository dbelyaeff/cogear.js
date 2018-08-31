const webpack = require("webpack");
const express = require("express");
const http = require("http");
// const { throttle, debounce } = require("throttle-debounce");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const chalk = require("chalk");
const now = require("performance-now");
const prettyMs = require("pretty-ms");
const merge = require("webpack-merge");

module.exports = {
	apply() {
		cogear.on("webpack", async ({ mode }) => {
			if (mode == "development") {
				await this.webpackDev();
			}
		});
		cogear.on("build.done",()=>{
			if('development' !== cogear.mode) return
			cogear.loader.succeed(
				`Your site is running at ${chalk.bold.whiteBright(
					"http://" + cogear.config.host + ":" + cogear.http.address().port
				)} (${chalk.bold("production mode")})`
			);
			console.log("Press Ctrl+C to exit…")
			this.watch()
		})
		cogear.on("preload.done", async() => {
			if (cogear.mode == "development") {
				if(cogear.compiler) return
				try {
					cogear.compiler = webpack(cogear.webpackConfig);
				} catch (e){
					cogear.loader.fail(chalk.red(e))
					process.exit()
				}
				// cogear.compiler.hooks.beforeCompile.tap(
				// 	"Build pages",
				// 	compilationParams => {
				// 		performance.mark('webpackStart')
				// 	}
				// );
				cogear.compiler.hooks.afterEmit.tap("Build pages", async compilation => {
					cogear.compilation = compilation;
					await cogear.emit("webpack.afterEmit", compilation);
				});
				cogear.compiler.hooks.done.tap("Webpack done", async stats => {
					cogear.compilation = stats.compilation;
					await cogear.emit("webpack.done", stats.compilation);
					cogear.flags.webpackFirstDone = true; // Important. DO NOT DELETE
				});
				await this.runServer();
			}
		});
	},
	/**
	 * Webpack development mode
	 */
	async webpackDev() {
		cogear.webpackConfig = require(path.join(cogear.baseDir, "webpack.dev.js"));
		await cogear.emit("webpack.config", cogear.webpackConfig);
		await cogear.emit("preload");
	},
	async runServer() {
		cogear.server = express();
		cogear.devMiddleware = require("webpack-dev-middleware")(cogear.compiler, {
			watchOptions: {
				aggregateTimeout: 300,
				poll: true
			},
			noInfo: !cogear.options.verbose,
			stats: !!cogear.options.verbose,
			logLevel: cogear.options.verbose ? "debug" : "silent",
			stats: {
				hash: !!cogear.options.verbose,
				version: !!cogear.options.verbose,
				timings: false,
				assets: false,
				chunks: false,
				modules: false,
				colors: true
			},
			overlay: true,
			inline: true,
			hot: true,
			publicPath: cogear.webpackConfig.output.publicPath,
			reload: true,
			compress: true,
			watchContentBase: false,
			contentBase: cogear.themeDir
				? [cogear.options.src, cogear.themeDir]
				: [cogear.options.src]
		});
		cogear.hotMiddleware = require("webpack-hot-middleware")(cogear.compiler, {
			overlay: true,
			log: console.info,
			heartbeat: 10 * 1000,
			path: "/__webpack_hmr",
			reload: true,
			log: () => {}
		});
		cogear.server.use(cogear.devMiddleware);
		cogear.server.use(cogear.hotMiddleware);
		cogear.server.use(express.static(cogear.options.output));
		await cogear.emit('server.init')
		cogear.server.on('error',(e)=>{
			console.error(e.message)
			console.info(e.stack)
		})
		cogear.http = http.createServer(cogear.server).listen(cogear.config.port, cogear.config.host, async err => {
			if (err) {
				cogear.loader.fail(err);
				process.exit()
			} 
			await cogear.emit('server.listen')			
		});
	},
	watch() {
		let watchDirs = [
			cogear.options.srcPages,
			path.join(cogear.options.src, "layouts"),
		];
		if (cogear.themeDir) watchDirs.push(path.join(cogear.themeDir, "layouts"));
		cogear.watcher = require("chokidar").watch(watchDirs, {
				ignorePermissionErrors: true,
				ignored: /(^|[\/\\])\../,
				// awaitWriteFinish: true,
				ignoreInitial: true
			});
		let watcherLoaded = false
		cogear.watcher.on("ready", () => {
			// if (watcherLoaded) return; // Mac bug – double init
			// watcherLoaded = true
			// cogear.loader.start("Watching for changes…")
			// If file is changed or added
			cogear.watcher.on("change", async file => {
				cogear.loader.info(
					chalk.yellow(`Changed: ${this.clearFilename(file)}`)
				);
				await cogear.emit("watcher.change",file)
				if (file.indexOf(cogear.options.srcPages) !== -1) {
					let filePath = file.replace(cogear.options.srcPages + "/", "");
					await cogear.emit("build.page", filePath);
					await cogear.emit("watcher.change.page",filePath)
					cogear.hotMiddleware.publish({ action: "reload" });
				} else {
					await this.rebuildAllPages();
				}
			});
			// File is added
			cogear.watcher.on("add", async file => {
				cogear.loader.info(
					chalk.yellow(`Added: ${this.clearFilename(file)}`)
				);
				await cogear.emit("watcher.change",file)
				if (file.indexOf(cogear.options.srcPages) !== -1) {
					let filePath = file.replace(cogear.options.srcPages + "/", "");
					await cogear.emit("build.page", filePath);
					await cogear.emit("watcher.add.page",filePath)
					cogear.hotMiddleware.publish({ action: "reload" });
				} else {
					await this.rebuildAllPages();
				}
			})
			// If file is deleted
			cogear.watcher.on("unlink", async file => {
				cogear.loader.info(
					chalk.yellow("Deleted: " + this.clearFilename(file))
				);
				await cogear.emit("watcher.unlink",file)
				if (file.indexOf(cogear.options.srcPages) !== -1) {
					// let pageName = file.replace(cogear.options.srcPages + "/", "");
					let result = Object.entries(cogear.pages).filter(([uri,page])=> page.filePath == file)
					if(!result.length) return
					let [uri,page] = result.shift()
					delete cogear.pages[uri];
					fs.unlinkSync(path.join(cogear.options.output, page.path));
					await cogear.emit("watcher.unlink.page",[file,page])
					cogear.hotMiddleware.publish({ action: "reload" });
				}
			});
		});
	},
	// Remote absolute paths from filename
	clearFilename(file) {
		return file
			.replace(cogear.options.srcPages, "")
			.replace(cogear.options.src, "")
			.replace(cogear.themeDir, "");
	},
	// Rebuild all pages
	async rebuildAllPages() {
		await cogear.emit("rebuild");
		cogear.hotMiddleware.publish({ action: "reload" });
	}
};
