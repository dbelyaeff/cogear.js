const webpack = require("webpack"),
		express = require("express"),
		app = express(),
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
		opn = require('opn');	
module.exports = {
	apply(cogear){
		cogear.hooks.webpackProd.tap('webpackProd',(startServer)=>{
			this.webpackProd(cogear,startServer);
		})
	},
	/** 
	 * Webpack production mode 
	 */
	webpackProd(cogear,startServer = true){
		cogear.webpackConfig = require(path.join(cogear.baseDir,"webpack.prod.js"))(cogear)
		cogear.hooks.loadPagesForWebpack.call()
		const compiler = webpack(cogear.webpackConfig);
		app.use(express.static(cogear.options.output))
		app.use(compression())
		app.use("/",expressStaticGzip(cogear.options.output))
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
				app.listen(cogear.options.port, (errors) => {
					if(errors){
						console.log(errors)
						loader.fail(errors)
						process.exit()
					}
					loader.succeed(`Your site is running at ${chalk.bold.whiteBright('http://'+cogear.config.host+':'+cogear.config.port)} (${chalk.bold("production mode")})`);
					cogear.options.open === true && opn(`http://${cogear.config.host}:${cogear.config.port}`)
					console.log("Press Ctrl+C to exit…");
				})
			} else {
				loader.succeed("Ready for deploy.")
				cogear.hooks.buildDone.call()
			}
		})
	}
}