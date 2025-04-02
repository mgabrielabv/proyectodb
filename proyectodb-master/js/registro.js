document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const messageContainer = document.getElementById('message-container') || createMessageContainer();

    if (password !== confirmPassword) {
      messageContainer.textContent = 'Las contraseñas no coinciden.';
      messageContainer.style.color = 'red';
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        messageContainer.textContent = 'Registro exitoso.';
        messageContainer.style.color = 'green';
        setTimeout(() => {
          window.location.href = 'login.html'; // Redirigir al login
        }, 2000);
      } else {
        messageContainer.textContent = `Error: ${result.message}`;
        messageContainer.style.color = 'red';
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      messageContainer.textContent = 'Ocurrió un error al intentar registrarse.';
      messageContainer.style.color = 'red';
    }
  });

  function createMessageContainer() {
    const container = document.createElement('div');
    container.id = 'message-container';
    container.style.marginTop = '10px';
    container.style.fontSize = '14px';
    document.getElementById('registerForm').appendChild(container);
    return container;
  }
});
