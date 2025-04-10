async function simulateLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const messageElement = document.getElementById('message');

    let loginData = { email, password };

    submitButton.disabled = true;
    submitButton.textContent = 'Iniciando sesión...';
    messageElement.textContent = '';
    messageElement.style.color = '';

    try {
        // Primera verificación
        let response = await fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        let data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en el inicio de sesión');
        }

        // Si es admin, preguntar si quiere ingresar como admin
        if (data.isAdmin) {
            const wantsAdminAccess = confirm('¿Desea ingresar como administrador?');
            
            if (wantsAdminAccess) {
                const adminCode = prompt('Ingrese su código de administrador:');
                
                if (adminCode) {
                    // Verificar código admin
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

                    // Redirigir a admin.html si el código es correcto
                    messageElement.textContent = 'Acceso concedido como administrador';
                    messageElement.style.color = 'green';
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                    return;
                }
            }
        }

        // Usuario normal o admin que no ingresó código
        messageElement.textContent = 'Inicio de sesión exitoso';
        messageElement.style.color = 'green';
        setTimeout(() => {
            window.location.href = 'consultas.html';
        }, 1500);

    } catch (error) {
        messageElement.textContent = error.message;
        messageElement.style.color = 'red';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Iniciar sesión';
    }
}