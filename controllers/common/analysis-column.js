const {
  COLUMN_TYPE,
  validateTypeValue,
} = require('../../utils/file-column-type');
const _ = require('lodash');
const classes = require('../../utils/common-classes');

/* Analysis column */
async function columnsAnalysis(arrayColumnsInfo, arrayContents) {
  const analysis = [];
  for (let i = 0; i < arrayColumnsInfo.length; ++i) {
    analysis.push({
      valid: 0,
      wrongType: 0,
      missing: 0,
      countTimeValueAppear: {},
      compareFrequently: 0,
      mostFrequently: '',
      sum: 0,
      max: 0,
      min: 1000000000000,
    });
  }

  //loop content and analysis then update to arraysColumnsInfo
  arrayContents.forEach((row) => {
    Object.keys(row).forEach((key, index) => {
      analysisValues(analysis[index], row[key], arrayColumnsInfo[index].type);
    });
  });

  arrayColumnsInfo.forEach((column, index) => {
    if ([COLUMN_TYPE.NUMBER].includes(column.type)) {
      const sorted = {};
      const transform = (stringNumber) => {
        if (/^\d+(\.\d+)?%$/.test(stringNumber))
          return +stringNumber.split('%')[0];
        return +stringNumber;
      };
      Object.keys(analysis[index].countTimeValueAppear)
        .sort((number1, number2) => transform(number1) - transform(number2))
        .forEach((item) => {
          sorted[item] = analysis[index].countTimeValueAppear[item];
        });
      analysis[index].countTimeValueAppear = sorted;
    }
  });

  analysis.forEach((item, index) => {
    let mean = 0,
      variance = 0,
      min = 0,
      range = 0;
    let quartile = {};

    if (arrayColumnsInfo[index].type === COLUMN_TYPE.NUMBER && item.valid > 0) {
      mean = roundNumber(item.sum / item.valid);
      variance = calculateVariance(item.countTimeValueAppear, mean, item.valid);
      quartile = {
        q1: calculateQuartile(item.countTimeValueAppear, item.valid, 25),
        q2: calculateQuartile(item.countTimeValueAppear, item.valid, 50),
        q3: calculateQuartile(item.countTimeValueAppear, item.valid, 75),
      };
      min = item.min;
      range = item.max - item.min;
    }

    arrayColumnsInfo[index].analysis = new classes.ColumnAnalysis(
      item.valid,
      item.wrongType,
      item.missing,
      Object.keys(item.countTimeValueAppear).length,
      convert(item.countTimeValueAppear),
      item.mostFrequently,
      roundNumber(item.countTimeValueAppear[item.mostFrequently] / item.valid),
      item.max,
      variance,
      roundNumber(Math.sqrt(variance)),
      mean,
      quartile,
      range,
      min
    );
  });
}

//analysis value
async function analysisValues(column, value, typeColumn) {
  if (value === '') {
    column.missing++;
    return;
  }
  if (!validateTypeValue(value, typeColumn)) {
    column.wrongType++;
    return;
  }
  column.valid++;
  analysisByTypeValue(column, value, typeColumn);
}

function analysisByTypeValue(column, value, typeColumn) {
  //create dictionary
  if (column.countTimeValueAppear[value] === undefined) {
    column.countTimeValueAppear[value] = 1;
  } else {
    column.countTimeValueAppear[value]++;
  }

  if (column.countTimeValueAppear[value] > column.compareFrequently) {
    column.compareFrequently = column.countTimeValueAppear[value];
    column.mostFrequently = value;
  }

  if (typeColumn === COLUMN_TYPE.NUMBER) {
    value = isPercentage(value);
    column.sum += value;
    if (column.max < value) column.max = value;
    if (column.min > value) column.min = value;
  }
}

//calculate median
function calculateQuartile(object, length, percentile) {
  const position = (percentile / 100) * length;
  let result = 0;
  let sum = -1;
  const keys = Object.keys(object);
  for (let index = 0; index < keys.length; index++) {
    sum += object[keys[index]];

    if (Math.floor(position) === position && sum === position - 1) {
      result = (isPercentage(keys[index]) + isPercentage(keys[index + 1])) / 2;
      break;
    }

    if (sum >= Math.floor(position)) {
      result = isPercentage(keys[index]);
      break;
    }
  }

  return roundNumber(result);
}

//calculate variance
function calculateVariance(object, mean, length) {
  const keys = Object.keys(object);
  let sum = 0;
  keys.forEach((key) => {
    const value = isPercentage(key);
    sum += Math.pow(value - mean, 2) * object[key];
  });
  return roundNumber(sum / length);
}

//Check string number is contains '%', convert it to float
function isPercentage(stringNumber) {
  const number = /^\d+(\.\d+)?%$/.test(stringNumber)
    ? parseFloat(stringNumber) / 100
    : parseFloat(stringNumber);
  return roundNumber(number);
}

//convert to save in mongodb
function convert(object) {
  //mongodb not accept key contain '.', so replace it by \\uu002e
  const convertObject = {};
  Object.keys(object).forEach((key) => {
    const tempKey = _.replace(key, /\./g, '\\u002e');
    convertObject[tempKey] = object[key];
  });
  return convertObject;
}

//Get round number
function roundNumber(number) {
  return Math.round(number * 100) / 100;
}

module.exports = {
  columnsAnalysis: columnsAnalysis,
};