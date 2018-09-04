const os = require('os');
const fse = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
module.exports = {
  apply(){
    ['death','deploy.done'].forEach((event)=>{
      cogear.on(event,async()=>{
        if(['development','deploy','build'].includes(cogear.mode)){
          await cogear.emit('clear',cogear.options.output);
        }
      });
    });
    cogear.on('clear',(dir,verbose=false)=>{
      return new Promise((resolve)=>{
        let loader;
        let relativePath = dir.replace(os.homedir(),'~');
        if(verbose) loader = ora(`Cleaning folder ${chalk.bold(relativePath)}...`).start();
        fse.emptyDir(dir).then(()=>{
          resolve();
          if(verbose) loader.succeed(`Dir ${chalk.bold(relativePath)} is cleaned.`);
        });
      });
    });
  }
};