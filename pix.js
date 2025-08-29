import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { amount, chave, descricao } = req.body;

    const response = await axios.post(
      "https://api.witetec.com/v1/pix", // confirme na doc se este é o endpoint correto
      {
        amount,        // em centavos
        pixKey: chave, // chave Pix do recebedor
        description: descricao
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WITETEC_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Erro ao gerar Pix" });
  }
}