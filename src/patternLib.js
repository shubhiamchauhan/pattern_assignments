const lib = require('./patternUtil.js');
const { repeatCharacter } = lib;
const { createRow } = lib;
const { leftBorderWidth } = lib;
const { rightBorderWidth } = lib;
const { createFilledLine } = lib;
const { createIncNumSeries } = lib;
const { revString } = lib;

const filledLineGenerator = function(symbol) { 
  return function(width) {
    return repeatCharacter(width, symbol);
  }
}

const justifyLine = function(height) {
  return function(line) {
    return repeatCharacter(height-line.length," ")+line;
  }
}

const createHollowLine = function(width, symbol) {
  let line = repeatCharacter(leftBorderWidth(width), symbol);
  line += repeatCharacter(width -2, " ");
  return line + repeatCharacter(rightBorderWidth(width), symbol);
}

const hollowLineGenerator = function(symbol) {
  return function(width) {
    return createHollowLine(width, symbol);
  }
}

const filledRectangle=function(column, row, symbol) {
  let line = createFilledLine(column, symbol);
  return new Array(row).fill(line);
}

const hollowRectangle=function(column, row, symbol) {
  let edgeLine = createFilledLine(column, symbol);
  let middleLine = createHollowLine(column, symbol);
  let rectangle = new Array(row).fill(middleLine);
  rectangle[0] = edgeLine;
  rectangle[ row -1 ] = edgeLine;
  return rectangle;
}

const alternatingRectangle=function(column,row,symbol1,symbol2) {
  let line = [ createFilledLine(column, symbol1) ];
  line[1] = createFilledLine(column, symbol2) ;
  let rectangle = [];
  for(let index=0; index<row; index++) {
    rectangle.push(line[ index%2 ]);
  }
  return rectangle;
}

const createRectangle=function(userArgs){
  let type = userArgs.type;
  let column = userArgs.columns;
  let row = userArgs.rows;
  let pattern = {};
  pattern["filled"] = filledRectangle;
  pattern["hollow"] = hollowRectangle;
  pattern["alternating"] = alternatingRectangle;
  return pattern[type](column, row,"*","-");
}

const organizeRectangle = function(userArgs) {
  return createRectangle(userArgs).join('\n');
}

const triangleGenerator=function(height, symbol) {
  let triangleWidth = createIncNumSeries(height);
  return triangleWidth.map(filledLineGenerator(symbol));
}

const rightAlignTriangle=function(height, symbol) {
  let triangle = triangleGenerator(height, symbol);
  return triangle.map(justifyLine(height));
}

const leftAlignTriangle = function(height, symbol) {
  let triangle = rightAlignTriangle(height, symbol);
  return triangle.map(revString);
}

const createTriangle=function(userArgs) {
  let type = userArgs.type;
  let height = userArgs.columns;
  let pattern = {};
  pattern["left"] = leftAlignTriangle;
  pattern["right"] = rightAlignTriangle;
  return pattern[type](height, "*");
}

const organizeTriangle = function(userArgs) {
  return createTriangle(userArgs).join('\n');
}

const justifyLineBothEnds = function(height) {
  return function(line) {
    let numOfSpaces = (height-line.length)/2;
    let result = repeatCharacter(numOfSpaces," ")+line;
    return result + repeatCharacter(numOfSpaces, " ");
  }
}

const diamondRowWidth = function(maxWidth) {
  let width = [];
  for(let index=1; index<= maxWidth; index+=2) {
    width.push(index);
  }
  let result = width.slice().reverse()
  return width.concat(result.slice(1,));
}

const diamondLine = function(lineGenerator, height, symbol) {
  let line = diamondRowWidth(height);
  return line.map(lineGenerator(symbol));
}

const justifyDiamondLine = function(lineGenerator, height, symbol) {
  let row = diamondLine(lineGenerator, height, symbol);
  return row.map(justifyLineBothEnds(height));
}

const generateFilledDiamond =function(height, symbol){
  return justifyDiamondLine(filledLineGenerator, height, symbol);
}

const generateHollowDiamond = function(height, symbol){
  return justifyDiamondLine(hollowLineGenerator, height, symbol);
}

const createAngledLine = function(width) {
  let line = repeatCharacter(leftBorderWidth(width), '/');
  line += repeatCharacter(width-2, " ");
  line += repeatCharacter(rightBorderWidth(width),'\\');
  return line;
}

const createAngledDiamondRow = function(height) {
  let line = "*";
  let diamond = [line];
  for(let index=3; index<= height-2; index+=2) {
    line = createAngledLine(index);
    diamond.push(line);
  }
  return diamond
}

const generateAngledDiamond = function(height) {
  let diamond = createAngledDiamondRow(height);
  let botDiamond = diamond.slice().join('|');
  diamond.push(createHollowLine(height, "*"));
  botDiamond = revString(botDiamond).split('|');
  botDiamond.map(function(line) {
    return diamond.push(line)
  });
  return diamond.map(justifyLineBothEnds(height));
}

const createDiamond=function(userArgs) {
  let pattern = {};
  let type = userArgs.type;
  let height = userArgs.columns;
  if(height%2 == 0) {
    height--;
  }
  pattern["filled"] = generateFilledDiamond;
  pattern["hollow"] = generateHollowDiamond;
  pattern["angled"] = generateAngledDiamond;
  return pattern[type](height, "*");
}

const organizeDiamond = function(userArgs) {
  return createDiamond(userArgs).join('\n');
}

const flip = function(source) {
  let result= source.map(revString);
  return result;
}

const mirror = function(source) {
  return source.reverse();
}

const merge = function(set,subset) {
  let result = [];
  let length = Math.max(set.length, subset.length);
  for(let index=0; index<length; index++) {
    set[index] = set[index] || repeatCharacter(set[index-1].length," ");
    subset[index] = subset[index] || repeatCharacter(subset[index-1].length," ");
    result[index] = set[index] + " " + subset[index];
  }
  return result;
}

const mergePattern = function(source) {
  let result = source[0];
  for (let index=1; index< source.length; index++) {
    result = merge(result, source[index]);
  }
  return result;
}

const join = function(source){
  return source;
}

const generatePattern = function(userArg) {
  let result = [];
  let pattern ={};
  let length = Object.keys(userArg).length;
  for(let index=1; index<length; index++) {
    let patternArgs = userArg["type"+index][1];
    let fnName = userArg["type"+index][0];
    result.push(fnName(patternArgs));
  }
  result = mergePattern(result);
  pattern[""] = join ;
  pattern["flip"] = flip;
  pattern["mirror"] = mirror;
  return pattern[userArg.action](result);
}

const organizePattern = function(userArg) {
  return generatePattern(userArg).join('\n');
}

const extractUsrArgs = function(args) {
  let value = args[2];
  let columns = +args[3];
  let rows = +args[args.length-1];
  return { type : value, columns : columns, rows : rows };
}

const extractPatternsArgs = function(parameters, args, patternIndex) {
  let pattern = {};
  pattern["rectangle"] = createRectangle;
  pattern["triangle"]  = createTriangle;
  pattern["diamond"]   = createDiamond;
  let patternType = parameters[0].split("_");
  let patternArg = { type: patternType[0] };
  patternArg.columns = +parameters[1];
  patternArg.rows = +parameters[2] || 0;
  args["type" + patternIndex] = [pattern[patternType[1]], patternArg];
  return [patternType[1], args];
}

const extractMultiUsrArgs = function(userArgs){
  let patternIndex = 1;
  let args = { action: "" };
  let patternInc = { "rectangle": 2 };
  for(let index=2; index<userArgs.length; index++) {
    if( ["flip", "mirror"].includes(userArgs[index])) {
      args.action = userArgs[index];
      index++;
    }
    let parmeters = [ userArgs[index], userArgs[index+1], userArgs[index+2] ];
    let result = extractPatternsArgs(parmeters, args, patternIndex);
    index += patternInc[result[0]] || 1;
    args = result[1];
    patternIndex++;
  }
  return args;
}

exports.createDiamond = createDiamond;
exports.organizeRectangle = organizeRectangle;
exports.organizeTriangle = organizeTriangle;
exports.organizeDiamond = organizeDiamond;
exports.createRectangle = createRectangle;
exports.createTriangle = createTriangle;
exports.generatePattern = generatePattern;
exports.extractUserArgs = extractUsrArgs;
exports.extractMultiUsrArgs = extractMultiUsrArgs;
exports.organizePattern = organizePattern;
