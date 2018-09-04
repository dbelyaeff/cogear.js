
const chalk = require('chalk');
const	boxen = require('boxen');

module.exports = {
  apply(){
    process.on('SIGINT', async() => {
      console.log('\n' + boxen(`Visit ${chalk.bold.whiteBright('https://cogearjs.org')} to stay tuned!`,{align: 'center',padding:{top: 2, bottom: 2,left: 10,right: 10}, borderColor: 'magenta', dimBorder: true,borderStyle: 'double'}));
      await cogear.emit('death');
      process.exit();
    });
  }
};