const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
module.exports = () => {
  return [
    {
      type: 'input',
      name: 'name',
      default: 'cogear-plugin-' + (cogear.options._[1] ? cogear.options._[1].replace('cogear-plugin-','') : 'name'),
      message: 'Plugin name:',
      validate(name){
        let done = this.async();
        if(name.trim() == ''){
          done('Shouldn\'t be empty.');
        }
        if(name.match(/[^\w_-]+/)){
          done('Use only lowercase letters, lodash and dash.');
        } 
        if(name.match(/^[^a-z]{1}/)){
          done('A letter should be the first.');
        } 
        let pluginPath = path.join(process.cwd(),'cogear-plugin-'+name.replace('cogear-plugin-',''));
        if(fs.existsSync(path.join(process.cwd(),cogear.options.src))){ 
          pluginPath = path.join(process.cwd(),'plugins',name);
        }
        fs.access(pluginPath,(err) => {
          if(err){ // Directory not exists
            done(null,true);
          } else {
            done(`Directory exists in current folder! Try again.\n${chalk.bold(pluginPath)}.`);
          }
        });
      }
    },
  ];
};