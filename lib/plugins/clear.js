const os = require("os")
module.exports = {
	apply(){
		['death','deploy.done'].forEach((event)=>{
			cogear.on(event,async()=>{
				if(['development','deploy','build'].includes(cogear.mode)){
					await cogear.emit('clear',cogear.options.output)
				}
			})
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