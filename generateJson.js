/**
 * Script to generate a JSON file from the txt resources.
 */
const fs = require('fs');

const availableWords = fs.readFileSync('./resources/words.txt').toString().split("\n");
const dictionaryWords = fs.readFileSync('./resources/5letterwords.txt').toString().split("\n");
const commonWords = fs.readFileSync('./resources/commonwords.txt').toString().split("\r\n");

fs.writeFile('./resources/words.json', `{"words": ${JSON.stringify(availableWords)}}`, () => { console.log('Wrote', availableWords.length, 'results') });
fs.writeFile('./resources/5letterwords.json', `{"words": ${JSON.stringify(dictionaryWords)}}`, () => { });
fs.writeFile('./resources/commonwords.json', `{"words": ${JSON.stringify(commonWords)}}`, () => { });

