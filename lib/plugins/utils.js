const path = require('path');
const jsonfile = require('jsonfile');
const fse = require('fs-extra');
const os = require('os');
module.exports = {
	apply(cogear){
		cogear.requirePackageJSON = (packagePath)=>{
			packagePath = packagePath || path.join(cogear.baseDir,"package.json")
			return jsonfile.readFileSync(packagePath)
		}
		cogear.clearDir = (clearPath, verbose = true) => {
			if(!clearPath) return
			let loader;
			let relativePath = clearPath.replace(os.homedir(),'~')
			if(verbose) loader = ora(`Cleaning folder ${chalk.bold(relativePath)}...`).start();
			fse.emptyDirSync(clearPath);
			if(verbose) loader.succeed(`Dir ${chalk.bold(relativePath)} is cleaned.`);
		}
	}
}