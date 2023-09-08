fetch('./rss.json')
.then(async function (response) {
  const res = await response.json();
  const items = res.items;

  const list = document.querySelector('.list');

  items.forEach(i => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    const host = (new URL(i.url)).hostname;
    div.innerHTML = `<h3><a href="${i.url}" target="_blank">${i.title}</a></h3><p>${timeStr(i.date_modified)}</p><details open><summary>${i.summary}</summary>${i.content_html}</details>`;
    li.appendChild(div);
    list.appendChild(li);
  });
})

function timeStr(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('zh-CN', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false
    });
  } catch(e) {
    return '';
  }
}

