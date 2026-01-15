export async function onRequestPost(context) {
  try {
    const { request, env } = context
    const body = await request.json()

    const nickname = String(body.nickname || "").trim().slice(0, 20)
    const correct = Number(body.correct)
    const total = Number(body.total)

    if (!nickname) return json({ ok:false, msg:"닉네임 필요" }, 400)
    if (!Number.isFinite(correct) || !Number.isFinite(total)) {
      return json({ ok:false, msg:"점수 형식 오류" }, 400)
    }
    if (correct < 0 || total < 0 || correct > total) {
      return json({ ok:false, msg:"점수 범위 오류" }, 400)
    }

    const score = correct
    const createdAt = Date.now()

    const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0"
    const ipHash = await sha256(ip)

    const recent = await env.DB
      .prepare("SELECT created_at FROM challenge_scores WHERE ip_hash=? ORDER BY created_at DESC LIMIT 1")
      .bind(ipHash)
      .first()

    if (recent && createdAt - Number(recent.created_at) < 10_000) {
      return json({ ok:false, msg:"너무 빠른 제출" }, 429)
    }

    await env.DB
      .prepare(`INSERT INTO challenge_scores(nickname, score, correct, total, created_at, ip_hash)
                VALUES(?,?,?,?,?,?)`)
      .bind(nickname, score, correct, total, createdAt, ipHash)
      .run()

    return json({ ok:true }, 200)
  } catch (e) {
    return json({ ok:false, msg:"서버 오류" }, 500)
  }
}

function json(obj, status=200){
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*"
    }
  })
}

async function sha256(text){
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest("SHA-256", enc)
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("")
}
