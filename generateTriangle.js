const { organizeTriangle, extractUserArgs } = require('./src/patternLib.js');

const main = function() {
  let userargs = extractUserArgs(process.argv);
  let pattern = organizeTriangle(userargs);
  console.log(pattern);
}
main();
