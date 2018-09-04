const CogearJS = require('../../cogear')
const cogear = new CogearJS()

describe('Config plugin',()=>{
	test('Reads config file',()=>{
		process.argv.push('build','-c','lib/__tests__/fixtures/test.site/config.yaml')
		cogear.emit('cli')
		
	})
})