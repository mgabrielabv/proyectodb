// Referencias a los elementos del DOM
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submit');
const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

// Manejador del evento submit del formulario
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    await handleLogin();
});

async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validación básica
    if (!email || !password) {
        showMessage('Por favor complete todos los campos', 'red');
        return;
    }

    setLoadingState(true);
    messageElement.textContent = '';

    try {
        // 1. Verificar credenciales básicas
        const loginResponse = await fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            throw new Error(loginData.message || 'Error en el inicio de sesión');
        }

        // 2. Si es admin, preguntar si quiere ingresar como admin
        if (loginData.isAdmin) {
            const wantsAdminAccess = confirm('¿Desea ingresar como administrador?');
            
            if (wantsAdminAccess) {
                const adminCode = prompt('Ingrese su código de administrador:');
                
                if (adminCode) {
                    // 3. Verificar código admin
                    const codeResponse = await fetch('http://localhost:4000/verify-admin-code', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            email,
                            admin_code: adminCode 
                        })
                    });

                    const codeData = await codeResponse.json();

                    if (!codeResponse.ok) {
                        throw new Error(codeData.message || 'Código incorrecto');
                    }

                    // 4. Redirigir a admin.html si el código es correcto
                    showMessage('Acceso concedido como administrador', 'green');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                    return;
                } else {
                    throw new Error('Debe ingresar el código de administrador');
                }
            }
        }

        // 5. Redirigir a consultas.html para usuarios normales o admins que no ingresaron código
        showMessage('Inicio de sesión exitoso', 'green');
        setTimeout(() => {
            window.location.href = 'consultas.html';
        }, 1500);

    } catch (error) {
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