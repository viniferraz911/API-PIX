// api/pix.js
import axios from "axios";

const ALLOWED_ORIGINS = [
  "https://casinhalalay.online",
  "https://www.casinhalalay.online",
  // se você visualizar prévias da Lovable em outro domínio, adicione aqui
  // "https://SEU-DOMINIO-DE-PREVIEW"
];

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    // preflight
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { amount, chave, descricao } = req.body;

    const response = await axios.post(
      "https://api.witetec.com/v1/pix", // confirme na doc se este é o endpoint correto
      {
        amount,        // em centavos
        pixKey: chave, // chave Pix do recebedor (ou remova se sua conta tiver chave padrão)
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
    const payload = error.response?.data || { message: error.message };
    console.error("Erro WiteTec:", payload);
    return res.status(500).json({ error: "Erro ao gerar Pix", details: payload });
  }
}
