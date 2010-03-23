require.paths.unshift("./spec/lib");
require.paths.unshift("./lib");

var sys = require('sys');
for (var key in sys)
	GLOBAL[key] = sys[key];

// Require the kiwi package manager
var sys = require('sys');
// Simplifier
simplifier = require('simplifier/simplifier');

// Require jspec for running tests
require("jspec")
require("jspec.timers")

var posix = require('fs')

quit = process.exit
print = puts

readFile = function(path) {
  return posix.readFileSync(path);
}

if (process.ARGV[2])
  JSpec.exec('spec/spec.' + process.ARGV[2] + '.js')  
else
  JSpec
    // .exec('spec/spec.oauth_services.js')
    .exec('spec/spec.simplifier.js')
JSpec.run({ reporter: JSpec.reporters.Terminal, failuresOnly: true })
JSpec.report()