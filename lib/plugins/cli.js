const commander = require('commander');
const path = require('path');
const getopts = require('getopts');
const boxen = require('boxen');
const chalk = require('chalk');
const {performance,PerformanceObserver} = require('perf_hooks');

global.performance = performance;
global.PerformanceObserver = PerformanceObserver;

module.exports = {
  apply(){
    cogear.on('cli',async()=>{
      await this.init();
    });
    // cogear.emit('cli')	
  },

  async init(){
    cogear.options = getopts(process.argv.slice(2),{
      alias: {
        s: 'src',
        o: 'output',
        h: 'host',
        p: 'port',
        b: 'open',
        w: 'verbose',
        n: 'no-open',
        c: 'config',
      },
      default: {
        src: cogear.config.src || 'src',
        output: cogear.config.output || 'public',
        host: cogear.config.host ||  'localhost',
        port: cogear.config.port || 9000,
        open: cogear.config.openBrowser || true,
        verbose: cogear.config.verbose || false,
      }
    });		
    if(cogear.options.n){
      cogear.options.open = false;
    }
    if(cogear.options.port === true){
      cogear.options.port  = 0; // Random port
    }
    cogear.package = require(path.join(cogear.baseDir,'package.json'));
    commander.usage(`${chalk.bold.whiteBright('cogear')} [command] [options]`);
    commander
      .version(cogear.package.version,'-v, --version','Show version number.')
      .option('-s, --source [string]','custom source directory.')
      .option('-o, --output [string]','custom output directory.')
    // .option('-c, --config [string]','custom config file.')
      .option('-p, --port   [int]','port to serve site on.',parseInt)
      .option('-h, --host   [string]','host to serve site on.')
      .option('-n, --no-open','do not open browser window automatically after built.')
      .option('-w, --verbose','verbose Webpack output.');
    // .option('-y, --yes','ignore all questions (for generators).');
		
    commander
      .command('development')
      .alias('dev')
      .description('Development mode with hot-reload (default).')
      .action(this.development);

    commander
      .command('production')
      .alias('prod')
      .description('Production mode: build and serve.')
      .action(async()=>{
        cogear.mode = 'production';
        await cogear.emit('init');
        cogear.on('webpack.done',async (compilation)=>{
          await cogear.emit('build',compilation);
        });
        await cogear.emit('webpack',{
          mode: cogear.mode
        });
      });

    commander
      .command('build')
      .alias('b')
      .description('Build mode: just build.')
      .action(async()=>{
        cogear.mode = 'build';
        await cogear.emit('init');
        cogear.options.open = false;
        cogear.on('webpack.done',async(compilation)=>{
          await cogear.emit('build',compilation);
        });
        await cogear.emit('webpack',{
          mode: 'production',
        });
      });
		
    commander
      .command('deploy [preset]')
      .alias('d')
      .description('Deploy mode: build (if not) and deploy.')
      .action(async()=>{
        cogear.mode = 'deploy';
        await cogear.emit('init');
        await cogear.emit('deploy');
      });
		
    commander
      .command('new [site-name]')
      .alias('init')
      .option('-y','Ignore questions.')
      .description('Generate new site.')
      .action(async()=>{
        await cogear.emit('generators.init','site');
        cogear.emit('generators.site');
      });
	
    commander
      .command('plugin [plugin-name]')
      .alias('p')
      .option('-y','Ignore questions.')
      .description('Generate new plugin.')
      .action(async()=>{
        await cogear.emit('generators.init','plugin');
        cogear.emit('generators.plugin');
      });

    commander
      .command('theme [theme-name]')
      .alias('t')
      .option('-y','Ignore questions.')
      .description('Generate new theme.')
      .action(async()=>{
        await cogear.emit('generators.init','theme');
        cogear.emit('generators.theme');
      });
		
    await cogear.emit('commander',commander);
    if(cogear.options.help){
      commander.help((help)=>{
        return boxen(`\n${chalk.bold.whiteBright('Cogear.JS – modern static websites generator.')}\n\nv${cogear.package.version}\n\n(help)\n\n${chalk.bold.whiteBright('https://cogearjs.org')}`, {
          padding: {top: 1, bottom: 1,left: 8,right: 8},
          margin: 0,
          dimBorder: true,
          align: 'center',
          borderStyle: 'single-double',
          borderColor: 'magenta'
        }) + `
${chalk.white('Runs in development mode by default (without [command]).')}
${help}
More info: ${chalk.bold.whiteBright('https://cogearjs.org')}
`;
      });
    }
    commander.parse(process.argv);
    if(!commander.args.length){
      await this.development();
    }
  },
  async development(){
    cogear.mode = 'development';
    await cogear.emit('init');
    cogear.on('webpack.done',async(compilation)=>{
      if(!cogear.flags.webpackFirstDone){
        await cogear.emit('build',compilation);
      }
    });
    await cogear.emit('webpack',{
      mode: cogear.mode
    });
  },
};