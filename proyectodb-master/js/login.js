document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submit');

    // Validación del formulario
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevenir envío por defecto
        console.log('Formulario enviado'); // Depuración

        // Validar campos
        if(validateInputs()) {
            console.log('Campos validados correctamente'); // Depuración
            simulateLogin().catch(error => {
                alert('Error: ' + error.message);
                console.error(error); // Log para depuración
            });
        } else {
            console.log('Validación fallida'); // Depuración
        }
    });

    // Función para validar los campos
    function validateInputs() {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        let isValid = true;

        // Validar email
        if(emailValue === '') {
            setErrorFor(emailInput, 'El email es obligatorio');
            isValid = false;
        } else if(!isValidEmail(emailValue)) {
            setErrorFor(emailInput, 'El email no es válido');
            isValid = false;
        } else {
            setSuccessFor(emailInput);
        }

        // Validar contraseña
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

    // Funciones auxiliares para mostrar errores/éxito
    function setErrorFor(input, message) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small');
        
        // Agregar mensaje de error si no existe
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

    // Validar formato de email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Simular proceso de login (en un caso real sería una petición al servidor)
    async function simulateLogin() {
        const loginData = {
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
        };

        console.log('Datos de login:', loginData); // Depuración

        submitButton.disabled = true;
        submitButton.textContent = 'Iniciando sesión...';
        submitButton.style.opacity = '0.7';

        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error en la respuesta del servidor:', errorData); // Depuración
                throw new Error(errorData.message || 'Error en el inicio de sesión');
            }

            const data = await response.json();
            console.log('Respuesta del servidor:', data); // Depuración

            const messageContainer = document.getElementById('message-container') || createMessageContainer();

            if (data.success) {
                messageContainer.textContent = 'Inicio de sesión exitoso.';
                messageContainer.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirigir a la página principal
                }, 2000); // Redirigir después de 2 segundos
            } else {
                messageContainer.textContent = 'Inicio de sesión fallido. Por favor, verifica tus credenciales.';
                messageContainer.style.color = 'red';
            }
        } catch (error) {
            console.error('Error durante el login:', error); // Depuración
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
});