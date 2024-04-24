// Importación de módulos necesarios
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');  // Necesario para operaciones de archivo
const path = require('path');

// Inicialización de la aplicación de Express
const app = express();
const port = 3000;

// Middleware para manejar CORS y JSON
app.use(cors());
app.use(bodyParser.json());

// Creación de un directorio para almacenar archivos de audio si no existe
const audioDir = path.join(__dirname, 'audios');
if (!fs.existsSync(audioDir)){
    fs.mkdirSync(audioDir);
}

// Ruta POST para convertir texto a audio usando la API de Eleven Labs
app.post('/convert-to-speech', async (req, res) => {
  const { text } = req.body;
  const apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech/Voz-Id';
  const apiKey = 'API-ElevenLabs-Key'; // Clave de API ficticia

  // Configuración de los datos a enviar a la API
  const requestData = {
    model_id: "eleven_multilingual_v2",
    text: text,
    voice_settings: {
      stability: 1,
      similarity_boost: 1,
      style: 0,
      use_speaker_boost: true
    }
  };

  // Configuración de los encabezados HTTP para la solicitud
  const headers = {
    'Content-Type': 'application/json',
    'xi-api-key': apiKey
  };

  try {
    // Realiza la petición POST y maneja la respuesta
    const response = await axios.post(apiUrl, requestData, { headers: headers, responseType: 'arraybuffer' });
    if (response.data.byteLength === 0) {
        console.error('Recibido un arrayBuffer vacío de la API');
        res.status(500).send('No se recibieron datos de audio');
        return;
    }

    // Guardar el archivo de audio recibido en el servidor
    const audioPath = path.join(audioDir, `audio-${Date.now()}.mp3`);
    fs.writeFile(audioPath, Buffer.from(response.data), err => {
        if (err) {
            console.error('Error al guardar el archivo de audio', err);
            res.status(500).send('Error al guardar el archivo de audio');
            return;
        }
        res.send({ message: 'Audio generado con éxito', path: audioPath });
    });
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    res.status(500).send('Error al procesar la solicitud de texto a voz');
  }
});

// Servidor de Express escuchando en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});

// Configuración de las variables de entorno
require('dotenv').config();

// Configuración del cliente de OpenAI
const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: 'API-OpenAI-Key',
});

// Ruta POST para interactuar con el chat de OpenAI y convertir la respuesta a audio
app.post('/chat-and-speak', async (req, res) => {
    const { message } = req.body;

    try {
        // Hacer la petición al chat de OpenAI y manejar la respuesta
        const chatResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{
                role: "user",
                content: message
            }]
        });

        const responseText = chatResponse.choices[0].message.content.trim();

        // Reutilizar el endpoint de texto a voz para convertir la respuesta a audio
        const apiUrl = 'http://localhost:3000/convert-to-speech';
        const audioResponse = await axios.post(apiUrl, { text: responseText }, { headers: { 'Content-Type': 'application/json' } });

        if (!audioResponse.data.message || !audioResponse.data.path) {
            console.error('No se recibió una ruta de audio válida de la API');
            res.status(500).send('No se recibieron datos de audio');
            return;
        }

        // Enviar respuesta final con la ruta del archivo de audio generado
        const audioPath = audioResponse.data.path;
        res.send({ message: 'Audio generado con éxito', path: audioPath });
        
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        res.status(500).send('Error al procesar la solicitud');
    }
});
