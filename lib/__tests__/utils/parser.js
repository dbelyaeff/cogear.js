const parser = require('../../utils/parser')()
const path = require('path')
const fs = require('fs')
const fixtureDir = path.resolve('./lib/__tests__/fixtures/parser/in')
const CogearJS = require('../../cogear')
const cogear = new CogearJS()
describe('Parser',()=>{
	test('should parse a file',()=>{
		['index.html','index.hbs','index.md','index.pug'].forEach(async file=>{
			let result = await parser.renderFile(path.join(fixtureDir,file),{
				content: "Test"
			})
			expect(result).toContain('Test')
		})
	})
	test('should parse a string',()=>{
		['index.html','index.hbs','index.md','index.pug'].forEach(async file=>{
			let filePath = path.join(fixtureDir,file)
			let content = fs.readFileSync(filePath,'utf8')
			let result = await parser.render(content,{
				content: "Test",
				format: path.parse(filePath).ext
			})
			expect(result).toContain('Test')
		})
	})
})