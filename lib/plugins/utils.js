const path = require('path');
const jsonfile = require('jsonfile');
module.exports = {
  apply(){
    cogear.requirePackageJSON = (pkgPath)=>{
      pkgPath = pkgPath || path.join(cogear.baseDir,'package.json');
      let pkg;
      try {
        pkg = jsonfile.readFileSync(pkgPath);
      } catch (e){
        console.error(e);
      }
      return pkg;
    };
  }
};