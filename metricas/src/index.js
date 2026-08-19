/* ==========================================================
   CONTADOR DO FUNIL
   Recebe os eventos que a pagina dispara e guarda so a CONTAGEM.
   Nao grava IP, nao grava quem e a pessoa, nao cria cookie: por isso
   o site nao precisa de aviso de consentimento.

   POST /_m/e          a pagina avisa um evento
   GET  /_m/r/SEGREDO  o relatorio, so pra quem tem o link
   ========================================================== */

/* a ordem aqui E o funil: cada etapa e um degrau abaixo da anterior */
const FUNIL = [
  ["quiz_p1",        "Respondeu a 1a pergunta"],
  ["quiz_p2",        "Respondeu a 2a"],
  ["quiz_p3",        "Respondeu a 3a"],
  ["quiz_p4",        "Respondeu a 4a"],
  ["quiz_resultado", "Chegou no resultado"],
  ["whatsapp",       "Clicou no WhatsApp"]
];
const AVULSOS = [["quiz_retomado", "Voltou e continuou de onde parou"]];
const VALIDOS = new Set([...FUNIL, ...AVULSOS].map(([k]) => k));

const hoje = () => new Date().toISOString().slice(0, 10);
const DIA = 86400;

async function somar(env, chave, ttl) {
  const atual = parseInt((await env.METRICAS.get(chave)) || "0", 10) || 0;
  await env.METRICAS.put(chave, String(atual + 1), ttl ? { expirationTtl: ttl } : undefined);
}

async function ler(env, chave) {
  return parseInt((await env.METRICAS.get(chave)) || "0", 10) || 0;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/_m/e") {
      let ev = "";
      try { ev = String((JSON.parse(await req.text()) || {}).ev || ""); } catch (e) {}
      if (VALIDOS.has(ev)) {
        await somar(env, "t:" + ev);                       /* total de sempre */
        await somar(env, "d:" + hoje() + ":" + ev, 400 * DIA); /* por dia, 400 dias */
      }
      /* 204 sem corpo: o sendBeacon nao espera resposta */
      return new Response(null, { status: 204 });
    }

    if (req.method === "GET" && url.pathname === "/_m/r/" + env.SEGREDO) {
      return relatorio(env);
    }

    return new Response("nao encontrado", { status: 404 });
  }
};

async function relatorio(env) {
  const totais = {};
  for (const [k] of [...FUNIL, ...AVULSOS]) totais[k] = await ler(env, "t:" + k);

  /* ultimos 14 dias, para ver se esta vivo e se algum dia destoa */
  const dias = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * DIA * 1000).toISOString().slice(0, 10);
    const linha = { dia: d };
    for (const [k] of FUNIL) linha[k] = await ler(env, "d:" + d + ":" + k);
    dias.push(linha);
  }

  const base = totais[FUNIL[0][0]] || 0;
  const pct = (n) => (base ? Math.round((n / base) * 100) : 0);

  /* a maior queda entre duas etapas e o que precisa ser consertado */
  let pior = null;
  for (let i = 1; i < FUNIL.length; i++) {
    const de = totais[FUNIL[i - 1][0]], para = totais[FUNIL[i][0]];
    if (de > 0) {
      const perda = de - para;
      if (!pior || perda > pior.perda) pior = { perda, de: FUNIL[i - 1][1], para: FUNIL[i][1], i };
    }
  }

  const linhas = FUNIL.map(([k, rotulo], i) => {
    const n = totais[k], p = pct(n);
    const anterior = i ? totais[FUNIL[i - 1][0]] : n;
    const queda = i && anterior ? Math.round(((anterior - n) / anterior) * 100) : 0;
    return `<tr${pior && pior.i === i ? ' class="pior"' : ""}>
      <td class="rot">${rotulo}</td>
      <td class="num">${n}</td>
      <td class="bar"><span style="width:${p}%"></span></td>
      <td class="pc">${p}%</td>
      <td class="qd">${i && queda > 0 ? "-" + queda + "%" : ""}</td>
    </tr>`;
  }).join("");

  const temDado = base > 0;
  const tabelaDias = dias.map(l => `<tr><td>${l.dia.slice(8)}/${l.dia.slice(5, 7)}</td>` +
    FUNIL.map(([k]) => `<td>${l[k] || ""}</td>`).join("") + "</tr>").join("");

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Funil do Pedro</title>
<style>
 :root{--bg:#0F0D17;--card:#171426;--line:#272238;--ink:#EDEAF6;--mut:#8F88A6;--vio:#A78BFA;--ok:#34D399;--al:#F0A45E}
 *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);
   font:16px/1.6 system-ui,-apple-system,sans-serif;padding:28px 18px 60px}
 .w{max-width:720px;margin:0 auto}
 h1{font-size:24px;margin:0 0 4px;letter-spacing:-.02em}
 .sub{color:var(--mut);font-size:14px;margin:0 0 26px}
 h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--mut);
    margin:30px 0 12px;padding-bottom:9px;border-bottom:1px solid var(--line)}
 table{width:100%;border-collapse:collapse}
 td,th{padding:9px 6px;font-size:14px;vertical-align:middle}
 .rot{color:var(--ink)} .num{text-align:right;font-variant-numeric:tabular-nums;font-weight:600;width:52px}
 .pc{text-align:right;color:var(--mut);font-variant-numeric:tabular-nums;width:48px}
 .qd{text-align:right;color:var(--al);font-variant-numeric:tabular-nums;width:56px;font-size:13px}
 .bar{width:38%} .bar span{display:block;height:9px;border-radius:5px;
   background:linear-gradient(90deg,var(--vio),#7C3AED);min-width:2px}
 tr.pior .rot{color:var(--al);font-weight:600}
 .aviso{background:#1E1A2E;border:1px solid var(--line);border-radius:12px;padding:16px 18px;
   color:var(--mut);font-size:14px;margin-top:8px}
 .aviso b{color:var(--ink)}
 .dias{overflow-x:auto} .dias table{min-width:520px}
 .dias td,.dias th{font-size:12.5px;text-align:center;color:var(--mut);
   font-variant-numeric:tabular-nums;padding:6px 4px}
 .dias th{color:var(--mut);font-weight:600;border-bottom:1px solid var(--line)}
 .dias td:first-child{color:var(--ink)}
 .pe{color:var(--mut);font-size:13px;margin-top:26px;border-top:1px solid var(--line);padding-top:16px}
</style></head><body><div class="w">
<h1>Funil do Pedro</h1>
<p class="sub">De cada pessoa que toca numa silhueta, quantas chegam no WhatsApp.</p>

${temDado ? `<table>${linhas}</table>
${pior && pior.perda > 0 ? `<div class="aviso">Maior perda: entre <b>${pior.de}</b> e <b>${pior.para}</b>, ${pior.perda} ${pior.perda === 1 ? "pessoa" : "pessoas"}. É esse degrau que vale consertar primeiro.</div>` : ""}` :
`<div class="aviso">Ainda não chegou nenhum evento. Se o site já está no ar, é porque ninguém respondeu a primeira pergunta ainda — ou faz poucos minutos que isso foi ligado.</div>`}

<h2>Retomadas</h2>
<table><tr><td class="rot">${AVULSOS[0][1]}</td><td class="num">${totais[AVULSOS[0][0]]}</td></tr></table>

<h2>Últimos 14 dias</h2>
<div class="dias"><table>
<tr><th>dia</th>${FUNIL.map(([k]) => `<th>${k.replace("quiz_", "").replace("resultado", "fim")}</th>`).join("")}</tr>
${tabelaDias}
</table></div>

<p class="pe">Só contagem: nada de IP, nome ou cookie. Com pouco movimento os números são pista, não prova — vinte conversas dizem mais sobre qualidade do que esta tabela.</p>
</div></body></html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
}
