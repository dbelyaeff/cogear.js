const path = require('path');
const jsonfile = require('jsonfile');
const fse = require('fs-extra');
const os = require('os');
module.exports = {
	apply(){
		cogear.requirePackageJSON = (packagePath)=>{
			packagePath = packagePath || path.join(cogear.baseDir,"package.json")
			return jsonfile.readFileSync(packagePath)
		}
	}
}