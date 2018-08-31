const boxen = require('boxen');
// const inquirer = require('inquirer');
const chalk = require('chalk');
// const now = require('performance-now');
// const prettyMs = require("pretty-ms");
const ora = require("ora");
// const shell = require('shelljs')
const merge = require('webpack-merge')
// const validUrl = require('valid-url')
const fs = require('fs')
const now = require('performance-now')
const prettyMs = require('pretty-ms')
const path = require('path')
const os = require('os')
const shell = require('shelljs')
const util = require('util')
module.exports = {
	apply(){
		cogear.on('deploy.done',()=>{
			performance.mark('deployEnd')
			performance.measure('Deploy','deployStart','deployEnd')
			const {duration} = performance.getEntriesByName('Deploy').shift()
			cogear.loader.succeed(`Deployed in ${prettyMs(duration)}.`)
		})
		cogear.on('deploy',async ()=>{
			try {
				this.config = cogear.config.deploy || require(path.join(process.cwd(),'deploy'))
			}	catch (e) {
				cogear.loader.fail(`No deploy config found.\nLearn more:\n${chalk.bold.whiteBright('https://cogearjs.org/docs/deploy')}`)
				process.exit()			
			}
			if(!fs.existsSync(path.join(cogear.options.output,'index.html'))){
				cogear.loader.warn("Build is not found. Building…")
				cogear.on('build.done',()=>{
					this.deploy()
				})
				cogear.options.open = false
				await cogear.emit('webpack',{mode:'production'})
				cogear.options.open = false
				cogear.on('webpack.afterEmit',async(compilation)=>{
					await cogear.emit('build')
				})
			} else {
				this.deploy()
			}
		})
	},
	deploy(){
		performance.mark('deployStart')
		cogear.loader.start("Searching for presets…")
		let presets = Object.keys(this.config);
		cogear.loader.succeed(`Presets found: ${presets.map(preset => chalk.bold(preset)).join(', ')}`)
		let preset = presets.shift()
		if(!cogear.options._[1]){
			cogear.loader.info(`No preset is chosen.`)
			cogear.loader.info(`Starting ${chalk.bold(preset)} preset by default…`)
		}
		else if(presets.includes(cogear.options._[1])){
			preset = cogear.options._[1];
			cogear.loader.info(`Preset ${chalk.bold(preset)} is chosen.`)
			// cogear.loader.start(`Starting deploying…\n`)
		}
		let defaults = {
			type: "ftp",
			port: 21,
			user: "deploy",
			password: null,
			commands: "-avz --delete --progress --quiet", // for rsync
		}
		options = merge(defaults,this.config[preset])
		cogear.loader.start('Deploying…')
		switch(options.type){
			case 'ftp':
			const _cliProgress = require('cli-progress');
			const bar = new _cliProgress.Bar({
				format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | Uploading: {file}',
				stopOnComplete: true
			}, _cliProgress.Presets.shades_classic);
			cogear.loader.info('Start uploading files via FTP…')
			let barStarted = false
				const FtpDeploy = require('ftp-deploy');
				const ftpDeploy = new FtpDeploy()
				ftpDeploy.on('uploading', function(data) {
					if(!barStarted){
						bar.start(data.totalFilesCount,data.transferredFileCount,{
							file: data.filename
						})
						barStarted = true
					}
				});
				ftpDeploy.on('uploaded', function(data) {
					bar.update(data.transferredFileCount,{
						file: data.filename
					})
				})
				ftpDeploy.deploy({
					user: options.user,
					password: options.password,
					host: options.host,
					port: options.port,
					localRoot: cogear.options.output,
					remoteRoot: options.path,
					deleteRemote: true,
					include: ['*','**/*'],
					exclude: []
				})
				.then(res=>{
					cogear.emit('deploy.done')
				})
				.catch(err => {
					cogear.loader.fail("Deploy failed.")
					console.error(err)
				})
			break;
			case 'sftp':
				const sftp = require('node-sftp-deploy');
				sftp({
					"host": options.host,
					"port": 22,
					"user": options.user,
					"pass": options.password,
					"remotePath": options.path,
					"sourcePath": cogear.options.output
			}, ()=>{
				cogear.emit('deploy.done')
			});
			break;
			case 'rsync':
				if(!shell.which('rsync')){
					cogear.loader.fail(`${chalk.bold('rsync')} is not installed.`);
				}
				shell.exec(`rsync ${options.commands} ${cogear.options.output}/ ${options.user}@${options.host}:/${options.path}`,(code,out,err)=>{
					if(!err){
						cogear.emit('deploy.done')
					} else {
						cogear.loader.fail('Deploy failed.')
						console.error(err)
					}
				})
			break;
		}
	}
}