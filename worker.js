// ericsizemore.social — Cloudflare Worker
// Serves the static site, plus /api/posts: a tiny JSON endpoint that proxies
// the Substack RSS feed so the Writing section can render latest posts.

const FEED_URL = 'https://ericsizemore.substack.com/feed';
const MAX_POSTS = 5;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Canonical host is ericsizemore.tech — permanently redirect the old domain,
    // preserving path and query so existing links and search results carry over.
    if (url.hostname === 'ericsizemore.social' || url.hostname === 'www.ericsizemore.social') {
      url.hostname = 'ericsizemore.tech';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/posts') {
      return postsResponse();
    }
    return env.ASSETS.fetch(request);
  },
};

async function postsResponse() {
  try {
    const res = await fetch(FEED_URL, {
      headers: { 'User-Agent': 'ericsizemore.social feed worker' },
      cf: { cacheTtl: 1800, cacheEverything: true },
    });
    if (!res.ok) throw new Error('feed responded ' + res.status);
    const xml = await res.text();
    return json({ posts: parseFeed(xml) }, 'public, max-age=900');
  } catch (err) {
    return json({ posts: [], error: 'feed-unavailable' }, 'public, max-age=120', 502);
  }
}

function json(body, cacheControl, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}

function parseFeed(xml) {
  const posts = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const item of items.slice(0, MAX_POSTS)) {
    const title = tagText(item, 'title');
    const link = tagText(item, 'link');
    if (!title || !link.startsWith('https://')) continue;
    posts.push({
      title,
      link,
      date: tagText(item, 'pubDate'),
      snippet: toSnippet(tagText(item, 'description')),
    });
  }
  return posts;
}

function tagText(block, tag) {
  const match = block.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>'));
  if (!match) return '';
  const raw = match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return decodeEntities(raw).trim();
}

function toSnippet(html, max = 180) {
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  const cut = plain.lastIndexOf(' ', max);
  return plain.slice(0, cut > 40 ? cut : max) + '…';
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&');
}
