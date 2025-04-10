document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = "http://localhost:4000"; // Ajusta según tu configuración

    // Elementos del DOM
    const tableNameInput = document.getElementById('tabla');
    const insertBtn = document.getElementById('insertBtn');
    const viewBtn = document.getElementById('viewBtn');
    const updateBtn = document.getElementById('updateBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const resultsContainer = document.getElementById('message-container');

    const usernameInput = document.getElementById('searchUser');
    const searchButton = document.getElementById('searchButton');

    const magicModal = document.getElementById('magicModal');
    const modalTitle = document.getElementById('modalTitle');
    const dynamicForm = document.getElementById('dynamicForm');
    const submitFormBtn = document.getElementById('submitFormBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const closeModal = document.querySelector('.close-modal');

    // Variables de estado
    let currentAction = '';
    let currentTable = '';
    let currentRecordId = '';

    // Event Listeners
    viewBtn.addEventListener('click', showTableRecords);
    insertBtn.addEventListener('click', showCreateForm);
    updateBtn.addEventListener('click', showUpdateForm);
    deleteBtn.addEventListener('click', showDeleteForm);
    searchButton.addEventListener('click', searchUser);
    submitFormBtn.addEventListener('click', handleFormSubmit);
    cancelFormBtn.addEventListener('click', closeModalWindow);
    closeModal.addEventListener('click', closeModalWindow);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === magicModal) {
            closeModalWindow();
        }
    });

    // Verificar sesión al cargar la página
    checkAdminSession();

    // Función para verificar la sesión de administrador
    async function checkAdminSession() {
        try {
            const response = await fetch(`${BASE_URL}/api/admin/check-session`, {
                method: 'GET',
                credentials: 'include' // Importante para enviar cookies de sesión
            });

            if (!response.ok) {
                window.location.href = '/login.html'; // Redirigir si no hay sesión
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
            window.location.href = '/login.html';
        }
    }

    // Funciones principales
    async function showTableRecords() {
        const tableName = tableNameInput.value.trim();
        if (!tableName) {
            showMessage('Por favor ingresa un nombre de tabla', 'error');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/admin/tables/${tableName}`, {
                method: 'GET',
                credentials: 'include' // Envía las cookies de sesión
            });

            const data = await response.json();

            if (response.ok) {
                displayTableResults(data.data);
            } else {
                showMessage(data.error || 'Error al obtener registros', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión', 'error');
        }
    }

    async function showCreateForm() {
        const tableName = tableNameInput.value.trim();
        if (!tableName) {
            showMessage('Por favor ingresa un nombre de tabla', 'error');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/admin/tables/${tableName}/structure`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                currentAction = 'create';
                currentTable = tableName;
                modalTitle.textContent = `Crear Registro en ${tableName}`;
                createDynamicForm(data.structure);
                openModalWindow();
            } else {
                showMessage(data.error || 'Error al obtener estructura', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al cargar el formulario', 'error');
        }
    }

    async function showUpdateForm() {
        const tableName = tableNameInput.value.trim();
        if (!tableName) {
            showMessage('Por favor ingresa un nombre de tabla', 'error');
            return;
        }

        const id = prompt("Ingresa el ID del registro que deseas actualizar:");
        if (!id) return;

        try {
            const response = await fetch(`${BASE_URL}/api/admin/tables/${tableName}/${id}`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                currentAction = 'update';
                currentTable = tableName;
                currentRecordId = id;
                modalTitle.textContent = `Actualizar Registro en ${tableName}`;
                createDynamicForm(data.data);
                openModalWindow();
            } else {
                showMessage(data.error || 'Error al obtener registro', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al cargar el formulario', 'error');
        }
    }

    async function showDeleteForm() {
        const tableName = tableNameInput.value.trim();
        if (!tableName) {
            showMessage('Por favor ingresa un nombre de tabla', 'error');
            return;
        }

        const id = prompt("Ingresa el ID del registro que deseas eliminar:");
        if (!id) return;

        if (!confirm(`¿Estás seguro de eliminar el registro con ID ${id}?`)) return;

        try {
            const response = await fetch(`${BASE_URL}/api/admin/tables/${tableName}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Registro eliminado exitosamente', 'success');
                showTableRecords();
            } else {
                showMessage(data.error || 'Error al eliminar registro', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión', 'error');
        }
    }

    async function searchUser() {
        const username = usernameInput.value.trim();
        if (!username) {
            showMessage('Por favor ingresa un nombre de usuario', 'error');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/admin/users?username=${username}`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                displayUserDetails(data.user);
            } else {
                showMessage(data.error || 'Usuario no encontrado', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión', 'error');
        }
    }

    async function handleFormSubmit() {
        const formData = new FormData(dynamicForm);
        const recordData = {};
        formData.forEach((value, key) => {
            if (value) recordData[key] = value;
        });

        try {
            let endpoint = '';
            let method = '';
            
            if (currentAction === 'create') {
                endpoint = `${BASE_URL}/api/admin/tables/${currentTable}`;
                method = 'POST';
            } else if (currentAction === 'update') {
                endpoint = `${BASE_URL}/api/admin/tables/${currentTable}/${currentRecordId}`;
                method = 'PUT';
            }

            const response = await fetch(endpoint, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recordData)
            });

            const data = await response.json();

            if (response.ok) {
                const successMessage = currentAction === 'create' 
                    ? 'Registro creado exitosamente' 
                    : 'Registro actualizado exitosamente';
                
                showMessage(successMessage, 'success');
                closeModalWindow();
                showTableRecords();
            } else {
                showMessage(data.error || 'Error al procesar la solicitud', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión', 'error');
        }
    }

    function createDynamicForm(fields) {
        dynamicForm.innerHTML = '';
        
        Object.keys(fields).forEach(key => {
            // No mostrar campos internos como passwords o tokens
            if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) return;
            
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.textContent = key;
            label.htmlFor = key;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = key;
            input.name = key;
            input.value = fields[key] || '';
            
            if (key.toLowerCase() === 'id' || key.toLowerCase().includes('_id')) {
                input.disabled = true;
            }
            
            formGroup.appendChild(label);
            formGroup.appendChild(input);
            dynamicForm.appendChild(formGroup);
        });
    }

    function displayTableResults(records) {
        resultsContainer.innerHTML = '';
        
        if (!records || records.length === 0) {
            showMessage('No hay registros disponibles', 'info');
            return;
        }
        
        const table = document.createElement('table');
        table.className = 'results-table';
        
        // Crear encabezados
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        Object.keys(records[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Crear cuerpo de la tabla
        const tbody = document.createElement('tbody');
        
        records.forEach(record => {
            const row = document.createElement('tr');
            
            Object.values(record).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value !== null ? value : 'NULL';
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        resultsContainer.appendChild(table);
    }

    function displayUserDetails(user) {
        resultsContainer.innerHTML = '';
        
        if (!user) {
            showMessage('No se encontró el usuario', 'error');
            return;
        }
        
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        
        const title = document.createElement('h3');
        title.textContent = 'Detalles del Usuario';
        
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        
        Object.keys(user).forEach(key => {
            // No mostrar campos sensibles
            if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) return;
            
            const infoRow = document.createElement('div');
            infoRow.className = 'info-row';
            
            const label = document.createElement('span');
            label.className = 'info-label';
            label.textContent = `${key}: `;
            
            const value = document.createElement('span');
            value.className = 'info-value';
            value.textContent = user[key] !== null ? user[key] : 'NULL';
            
            infoRow.appendChild(label);
            infoRow.appendChild(value);
            userInfo.appendChild(infoRow);
        });
        
        userCard.appendChild(title);
        userCard.appendChild(userInfo);
        resultsContainer.appendChild(userCard);
    }

    function showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }

    function openModalWindow() {
        magicModal.style.display = 'block';
    }

    function closeModalWindow() {
        magicModal.style.display = 'none';
        dynamicForm.innerHTML = '';
        currentAction = '';
        currentTable = '';
        currentRecordId = '';
    }
});