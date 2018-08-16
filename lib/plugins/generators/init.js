const path = require("path"),
	boxen = require("boxen"),
	ora = require("ora"),
	fs = require("fs"),
	chalk = require("chalk");
	
module.exports = {
	apply(cogear){
		cogear.hooks.generators.init.tap('generators-init',type=>this.init(cogear,type))
	},
	/**
	 * Init generator
	 */
	init(cogear,type="site"){
		cogear.package = cogear.package || cogear.requirePackageJSON()
		if(type == 'site' && (fs.existsSync('package.json') || fs.existsSync('.git'))){
			let loader = ora().start()
			loader.fail(`New ${type} cannot be crafted in the project directory.\n(Avoid ${chalk.bold('.git')} folder or ${chalk.bold('package.json')} file).`)
			process.exit()
		}
		console.log(boxen(`Generating new ${type} with ${chalk.bold("Cogear.JS")}\n\nv${cogear.package.version}\n\nPlease, answer a few questions:`,{
			padding: {top: 1, bottom: 1,left: 8,right: 8},
			margin: 0,
			dimBorder: true,
			align: "center",
			borderStyle: "double",
			borderColor: "magenta"
		}))
	}
}