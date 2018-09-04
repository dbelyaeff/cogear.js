const ora = require('ora');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const prettyMs = require('pretty-ms');
const inquirer = require('inquirer');
const chalk = require('chalk');
const now = require('performance-now');
const Handlebars = require('handlebars');
const glob = require('glob');
const {forEach} = require('p-iteration');

module.exports ={
  apply(){
    cogear.on('generators.plugin',async()=>{
      await this.generate();
    });
  },
  async generate(){
    let loader,
      pluginName,
      pluginPath,
      start,
      answers;
    let questions = require('./questions/plugin.js')();
		
    start = now();
    loader = ora();
		
    if(cogear.options.y && cogear.options._[1]){
      loader.start('Crafting new plugin...');
      pluginName = cogear.options._[1];
    } else {
      try {
        answers = await inquirer.prompt(questions);
      } catch (e) { console.error(e); }

      loader = ora('Crafting new plugin...').start();
      pluginName = answers.name;
    }
    pluginName = pluginName.replace('cogear-plugin-','');
    pluginPath = path.join(process.cwd(),'cogear-plugin-'+pluginName);
    if(fs.existsSync(path.join(process.cwd(),cogear.options.src))){ // If in project root dir
      pluginPath = path.join(process.cwd(),'plugins',pluginName);
    }
    if(fs.existsSync(pluginPath)){
      loader.fail(`Target directory exists.
${chalk.yellow('Try to change plugin name or remove the directory.')}
`);
      process.exit();
    }


    if(fse.ensureDirSync(pluginPath)){
      let tplDir = path.join(cogear.baseDir,'lib','plugins','generators','templates','plugin');
      let files = glob.sync('**/*',{
        cwd: tplDir
      });
      await forEach(files,file=>{
        let filePath = path.join(tplDir,file);
        let fileInfo = path.parse(file);
        if(fileInfo.ext == '.tpl'){
          let source = fs.readFileSync(filePath,'utf-8');
          let template = Handlebars.compile(source);
          let content = template({
            name: pluginName,
          });
          fs.writeFileSync(
            path.join(pluginPath,file.replace(fileInfo.ext,'')),
            content
          );
        } else {
          fs.copyFileSync(
            file,
            path.join(pluginPath,file)
          );
        }
      });
      loader.succeed(`New plugin is crafted in ${prettyMs(now() - start)}.\n
💡 ${chalk.underline.whiteBright('Next steps:')}
${chalk.bold('1.')} > cd ${chalk.bold(pluginPath.replace(process.cwd(),'.'))} 
${chalk.bold('2.')} Edit ${chalk.bold('package.json')}.
${chalk.bold('3.')} Plugin will be loaded automatically next launch.

More info: ${chalk.bold.whiteBright('https://cogearjs.org/docs/plugins')}`);
    }
  }
};