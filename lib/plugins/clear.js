const os = require("os")
module.exports = {
	apply(){
		cogear.on('resources',async(webpackConfig)=>{
			await cogear.emit('clear',cogear.options.output)
		})
		cogear.on('clear',(dir,verbose=false)=>{
			return new Promise((resolve,reject)=>{
				let loader;
				let relativePath = dir.replace(os.homedir(),'~')
				if(verbose) loader = ora(`Cleaning folder ${chalk.bold(relativePath)}...`).start();
				fse.emptyDir(dir).then(()=>{
						resolve()
						if(verbose) loader.succeed(`Dir ${chalk.bold(relativePath)} is cleaned.`);
				})
			})
		})
	}
}