// Referencias a los elementos del DOM
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const adminCheckbox = document.getElementById('adminCheckbox');
const adminCodeContainer = document.getElementById('adminCodeContainer');
const adminCodeInput = document.getElementById('adminCode');
const submitButton = document.getElementById('submit');
const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

// Mostrar/ocultar campo de código admin
adminCheckbox.addEventListener('change', function() {
    adminCodeContainer.style.display = this.checked ? 'block' : 'none';
    if (!this.checked) adminCodeInput.value = '';
});

// Manejador del evento submit del formulario
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    await handleLogin();
});

async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const isAdmin = adminCheckbox.checked;
    const adminCode = isAdmin ? adminCodeInput.value.trim() : null;

    // Validación básica
    if (!email || !password) {
        showMessage('Por favor complete todos los campos', 'red');
        return;
    }

    if (isAdmin && !adminCode) {
        showMessage('Por favor ingrese el código de administrador', 'red');
        return;
    }

    setLoadingState(true);
    messageElement.textContent = '';

    try {
        // Datos para enviar al servidor
        const loginData = { email, password };
        if (isAdmin) {
            loginData.admin_code = adminCode; // Ensure the key matches the back-end expectation
        }

        // 1. Verificar credenciales y código admin si aplica
        const response = await fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en el inicio de sesión');
        }

        // 2. Redirigir según el tipo de usuario
        if (isAdmin && data.isAdmin) {
            showMessage('Acceso administrativo concedido', 'green');
            setTimeout(() => {
                window.location.href = 'admin.html'; // Redirigir a admin.html
            }, 1500);
        } else if (!isAdmin) {
            showMessage('Inicio de sesión exitoso', 'green');
            setTimeout(() => {
                window.location.href = 'consultas.html'; // Redirigir a consultas.html
            }, 1500);
        } else {
            showMessage('No tiene permisos de administrador', 'red');
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'red');
    } finally {
        setLoadingState(false);
    }
}

function showMessage(message, color) {
    messageElement.textContent = message;
    messageElement.style.color = color;
}

function setLoadingState(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading 
        ? '<span class="spinner"></span> Procesando...' 
        : 'Iniciar sesión';
}