const path = require('path');
const jsonfile = require('jsonfile');
const fse = require('fs-extra');
const os = require('os');
module.exports = {
	apply(){
		cogear.requirePackageJSON = (packagePath)=>{
			packagePath = packagePath || path.join(cogear.baseDir,"package.json")
			let package;
			try {
				package = jsonfile.readFileSync(packagePath)
			} catch (e){
				console.error(e)
			}
			return package
		}
	}
}