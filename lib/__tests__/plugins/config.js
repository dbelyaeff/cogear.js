const CogearJS = require('../../cogear');
const cogear = new CogearJS();
process.exit = jest.fn((CODE)=>{
  expect(CODE).toBe(1);
});


describe('Config plugin',()=>{
  test('Reads config file',()=>{
    cogear.emit('cli');
  });
});