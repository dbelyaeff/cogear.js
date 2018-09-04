const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const plural = require('plural');
const glob = require('glob');
const { loadConfig } = require('./config');
module.exports = {
  async apply(){
    await loadConfig();
    cogear.on('init',async()=>{
      // Load cogear package.json
      let localPluginsPath = path.join(process.cwd(),'plugins');
      let plugins = [];
      if(cogear.config.plugins){
        cogear.config.plugins.forEach(plugin=>{
          cogear.use(require(require.resolve(plugin,{
            paths: [
              localPluginsPath
            ]
          })));
          plugins.push(plugin);
        });
      }
      else {
        if(fs.existsSync(localPluginsPath)){
          let localPlugins = glob.sync('*/package.json',{cwd:localPluginsPath});
          localPlugins.forEach( pkg => {
            let plugin = path.basename(path.dirname(pkg));
            cogear.use(require(require.resolve(plugin,{
              paths: [
                localPluginsPath
              ]
            })));
            plugins.push(plugin);
          });
        }
        // Load current site package.json
        let pkgPath = path.join(process.cwd(),'package.json');
        if(fs.existsSync(pkgPath)){
          let pkg = cogear.requirePackageJSON(pkgPath);
          if(pkg.dependencies){
            let npmPlugins = Object.keys(pkg.dependencies).filter(plugin => plugin.indexOf('cogear-plugin-') !== -1);
            npmPlugins.forEach( plugin => {	
              cogear.use(require(require.resolve(plugin,{
                paths: [
                  path.join(process.cwd())
                ]
              })));
              plugins.push(plugin);
            });
          }
        } 
      }		
      cogear.on('banner.after',()=>{
        if(plugins.length){
          cogear.loader = cogear.loader || ora();
          cogear.loader.info(`Found ${plugins.length} ${plural('plugin',plugins.length)}…`);
          plugins.forEach( plugin => {	
            cogear.loader.succeed(`Plugin ${chalk.bold(plugin.replace('cogear-plugin-',''))} is loaded.`);
          });
          cogear.loader.succeed('All plugins are loaded.');
        }
      });
    });
  }
};