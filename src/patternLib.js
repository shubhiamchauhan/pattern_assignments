const lib = require('./patternUtil.js');
const { repeatCharacter } = lib;
const { createRow } = lib;
const { leftBorderWidth } = lib;
const { rightBorderWidth } = lib;
const { createFilledLine } = lib;
const { createIncNumSeries } = lib;
const { justifyLine } = lib;
const { revString } = lib;

const filledLineGenerator = function(symbol) { 
  return function(width) {
    return repeatCharacter(width, symbol);
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
  line[1] = [createFilledLine(column, symbol2) ];
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
  return pattern[type](column, row,"*","-").join("\n");
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
  return pattern[type](height, "*").join('\n');
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
  return pattern[type](height, "*").join('\n');
}

const extractUserArgs = function(args) {
  let value = args[2];
  let columns = +args[3];
  let rows = +args[args.length-1];
  return { type : value, columns : columns, rows : rows };
}

exports.createDiamond = createDiamond;
exports.createRectangle = createRectangle;
exports.createTriangle = createTriangle;
exports.extractUserArgs = extractUserArgs;
