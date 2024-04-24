/**
 * Envía una solicitud POST al servidor para convertir el texto introducido en audio.
 */
function sendTextToSpeechRequest() {
    const textInput = document.getElementById('textInput');  // Obtener el elemento del input de texto
    const text = textInput.value;  // Extraer el texto introducido por el usuario
    if (!text) {
        alert('Por favor, introduce algún texto.');  // Alertar al usuario si el campo de texto está vacío
        return;
    }
    toggleControls(true);  // Deshabilitar los controles de la interfaz durante la operación
    fetch('http://localhost:3000/convert-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())  // Procesar la respuesta como JSON
    .then(data => {
        toggleControls(false);  // Habilitar los controles tras recibir la respuesta
        if (data.path) {
            const audioPlayer = document.getElementById('audioPlayer');  // Obtener el reproductor de audio
            audioPlayer.src = data.path;  // Establecer la fuente del audio
            audioPlayer.onplay = () => { textInput.value = ''; };  // Limpiar el input cuando el audio comience
            audioPlayer.play();  // Reproducir el audio
        } else {
            alert('Error al generar el audio: ' + data.message);  // Alertar si hay un error
        }
    })
    .catch(error => {
        toggleControls(false);  // Habilitar controles si hay un error
        console.error('Error al procesar la solicitud:', error);
        alert('Error al procesar la solicitud: ' + error.message);
    });
}

/**
 * Envía una solicitud POST al servidor para obtener una respuesta de chat y convertirla en audio.
 */
function sendChatAndSpeakRequest() {
    const chatInput = document.getElementById('chatInput');  // Obtener el elemento del input de chat
    const message = chatInput.value;  // Extraer el mensaje introducido por el usuario
    if (!message) {
        alert('Por favor, introduce algún texto para el chat.');  // Alertar al usuario si el campo está vacío
        return;
    }
    toggleControls(true);  // Deshabilitar controles durante la operación
    fetch('http://localhost:3000/chat-and-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())  // Procesar la respuesta como JSON
    .then(data => {
        toggleControls(false);  // Habilitar controles tras recibir la respuesta
        if (data.path) {
            const audioPlayer = document.getElementById('audioPlayer1');  // Obtener el reproductor de audio alternativo
            audioPlayer.src = data.path;  // Establecer la fuente del audio
            audioPlayer.onplay = () => { chatInput.value = ''; };  // Limpiar el input cuando el audio comience
            audioPlayer.play();  // Reproducir el audio
        } else {
            alert('Error al generar el audio: ' + data.message);  // Alertar si hay un error
        }
    })
    .catch(error => {
        toggleControls(false);  // Habilitar controles si hay un error
        console.error('Error al procesar la solicitud:', error);
        alert('Error al procesar la solicitud: ' + error.message);
    });
}

/**
 * Activa o desactiva los controles de entrada y muestra u oculta un cargador.
 * @param {boolean} disable - True para deshabilitar controles, false para habilitar
 */
function toggleControls(disable) {
    document.getElementById('textInput').disabled = disable;  // Desactivar/activar input de texto
    document.getElementById('chatInput').disabled = disable;  // Desactivar/activar input de chat
    document.querySelectorAll('button').forEach(btn => btn.disabled = disable);  // Desactivar/activar todos los botones
    document.getElementById('loader').style.display = disable ? 'block' : 'none';  // Mostrar/ocultar el cargador
}
