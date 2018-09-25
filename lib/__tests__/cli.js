const CogearJS = require('../cogear');
const cogear = new CogearJS();
const shell = require('shelljs');
const rm = require('rimraf').sync;
const path = require('path');
const fs = require('fs');
const siteDir = path.join(__dirname,'fixtures','site');
const publicDir = path.join(siteDir,'public');
describe('Cogear.JS',()=>{
  test('must show version with -v argument',async()=>{
    let output = shell.exec('cogear -v',{silent:true}).stdout;
    cogear.package = cogear.requirePackageJSON();
    expect(output.trim()).toEqual(cogear.package.version);
  });
  test('must show help with --help argument',async()=>{
    let output = shell.exec('cogear --help',{silent:true}).stdout;
    expect(output).toContain('usage');
  });
  describe('make a build',()=>{
    beforeEach(()=>{
      rm(path.join(siteDir,'public'));
    });
    test('must build src to output',()=>{
      shell.cd(siteDir);
      shell.exec('cogear build',{silent: true});
      expect(fs.existsSync(publicDir)).toBeTruthy();
      expect(fs.existsSync(path.join(publicDir,'index.html'))).toBeTruthy();
    });
    afterAll(()=>{
      rm(path.join(siteDir,'public'));
    });

  });
});