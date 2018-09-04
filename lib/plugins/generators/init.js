const boxen = require('boxen');
const ora = require('ora');
const fs = require('fs');
const chalk = require('chalk');
	
module.exports = {
  apply(){
    cogear.on('generators.init',type=>this.init(type));
  },
  /**
	 * Init generator
	 */
  init(type='site'){
    cogear.package = cogear.package || cogear.requirePackageJSON();
    if(type == 'site' && (fs.existsSync('package.json') || fs.existsSync('.git'))){
      ora().fail(`New ${type} cannot be crafted in the project directory.\n(Avoid ${chalk.bold('.git')} folder or ${chalk.bold('package.json')} file).`);
      process.exit();
    }
    console.log(boxen(`Generating new ${type} with ${chalk.bold.whiteBright('Cogear.JS')}\n\nv${cogear.package.version}\n\n${chalk.bold.whiteBright('https://cogearjs.org')}`,{
      padding: {top: 1, bottom: 1,left: 8,right: 8},
      margin: 0,
      dimBorder: true,
      align: 'center',
      borderStyle: 'double',
      borderColor: 'magenta'
    }));
  }
};