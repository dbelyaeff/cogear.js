const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
module.exports = () => {
  return [
    {
      type: 'input',
      name: 'sitename',
      default: cogear.options._[1],
      message: 'Shortname of new site (dir to be created):',
      validate(sitename){
        let done = this.async();
        if(sitename.match(/^\s*$/)){
          done('Can\'t be empty.');
        }
        let newSitePath = path.join(process.cwd(),sitename);
        fs.access(newSitePath,(err) => {
          if(err){ // Directory not exists
            done(null,true);
          } else {
            done(`Directory exists in current folder! Try again.\n${chalk.bold(newSitePath)}.`);
          }
        });
      },
    },
    // {
    // 	type: "list",
    // 	name: "hasRepo",
    // 	message: "Does it has a remote repository template?",
    // 	choices: ["No","Yes, it has."],
    // 	when(answers){
    // 		return typeof(cogear.options._[2]) == 'undefined'
    // 	}
    // },
    // {
    // 	type: "input",
    // 	name: "repo",
    // 	default: cogear.options._[2] || "https://github.com/codemotion/cogearjs/",
    // 	message: "Provide github repo address:",
    // 	validate(repo){
    // 		let done = this.async()
    // 		if(!repo.match(/^https?:\/\/(?:www\.)github\.com\/([\w_-]+)\/([\w_-]+)$/)){
    // 			done("Provided url is not valid.")
    // 		} else {
    // 			done(null,true)
    // 		}
    // 	},
    // 	when(answers){
    // 		if(typeof(cogear.options._[2]) != 'undefined'){
    // 			return false
    // 		}
    // 		return answers.hasRepo != 'No'
    // 	}
    // }
  ];
};