// Referencias a los elementos del DOM
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submit');
const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');
const adminCodeContainer = document.getElementById('adminCodeContainer');
const adminCodeInput = document.getElementById('adminCode');

// Manejador del evento submit del formulario
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault(); // Previene el envío tradicional del formulario
    await handleLogin();
});

async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const adminCode = adminCodeInput ? adminCodeInput.value.trim() : null;

    // Validación básica de campos
    if (!email || !password) {
        showMessage('Por favor complete todos los campos', 'red');
        return;
    }

    // Preparar datos para enviar
    const loginData = { email, password };
    if (adminCode) loginData.admin_code = adminCode;

    // Estado de carga
    setLoadingState(true);

    try {
        // Primera verificación de login
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

        // Manejo de administrador
        if (data.isAdmin) {
            if (!adminCode) {
                const wantsAdminAccess = confirm('¿Desea ingresar como administrador?');
                
                if (wantsAdminAccess) {
                    adminCodeContainer.style.display = 'block';
                    showMessage('Ingrese su código de administrador', 'blue');
                    setLoadingState(false);
                    return;
                }
            } else {
                // Verificar código admin si se proporcionó
                const codeResponse = await verifyAdminCode(email, adminCode);
                if (codeResponse.ok) {
                    showMessage('Acceso concedido como administrador', 'green');
                    redirectTo('admin.html');
                    return;
                }
            }
        }

        // Redirección para usuarios normales o admins sin código
        showMessage('Inicio de sesión exitoso', 'green');
        redirectTo('consultas.html');

    } catch (error) {
        showMessage(error.message, 'red');
    } finally {
        setLoadingState(false);
    }
}

async function verifyAdminCode(email, code) {
    const response = await fetch('http://localhost:4000/verify-admin-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email,
            admin_code: code 
        })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Código incorrecto');
    }
    
    return response;
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

function redirectTo(page) {
    setTimeout(() => {
        window.location.href = page;
    }, 1500);
}

// Mostrar/ocultar campo de código admin si es necesario
if (adminCodeContainer) {
    adminCodeContainer.style.display = 'none';
}