export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const limitRaw = Number(url.searchParams.get("limit") || 20)
  const limit = Math.max(1, Math.min(50, limitRaw))

  const rows = await env.DB
    .prepare(`
      SELECT nickname, score, correct, total, created_at
      FROM challenge_scores
      ORDER BY score DESC, total DESC, created_at ASC
      LIMIT ?
    `)
    .bind(limit)
    .all()

  const data = (rows.results || []).map((r, i) => ({
    rank: i + 1,
    nickname: r.nickname,
    score: r.score,
    correct: r.correct,
    total: r.total,
    createdAt: r.created_at
  }))

  return new Response(JSON.stringify({ ok:true, data }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*"
    }
  })
}