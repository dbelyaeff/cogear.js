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

module.exports = {
  apply(){
    cogear.on('generators.theme',async()=>{
      await this.generate();
    });
  },
  async generate(){
    let loader,
      themeName,
      themePath,
      start,
      answers;
    let questions = require('./questions/theme.js')();
		
    start = now();
    if(cogear.options.y && cogear.options._[1]){
      themeName = cogear.options._[1];
    }
    else {
      try {
        answers = await inquirer.prompt(questions);
      } catch (e) { console.error(e); }
      themeName = answers.name;
    }
    themeName = themeName.replace('cogear-theme-','');
    loader = ora('Crafting new theme...').start();
    themePath = path.join(process.cwd(),'cogear-theme-'+themeName);
    // If we are in the project folder
    if(fs.existsSync(path.join(process.cwd(),cogear.options.src))){ 
      themePath = path.join(process.cwd(),'themes',themeName);
    }
    if(fs.existsSync(themePath)){ 
      loader.fail(`Target directory exists.
${chalk.yellow('Try to change theme name or remove the directory.')}`);
      process.exit();
    }
    fse.ensureDirSync(themePath);
    loader.text = 'Copying theme files…';
    let tplDir = path.join(cogear.baseDir,'lib','plugins','generators','templates','theme');
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
          name: themeName,
        });
        fs.writeFileSync(
          path.join(themePath,file.replace(fileInfo.ext,'')),
          content
        );
      } else {
        fse.copySync(
          path.join(tplDir,file),
          path.join(themePath,file)
        );
      }
    });
    loader.succeed(`New theme is crafted in ${prettyMs(now() - start)}.\n
💡 ${chalk.underline.whiteBright('Next steps:')}
${chalk.bold('1.')} Edit ${chalk.bold('./config.yaml')} to set up the new theme.

More info: ${chalk.bold.whiteBright('https://cogearjs.org/docs/themes')}`);
  }
};