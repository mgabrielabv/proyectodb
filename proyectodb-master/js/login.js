document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submit');

    // Validación del formulario
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevenir envío por defecto
        console.log('Formulario enviado');

        if(validateInputs()) {
            console.log('Campos validados correctamente');
            simulateLogin().catch(error => {
                alert('Error: ' + error.message);
                console.error(error);
            });
        } else {
            console.log('Validación fallida');
        }
    });

    function validateInputs() {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        let isValid = true;

        if(emailValue === '') {
            setErrorFor(emailInput, 'El email es obligatorio');
            isValid = false;
        } else if(!isValidEmail(emailValue)) {
            setErrorFor(emailInput, 'El email no es válido');
            isValid = false;
        } else {
            setSuccessFor(emailInput);
        }

        if(passwordValue === '') {
            setErrorFor(passwordInput, 'La contraseña es obligatoria');
            isValid = false;
        } else if(passwordValue.length < 6) {
            setErrorFor(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        } else {
            setSuccessFor(passwordInput);
        }

        return isValid;
    }

    function setErrorFor(input, message) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small');

        if(!small) {
            const errorElement = document.createElement('small');
            errorElement.style.color = 'red';
            errorElement.style.display = 'block';
            errorElement.style.margin = '5px 0 10px 10%';
            errorElement.style.fontSize = '12px';
            errorElement.textContent = message;
            formControl.appendChild(errorElement);
        } else {
            small.textContent = message;
        }

        input.style.borderColor = 'red';
    }

    function setSuccessFor(input) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small');

        if(small) {
            small.remove();
        }

        input.style.borderColor = 'skyblue';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async function simulateLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        let loginData = { email, password };

        submitButton.disabled = true;
        submitButton.textContent = 'Iniciando sesión...';
        submitButton.style.opacity = '0.7';

        try {
            // Primera petición sin código
            let response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const messageContainer = document.getElementById('message-container') || createMessageContainer();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el inicio de sesión');
            }

            let data = await response.json();

            if (data.success && data.isAdmin) {
                // Solicitar código solo si es admin
                const admin_code = prompt('Introduce tu código de administrador:');
                if (!admin_code) {
                    messageContainer.textContent = 'Código de administrador requerido.';
                    messageContainer.style.color = 'red';
                    return;
                }

                // Reenviar con código admin
                loginData.admin_code = admin_code;
                response = await fetch('http://localhost:4000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Código incorrecto');
                }

                data = await response.json();

                if (data.success) {
                    messageContainer.textContent = 'Inicio de sesión exitoso como administrador.';
                    messageContainer.style.color = 'green';
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 2000);
                } else {
                    messageContainer.textContent = 'Código de administrador incorrecto.';
                    messageContainer.style.color = 'red';
                }
            } else if (data.success) {
                // Usuario normal
                messageContainer.textContent = 'Inicio de sesión exitoso.';
                messageContainer.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'consultas.html';
                }, 2000);
            } else {
                messageContainer.textContent = 'Inicio de sesión fallido. Verifica tus credenciales.';
                messageContainer.style.color = 'red';
            }
        } catch (error) {
            const messageContainer = document.getElementById('message-container') || createMessageContainer();
            messageContainer.textContent = 'Error: ' + error.message;
            messageContainer.style.color = 'red';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Iniciar sesión';
            submitButton.style.opacity = '1';
        }
    }

    function createMessageContainer() {
        const container = document.createElement('div');
        container.id = 'message-container';
        container.style.marginTop = '10px';
        container.style.fontSize = '14px';
        loginForm.appendChild(container);
        return container;
    }

    const logoutButton = document.getElementById('logout'); // Ensure there's a button with id 'logout'

    if (logoutButton) {
        logoutButton.addEventListener('click', async function() {
            try {
                const response = await fetch('http://localhost:4000/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    alert('Error al cerrar sesión: ' + (errorData.message || response.statusText));
                    return;
                }

                alert('Sesión cerrada exitosamente.');
                window.location.href = 'login.html'; // Redirect to login page
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error interno al cerrar sesión.');
            }
        });
    }
});
