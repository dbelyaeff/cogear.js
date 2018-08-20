const webpack = require("webpack"),
		express = require("express"),
		expressStaticGzip = require("express-static-gzip"),
		compression = require('compression'),
		path = require("path"),
		ora = require("ora"),
		fs = require("fs"),
		fse = require("fs-extra"),
		chalk = require("chalk"),
		now = require("performance-now"),
		prettyMs = require("pretty-ms"),
		merge = require("webpack-merge"),
		loadPages = require('./loadPages');
module.exports = {
	apply(){
		cogear.hooks.webpackProd.tap('webpackProd',(startServer)=>{
			this.webpackProd(startServer);
		})
	},
	/** 
	 * Webpack production mode 
	 */
	async webpackProd(startServer = true){
		cogear.webpackConfig = require(path.join(cogear.baseDir,"webpack.prod.js"))
		// cogear.compiler = webpack(loadPages(cogear.webpackConfig));
		await loadPages(cogear.webpackConfig)
		cogear.compiler = webpack(cogear.webpackConfig);
		cogear.server = express()
		cogear.server.use(express.static(cogear.options.output))
		cogear.server.use(compression())
		cogear.server.use("/",expressStaticGzip(cogear.options.output))
		let loader = ora(`Webpack is working (${chalk.bold('production')})…`).start();
		let webpackP = new Promise( (resolve,reject)=>{
			webpack(cogear.webpackConfig).run((err, stats) => {
				let result = stats.toString({colors: true })
				if(!err && result.indexOf('ERR') != -1){
					err = result;
				}
				if (err) {
					loader.fail(err);
					reject()
					process.exit();
				}
				else{
					if(cogear.options.verbose){
						console.log(result)
					}
					loader.succeed(`Webpack processing is done! (${prettyMs(stats.endTime - stats.startTime)})`)
					resolve()
				}
				startServer && loader.start().info("Starting server...")
			})
		})
		webpackP.then( () =>{
			if(startServer){
				cogear.server.listen(cogear.options.port, (errors) => {
					if(errors){
						console.log(errors)
						loader.fail(errors)
						process.exit()
					}
					loader.succeed(`Your site is running at ${chalk.bold.whiteBright('http://'+cogear.config.host+':'+cogear.config.port)} (${chalk.bold("production mode")})`);
					cogear.server.running = true
					console.log("Press Ctrl+C to exit…");
				})
			} else {
				loader.succeed("Ready for deploy.")
			}
			cogear.hooks.buildDone.call()
		})
	}
}