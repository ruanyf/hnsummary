import { Feed } from 'feed';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import fs from 'node:fs/promises';


const response = await fetch('https://hackyournews.com/indexM');
const responseBody = await response.text();

console.log('finish fetching');


const responseRoot = parse(responseBody);
const articles = responseRoot.querySelectorAll('article');

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

articles.forEach(article => {
  const articleContent = article.toString();
  const articleRoot = parse(articleContent);

  const articleTitle = articleRoot.querySelector('.story-title a').rawText;
  const articleLink = articleRoot.querySelector('.story-title a').getAttribute('href');
  const articleHost = new URL(articleLink).hostname;
  const articleShort = articleRoot.querySelector('header p')?.rawText.slice(15);
  const articleLong = articleRoot.querySelector('.summary').rawText?.slice(26);
  const articleMeta = articleRoot.querySelector('.meta-data');
  const articleDate = new Date(articleMeta?.rawText.split('|')[1] ?? new Date());
  const articlePoints = articleMeta?.rawText.split('|')[0].split('points')[0] ?? 0;
  const articleComments = articleMeta?.innerHTML.split('|')[2] ?? '';

  feed.addItem({
    title: `${articleTitle} (${articleHost})`,
    id: articleLink,
    link: articleLink,
    description: articleShort,
    content: `<p>${articleLong}</p><p>${articlePoints}Points | ${articleComments}</p>`,
    author: { name: articleHost },
    date: articleDate,
  });
});

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

