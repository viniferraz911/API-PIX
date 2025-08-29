// api/pix.js
import axios from "axios";

// Origens fixas (produção)
const FIXED_ORIGINS = new Set([
  "https://casinhalalay.online",
  "https://www.casinhalalay.online",
]);

// Função que valida origens dinâmicas de sandbox da Lovable
function isAllowedOrigin(origin = "") {
  if (FIXED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    // libera qualquer subdomínio *.sandbox.lovable.dev
    if (url.hostname.endsWith(".sandbox.lovable.dev")) return true;
  } catch {
    /* origin vazio ou inválido */
  }
  return false;
}

function applyCors(req, res) {
  const origin = req.headers.origin || "";
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export default async function handler(req, res) {
  applyCors(req, res);

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { amount, chave, descricao } = req.body;

    // ⬇️ Ajuste o endpoint conforme a documentação oficial da WiteTec, se for diferente:
    const response = await axios.post(
      "https://api.witetec.com/v1/pix",
      {
        amount,        // em centavos
        // Se sua conta WiteTec exigir chave no payload, mantenha a linha abaixo.
        // Caso sua conta use "chave padrão", você pode remover o campo pixKey.
        pixKey: chave,
        description: descricao
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WITETEC_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    const details = error.response?.data || { message: error.message };
    console.error("Erro WiteTec:", details);
    return res.status(500).json({ error: "Erro ao gerar Pix", details });
  }
}
