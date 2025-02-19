import fs from 'node:fs';
import { parse } from 'node-html-parser';
import process from 'node:process';

let data;

try {
  data = fs.readFileSync('test/example.html', 'utf8');
  // console.log(data);
} catch (err) {
  console.error(err);
}

const responseRoot = parse(data);
const trs = responseRoot.querySelectorAll('.story');

// console.log({ trs });

if (!trs.length) {
  console.log('querySelector html failed');
  process.exit();
}

const trsHackerNews = data.slice(0, 15);

console.log(trsHackerNews.length);
