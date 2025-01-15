const express = require("express");
const sendgrid = require("@sendgrid/mail");
const dotenv = require("dotenv");

// Configuração do dotenv
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" })); // Limite de 50MB para o corpo da requisição
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configuração do SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  console.error("Erro: SENDGRID_API_KEY não definido no arquivo .env");
  process.exit(1);
}
sendgrid.setApiKey(SENDGRID_API_KEY);

app.post("/api/send-email", async (req, res) => {
  try {
    const { file, filename } = req.body;

    if (!file || !filename) {
      return res.status(400).send("Arquivo ou nome do arquivo ausente.");
    }

    // Decodificando o conteúdo Base64 de volta para binário
    const fileBuffer = Buffer.from(file, "base64");

    // Configuração do e-mail
    const email = {
      to: "lucas.dortiz17@gmail.com", // Altere para o e-mail de destino
      from: "testes.integration17@gmail.com", // Altere para o e-mail de origem autorizado no SendGrid
      subject: "Arquivo recebido pela API",
      text: "Segue em anexo o arquivo recebido.",
      attachments: [
        {
          content: fileBuffer.toString("base64"), // Convertendo o binário para Base64 para o envio correto
          filename: filename,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    // Envio do e-mail
    await sendgrid.send(email);

    res.status(200).send("E-mail enviado com sucesso.");
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
    res.status(500).send("Erro ao enviar o e-mail.");
  }
});

app.listen(4000, () => {
  console.log("2ª API rodando em http://localhost:4000");
});
