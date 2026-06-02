module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const key = process.env.FOOTBALL_API_KEY;
  if (!key) {
    return res.status(200).json({ matches: [], configured: false });
  }

  const today = new Date().toISOString().split('T')[0];
  const plus3 = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  try {
    const resp = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${plus3}`,
      { headers: { 'X-Auth-Token': key } }
    );
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ matches: [], error: text });
    }
    const data = await resp.json();

    // Slim down the payload — only what the app needs
    const slim = (data.matches || []).map(m => ({
      id: m.id,
      status: m.status,           // SCHEDULED | IN_PLAY | PAUSED | FINISHED | POSTPONED
      minute: m.minute || null,
      utcDate: m.utcDate,
      competition: m.competition?.name || '',
      homeTeam: {
        name: m.homeTeam.name,
        short: m.homeTeam.shortName || m.homeTeam.tla || m.homeTeam.name.slice(0,3),
        crest: m.homeTeam.crest || null,
      },
      awayTeam: {
        name: m.awayTeam.name,
        short: m.awayTeam.shortName || m.awayTeam.tla || m.awayTeam.name.slice(0,3),
        crest: m.awayTeam.crest || null,
      },
      score: {
        home: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
        away: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
      },
    }));

    res.json({ matches: slim, configured: true });
  } catch (e) {
    res.status(500).json({ matches: [], error: e.message });
  }
};
