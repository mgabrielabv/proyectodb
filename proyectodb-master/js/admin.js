document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = "http://localhost:4000"; // Define BASE_URL

    // Elementos del DOM
    const tableNameInput = document.getElementById('tableName');
    const getTableBtn = document.getElementById('getTableBtn');
    const createRecordBtn = document.getElementById('createRecordBtn');
    const tableResults = document.getElementById('tableResults');
    
    const usernameInput = document.getElementById('username');
    const searchUserBtn = document.getElementById('searchUserBtn');
    const userResults = document.getElementById('userResults');
    
    const magicModal = document.getElementById('magicModal');
    const modalTitle = document.getElementById('modalTitle');
    const dynamicForm = document.getElementById('dynamicForm');
    const submitFormBtn = document.getElementById('submitFormBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const closeModal = document.querySelector('.close-modal');

    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }

    // Variables de estado
    let currentAction = '';
    let currentTable = '';
    let currentRecordId = '';

    // Event Listeners
    if (getTableBtn) {
        getTableBtn.addEventListener('click', showTableRecords);
    }
    if (createRecordBtn) {
        createRecordBtn.addEventListener('click', showCreateForm);
    }
    if (searchUserBtn) {
        searchUserBtn.addEventListener('click', searchUser);
    }
    if (submitFormBtn) {
        submitFormBtn.addEventListener('click', handleFormSubmit);
    }
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', closeModalWindow);
    }
    if (closeModal) {
        closeModal.addEventListener('click', closeModalWindow);
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === magicModal) {
            closeModalWindow();
        }
    });

    // Funciones principales
    async function showTableRecords() {
        const tableName = tableNameInput.value.trim();
        if (!tableName) {
            showMessage(tableResults, 'Por favor ingresa un nombre de tabla', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/admin/tables/${tableName}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                displayTableResults(data.data, tableResults);
            } else {
                showMessage(tableResults, data.error || 'Error al obtener registros', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(tableResults, 'Error de conexión', 'error');
        }
    }

    async function showCreateForm() {
        const tableName = tableNameInput.value.trim();
        if (!tableName) {
            showMessage(tableResults, 'Por favor ingresa un nombre de tabla', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/admin/tables/${tableName}/structure`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                currentAction = 'create';
                currentTable = tableName;
                modalTitle.textContent = `Crear Registro en ${tableName}`;
                createDynamicForm(data.structure, dynamicForm);
                openModalWindow();
            } else {
                showMessage(tableResults, data.error || 'Error al obtener estructura', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function searchUser() {
        const username = usernameInput.value.trim();
        if (!username) {
            showMessage(userResults, 'Por favor ingresa un nombre de usuario', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${username}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data && data.data.length > 0) {
                    displayUserDetails(data.data[0], userResults);
                    prepareEditForm(data.data[0]);
                } else {
                    showMessage(userResults, 'Usuario no encontrado', 'error');
                }
            } else {
                showMessage(userResults, data.error || 'Error al buscar usuario', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(userResults, 'Error de conexión', 'error');
        }
    }

    function prepareEditForm(user) {
        currentAction = 'edit';
        currentTable = 'users';
        currentRecordId = user.id;
        
        modalTitle.textContent = `Editar Usuario: ${user.username || user.email}`;
        dynamicForm.innerHTML = '';
        
        for (const [fieldName, value] of Object.entries(user)) {
            if (['id', 'createdAt', 'updatedAt', 'password'].includes(fieldName)) continue;
            
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-group magic-input';
            
            const label = document.createElement('label');
            label.textContent = fieldName;
            label.htmlFor = `edit_${fieldName}`;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `edit_${fieldName}`;
            input.name = fieldName;
            input.value = value !== null ? value : '';
            input.className = 'magic-field';
            
            const underline = document.createElement('div');
            underline.className = 'magic-underline';
            
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            fieldDiv.appendChild(underline);
            dynamicForm.appendChild(fieldDiv);
        }
        
        openModalWindow();
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
                endpoint = `/api/admin/tables/${currentTable}`;
                method = 'POST';
            } else if (currentAction === 'edit') {
                endpoint = `/api/admin/tables/${currentTable}/${currentRecordId}`;
                method = 'PUT';
            }

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(recordData)
            });

            const data = await response.json();

            if (response.ok) {
                const successMessage = currentAction === 'create' 
                    ? 'Registro creado exitosamente' 
                    : 'Registro actualizado exitosamente';
                
                showMessage(
                    currentAction === 'create' ? tableResults : userResults,
                    successMessage,
                    'success'
                );
                
                closeModalWindow();
                
                // Actualizar vista
                if (currentAction === 'create') {
                    showTableRecords();
                } else {
                    searchUser();
                }
            } else {
                showMessage(
                    currentAction === 'create' ? tableResults : userResults,
                    data.error || 'Error al procesar la solicitud',
                    'error'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(
                currentAction === 'create' ? tableResults : userResults,
                'Error de conexión',
                'error'
            );
        }
    }

    async function cerrarSesion() {
        try {
            const response = await fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                window.location.href = 'login.html';
            } else {
                const errorData = await response.json();
                console.error('Error al cerrar sesión:', errorData.error);
                showError('Error al cerrar sesión. Intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            showError('Error de conexión al cerrar sesión');
        }
    }

    function showError(message) {
        alert(message); // Replace with a simple alert for error handling
    }

    // Funciones auxiliares
    function displayTableResults(data, container) {
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="no-results">No se encontraron registros</div>';
            return;
        }

        let html = '<table class="magic-table"><thead><tr>';
        
        // Encabezados
        Object.keys(data[0]).forEach(key => {
            html += `<th>${key}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        // Filas
        data.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                const displayValue = value !== null 
                    ? (typeof value === 'object' ? JSON.stringify(value) : value)
                    : '<em>NULL</em>';
                html += `<td>${displayValue}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function displayUserDetails(user, container) {
        let html = '<div class="user-details"><h3>Detalles del Usuario</h3><ul>';
        
        for (const [key, value] of Object.entries(user)) {
            if (key === 'password') continue;
            
            const displayValue = value !== null 
                ? (typeof value === 'object' ? JSON.stringify(value) : value)
                : '<em>NULL</em>';
            
            html += `<li><strong>${key}:</strong> <span>${displayValue}</span></li>`;
        }
        
        html += '</ul></div>';
        container.innerHTML = html;
    }

    function createDynamicForm(structure, formElement) {
        formElement.innerHTML = '';
        
        // Filtrar columnas especiales
        const filteredStructure = Object.entries(structure).filter(
            ([key]) => !['id', 'createdAt', 'updatedAt', 'password'].includes(key)
        );

        filteredStructure.forEach(([fieldName, fieldType]) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'form-group magic-input';
            
            const label = document.createElement('label');
            label.textContent = `${fieldName} (${fieldType.type})`;
            label.htmlFor = fieldName;
            
            const input = document.createElement('input');
            input.type = getInputType(fieldType.type);
            input.id = fieldName;
            input.name = fieldName;
            input.placeholder = `Ingrese ${fieldName}`;
            input.className = 'magic-field';
            
            const underline = document.createElement('div');
            underline.className = 'magic-underline';
            
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            fieldDiv.appendChild(underline);
            formElement.appendChild(fieldDiv);
        });
    }

    function getInputType(sqlType) {
        const typeMap = {
            'string': 'text',
            'text': 'text',
            'integer': 'number',
            'float': 'number',
            'boolean': 'checkbox',
            'date': 'date',
            'dateonly': 'date',
            'datetime': 'datetime-local',
            'default': 'text'
        };
        
        const typeLower = sqlType.toLowerCase();
        return typeMap[typeLower] || typeMap['default'];
    }

    function showMessage(container, message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        container.innerHTML = '';
        container.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (container.contains(messageDiv)) {
                    messageDiv.remove();
                }
            }, 500);
        }, 3000);
    }

    function openModalWindow() {
        magicModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModalWindow() {
        magicModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentAction = '';
        currentTable = '';
        currentRecordId = '';
    }

    function getAuthHeaders() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        };
    }
});