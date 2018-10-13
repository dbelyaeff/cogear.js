const path = require('path');
const fs = require('fs');

module.exports = {
  apply(){
    cogear.on('webpack.config',(webpackConfig)=>{
      if(cogear.themeDir){
        let themeScript = path.join(cogear.themeDir,'theme');
        try {
          require.resolve(themeScript);
          webpackConfig.entry['app'].push(themeScript);
        } catch (e){
          // Ignore exception
        }
      }
    });
  }
};