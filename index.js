import { Feed } from 'feed';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import fs from 'node:fs/promises';
import process from 'node:process';

const response = await fetch('https://hackyournews.com');
const responseBody = await response.text();

console.log('finish fetching');


const responseRoot = parse(responseBody);
const trs = responseRoot.querySelectorAll('tr');

// console.log({ trs });

if (!trs.length) process.exit();

/*
const articles = responseRoot.querySelectorAll('td.title');
const contents = responseRoot.querySelectorAll('td.summary');

console.log(articles.length);
console.log(contents.length);

if (!articles.length) process.exit();

// 不知何故，contents 会比 articles 少1
if (articles.length === contents.length + 1) {
  articles.shift();
}
*/
console.log('finish parsing');


const feed = new Feed({
  title: "Hacker News Summary",
  description: "HN posts' summary",
  id: "hnsummary.vercel.app",
  link: "https://hnsummary.vercel.app/",
  language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/500px-Y_Combinator_logo.svg.png",
  favicon: "https://news.ycombinator.com/favicon.ico",
  updated: new Date(), // optional, default = today
  generator: "Feed for Node.js", // optional, default = 'Feed for Node.js'
  feedLinks: {
    json: "https://hnsummary.vercel.app/rss.json",
    rss: "https://hnsummary.vercel.app/rss.xml"
  },
  author: {
    name: "Ruan Yifeng",
    email: "yifeng.ruan@gmail.com",
    link: "https://www.ruanyifeng.com/blog"
  }
});

feed.addCategory('Frontpage');

let articleTitle;
let articleLink;
let articleContent;

for (let i = 0; i <= trs.length; i++) {
  let tr = trs[i];
  if (!tr) continue;

  if (tr.querySelector('td.title')) {
    articleTitle = tr.querySelectorAll('a')[0].rawText;
    articleLink = tr.querySelectorAll('a')[0].getAttribute('href');
  } else if (tr.querySelector('td.summary')) {
    articleContent = tr.querySelector('td.summary')?.innerHTML;
  } else {
    addItem();
    articleTitle = undefined;
    articleLink = undefined;
    articleContent = undefined;
  }
}

function addItem() {
  if (!articleTitle) return;
  feed.addItem({
    title: `${articleTitle}`,
    id: articleLink,
    link: articleLink,
    content: articleContent,
  });
}

/*
articles.forEach((article, index) => {
  const articleContent = contents[index]?.innerHTML;
  const articleTitle = article.querySelector('a').rawText;
  const articleLink = article.querySelector('a').getAttribute('href');

  feed.addItem({
    title: `${articleTitle}`,
    id: articleLink,
    link: articleLink,
    content: articleContent,
  });
});
*/

// console.log(feed.rss2());
// Output: RSS 2.0

// console.log(feed.atom1());
// Output: Atom 1.0

// console.log(feed.json1());
// Output: JSON Feed 1.0

console.log('finish building Feed');


try {
  await fs.rm('./dist', { recursive: true, force: true });
  await fs.mkdir('./dist');
  await fs.writeFile('./dist/rss.json', feed.json1());
  await fs.writeFile('./dist/rss.xml', feed.rss2());
  await fs.copyFile('./template/index.html', `./dist/index.html`);
  await fs.copyFile('./template/page.js', `./dist/page.js`);
} catch (err) {
  throw err;
}

console.log('finish generating files');

