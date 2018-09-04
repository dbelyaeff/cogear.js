const CogearJS = require('../cogear')
const cogear = new CogearJS()
const shell = require('shelljs')
describe("Cogear.JS",()=>{
	test("must show version with -v argument",async()=>{
		let output = shell.exec('cogear -v',{silent:true}).stdout
		cogear.package = cogear.requirePackageJSON()
		expect(output.trim()).toEqual(cogear.package.version)
	})
	test("must show help with -h argument",async()=>{
		let output = shell.exec('cogear -h',{silent:true}).stdout
		expect(output).toContain('usage')
	})
})