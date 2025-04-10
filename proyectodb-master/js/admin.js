document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = "http://localhost:4000"; // Define BASE_URL

    // Elementos del DOM
    const tableNameInput = document.getElementById('tabla');
    const insertBtn = document.getElementById('insertBtn');
    const viewBtn = document.getElementById('viewBtn');
    const updateBtn = document.getElementById('updateBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const tableResults = document.getElementById('message-container');

    const usernameInput = document.getElementById('searchUser');
    const searchButton = document.getElementById('searchButton');
    const userResults = document.getElementById('message-container');

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
    if (viewBtn) {
        viewBtn.addEventListener('click', showTableRecords);
    }
    if (insertBtn) {
        insertBtn.addEventListener('click', showCreateForm);
    }
    if (updateBtn) {
        updateBtn.addEventListener('click', showUpdateForm);
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', showDeleteForm);
    }
    if (searchButton) {
        searchButton.addEventListener('click', searchUser);
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

    async function showUpdateForm() {
        const tableName = tableNameInput.value.trim();
        if (!tableName) {
            showMessage(tableResults, 'Por favor ingresa un nombre de tabla', 'error');
            return;
        }

        const id = prompt("Ingresa el ID del registro que deseas actualizar:");
        if (!id) return;

        try {
            const response = await fetch(`/api/admin/tables/${tableName}/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                currentAction = 'edit';
                currentTable = tableName;
                currentRecordId = id;
                modalTitle.textContent = `Actualizar Registro en ${tableName}`;
                createDynamicForm(data.data, dynamicForm);
                openModalWindow();
            } else {
                showMessage(tableResults, data.error || 'Error al obtener registro', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function showDeleteForm() {
        const tableName = tableNameInput.value.trim();
        if (!tableName) {
            showMessage(tableResults, 'Por favor ingresa un nombre de tabla', 'error');
            return;
        }

        const id = prompt("Ingresa el ID del registro que deseas eliminar:");
        if (!id) return;

        try {
            const response = await fetch(`/api/admin/tables/${tableName}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(tableResults, 'Registro eliminado exitosamente', 'success');
                showTableRecords();
            } else {
                showMessage(tableResults, data.error || 'Error al eliminar registro', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(tableResults, 'Error de conexión', 'error');
        }
    }

    async function searchUser() {
        const username = usernameInput.value.trim();
        if (!username) {
            showMessage(userResults, 'Por favor ingresa un nombre de usuario', 'error');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/profile?username=${username}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const contentType = response.headers.get('Content-Type');
            if (!response.ok || !contentType || !contentType.includes('application/json')) {
                showMessage(userResults, 'Error al buscar usuario o respuesta no válida', 'error');
                return;
            }

            const data = await response.json();

            if (data.success && data.user) {
                displayUserDetails(data.user, userResults);
            } else {
                showMessage(userResults, 'Usuario no encontrado', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(userResults, 'Error de conexión', 'error');
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

    function getAuthHeaders() {
        // Retorna los headers necesarios para las solicitudes
        return {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    }

    function createDynamicForm(data, form) {
        form.innerHTML = '';
        Object.entries(data).forEach(([key, value]) => {
            const label = document.createElement('label');
            label.textContent = key;
            const input = document.createElement('input');
            input.name = key;
            input.value = value;
            if (key.toLowerCase().includes('id')) input.disabled = true;
            form.appendChild(label);
            form.appendChild(input);
        });

        // Agregar campo de perfil si es necesario
        const profileLabel = document.createElement('label');
        profileLabel.textContent = 'Perfil';
        const profileInput = document.createElement('input');
        profileInput.name = 'profile'; // Este es el campo que manejaría el perfil
        form.appendChild(profileLabel);
        form.appendChild(profileInput);
    }

    function showMessage(element, message, type) {
        const msg = document.createElement('div');
        msg.classList.add(type === 'error' ? 'error' : 'success');
        msg.textContent = message;
        element.appendChild(msg);
        setTimeout(() => {
            msg.remove();
        }, 5000);
    }

    function displayTableResults(records, container) {
        container.innerHTML = '';
        if (records.length === 0) {
            showMessage(container, 'No hay registros disponibles', 'error');
        } else {
            const table = document.createElement('table');
            const headerRow = document.createElement('tr');
            Object.keys(records[0]).forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            records.forEach(record => {
                const row = document.createElement('tr');
                Object.values(record).forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                });
                table.appendChild(row);
            });

            container.appendChild(table);
        }
    }

    function displayUserDetails(user, container) {
        container.innerHTML = '';
        const userDetails = document.createElement('div');
        userDetails.textContent = `Nombre: ${user.name}, Email: ${user.email}`;
        container.appendChild(userDetails);
    }

    function openModalWindow() {
        magicModal.style.display = 'block';
    }

    function closeModalWindow() {
        magicModal.style.display = 'none';
    }
});
