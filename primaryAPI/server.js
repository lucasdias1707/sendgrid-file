const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Middleware CORS

const app = express();
app.use(cors()); // Habilita CORS

const upload = multer({
  dest: "uploads/", // Diretório temporário para uploads
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB para o upload do arquivo
});

const SECOND_API_URL = "http://localhost:4000/api/send-email";

app.post("/api/forward-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }

    // Lê o arquivo do upload temporário
    const filePath = path.resolve(req.file.path);
    const fileContent = fs.readFileSync(filePath);

    // Faz o encaminhamento do arquivo para a segunda API (com conteúdo Base64)
    const response = await axios.post(
      SECOND_API_URL,
      {
        file: fileContent.toString("base64"), // Envia como Base64
        filename: req.file.originalname, // Nome do arquivo original
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Apaga o arquivo temporário
    fs.unlinkSync(filePath);

    res.status(response.status).json(response.data); // Envia a resposta como JSON
  } catch (error) {
    console.error("Erro ao encaminhar o arquivo:", error);
    res.status(500).json({ error: "Erro ao encaminhar o arquivo." }); // Resposta de erro como JSON
  }
});

app.listen(3000, () => {
  console.log("1ª API rodando em http://localhost:3000");
});
