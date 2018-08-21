const webpack = require("webpack");
const express = require("express");
const http = require("http");
// const { throttle, debounce } = require("throttle-debounce");
const path = require("path");
const ora = require("ora");
const fs = require("fs");
const fse = require("fs-extra");
const chalk = require("chalk");
const now = require("performance-now");
const prettyMs = require("pretty-ms");
const merge = require("webpack-merge");

module.exports = {
	apply() {
		cogear.on("webpack", ({ mode }) => {
			if (mode == "development") {
				this.webpackDev();
			}
		});
		cogear.on("preload.done", () => {
			if (cogear.mode == "development") {
				cogear.compiler = webpack(cogear.webpackConfig);
				cogear.compiler.hooks.beforeCompile.tap(
					"Build pages",
					compilationParams => {
						this.lastWebpackTick = now();
					}
				);
				cogear.compiler.hooks.afterEmit.tap("Build pages", async compilation => {
					this.compilation = compilation;
					await cogear.emit("webpack.afterEmit", compilation);
				});
				cogear.compiler.hooks.done.tap("Webpack done", async stats => {
					if (!cogear.webpackFirstDone)
						cogear.webpackLoader.succeed(
							`Webpack processing is done! (${prettyMs(
								now() - this.lastWebpackTick
							)})`
						);
					await cogear.emit("webpack.done", stats.compilation);
					this.compilation = stats.compilation;
					if (!cogear.webpackFirstDone) cogear.webpackFirstDone = true;
				});
				this.lastWebpackTick = now()
				this.runServer();
			}
		});
	},
	/**
	 * Webpack development mode
	 */
	async webpackDev() {
		cogear.webpackLoader = ora(
			`Webpack is running (${chalk.bold("development")})…`
		).start();
		cogear.webpackConfig = require(path.join(cogear.baseDir, "webpack.dev.js"));
		await cogear.emit("webpack.config", cogear.webpackConfig);
		await cogear.emit("preload", cogear.webpackConfig);
	},
	runServer() {
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
				timings: true,
				assets: !!cogear.options.verbose,
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
		cogear.server.listen(cogear.options.port, cogear.options.host, err => {
			if (err) {
				ora()
					.start()
					.fail(err);
			} else {
				this.watch();
			}
		});
	},
	watch() {
		let watchDirs = [
			cogear.options.srcPages,
			path.join(cogear.options.src, "layouts"),
		];
		if (cogear.themeDir) watchDirs.push(path.join(cogear.themeDir, "layouts"));
		cogear.compiler.hooks.done.tap("Watcher", () => {
			cogear.watcher = require("chokidar").watch(watchDirs, {
				ignorePermissionErrors: true,
				ignored: /(^|[\/\\])\../
				// awaitWriteFinish: true,
				// ignoreInitial: true
			});
			cogear.watcher.on("ready", () => {
				if (this.watcherLoader) return; // Mac bug – double init
				ora()
					.start()
					.succeed(
						`Your site is running at ${chalk.bold.whiteBright(
							"http://" + cogear.config.host + ":" + cogear.config.port
						)} (${chalk.bold("production mode")})`
					);
				this.watcherLoader = ora("Watching for changes…").info();
				// If file is changed or added
				cogear.watcher.on("change", async file => {
					this.watcherLoader.info(
						chalk.yellow(`Changed: ${this.clearFilename(file)}`)
					);
					if (file.indexOf(cogear.options.srcPages) !== -1) {
						let filePath = file.replace(cogear.options.srcPages + "/", "");
						await cogear.emit("build.page", filePath);
						cogear.hotMiddleware.publish({ action: "reload" });
					} else {
						await this.rebuildAllPages();
					}
				});
				// If file is deleted
				cogear.watcher.on("unlink", async file => {
					this.watcherLoader.info(
						chalk.yellow("Deleted: " + this.clearFilename(file))
					);
					if (file.indexOf(cogear.options.srcPages) !== -1) {
						let pageName = file.replace(cogear.options.srcPages + "/", "");
						page = cogear.pages[pageName];
						if (page) {
							delete cogear.pages[pageName];
							fs.unlinkSync(path.join(cogear.options.output, page.path));
							cogear.hotMiddleware.publish({ action: "reload" });
							// await this.rebuildAllPages()
						}
					}
				});
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
		await cogear.emit("build", this.compilation);
		cogear.hotMiddleware.publish({ action: "reload" });
	}
};
