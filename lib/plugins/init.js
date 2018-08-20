const path = require("path");
const getopts = require("getopts");
const boxen = require("boxen");
const ora = require("ora");
const glob = require("glob");
const fs = require("fs");
const fse = require("fs-extra");
const mkdirp = require("mkdirp");
const chalk = require("chalk");
const now = require("performance-now");
const merge = require("webpack-merge");
const prettyMs = require("pretty-ms");
const util = require('util');
const del = require('del');
module.exports = {
	apply(){
		cogear.hooks.init.tap('init',()=>{
			this.init()
		})
	},
	init(){
		cogear.hooks.banner.tap('Banner',()=>{
			console.log(
				boxen(`\n${chalk.bold.whiteBright('Cogear.JS – modern static websites generator.')}\n\nv${cogear.package.version}\n\n${chalk.bold.whiteBright('https://cogearjs.org')}`, {
					padding: {top: 1, bottom: 1,left: 8,right: 8},
					margin: 0,
					dimBorder: true,
					align: "center",
					borderStyle: "single-double",
					borderColor: "magenta"
				})
			)
		})
		cogear.hooks.config.call()
	}
}