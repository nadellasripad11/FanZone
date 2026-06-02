module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const key = process.env.NEWS_API_KEY;
  if (!key) {
    return res.status(200).json({ articles: [], configured: false });
  }

  try {
    const resp = await fetch(
      `https://newsapi.org/v2/top-headlines?q=football+soccer&language=en&pageSize=15&apiKey=${key}`
    );
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ articles: [], error: text });
    }
    const data = await resp.json();

    // Slim down — only what the feed needs
    const slim = (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .map(a => ({
        source: a.source?.name || 'Football News',
        author: a.author || null,
        title: a.title,
        description: a.description || '',
        url: a.url,
        image: a.urlToImage || null,
        publishedAt: a.publishedAt,
      }));

    res.json({ articles: slim, configured: true });
  } catch (e) {
    res.status(500).json({ articles: [], error: e.message });
  }
};
