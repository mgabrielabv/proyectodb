const BASE_URL = "http://localhost:4000";

function mostrarError(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    elemento.innerHTML = `<div class="error">${mensaje}</div>`;
    elemento.style.display = 'block';
}

function mostrarResultado(elementoId, data) {
    const elemento = document.getElementById(elementoId);
    elemento.textContent = JSON.stringify(data, null, 2);
    elemento.style.display = 'block';
}

function toggleLoading(button, show) {
    if (show) {
        button.innerHTML = `<span class="loading"></span> Procesando...`;
        button.disabled = true;
    } else {
        const icon = button.getAttribute('data-icon') || '<i class="fas fa-search"></i>';
        button.innerHTML = `${icon} Consultar`;
        button.disabled = false;
    }
}

// Nueva función para formato de fecha inglés (YYYY-MM-DD)
function formatToEnglishDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function consultarCartasPorColeccion() {
    const nombre = document.getElementById("coleccionNombre").value.trim();
    const button = document.querySelector("button[onclick='consultarCartasPorColeccion()']");
    
    if (!nombre) {
        mostrarError("cartasResultado", "Por favor, ingresa un nombre de colección válido.");
        return;
    }

    try {
        toggleLoading(button, true);
        const response = await fetch(`${BASE_URL}/cartas/coleccion?coleccionNombre=${encodeURIComponent(nombre)}`);
        
        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
                throw new Error("El servidor devolvió una página HTML en lugar de JSON. Verifica el backend.");
            }
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las cartas');
        }

        const data = await response.json();
        mostrarResultado("cartasResultado", data);
    } catch (error) {
        console.error("Error:", error);
        mostrarError("cartasResultado", `Error: ${error.message}`);
    } finally {
        toggleLoading(button, false);
    }
}

async function consultarColeccionesPorCarta() {
    const nombre = document.getElementById("cartaNombre").value.trim();
    const button = document.querySelector("button[onclick='consultarColeccionesPorCarta()']");

    if (!nombre) {
        mostrarError("coleccionesResultado", "Por favor, ingresa un nombre de carta válido.");
        return;
    }

    try {
        toggleLoading(button, true);
        const response = await fetch(`${BASE_URL}/colecciones/por-carta?cartaNombre=${encodeURIComponent(nombre)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las colecciones');
        }

        const data = await response.json();
        mostrarResultado("coleccionesResultado", data);
    } catch (error) {
        console.error("Error:", error);
        mostrarError("coleccionesResultado", `Error: ${error.message}`);
    } finally {
        toggleLoading(button, false);
    }
}

async function consultarCategorias() {
    const nombre = document.getElementById("coleccionNombreCat").value.trim();
    const button = document.querySelector("button[onclick='consultarCategorias()']");

    if (!nombre) {
        mostrarError("categoriasResultado", "Por favor, ingresa un nombre de colección válido.");
        return;
    }

    try {
        toggleLoading(button, true);
        const response = await fetch(`${BASE_URL}/colecciones/categorias?coleccionNombre=${encodeURIComponent(nombre)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las categorías');
        }

        const data = await response.json();
        mostrarResultado("categoriasResultado", data);
    } catch (error) {
        console.error("Error:", error);
        mostrarError("categoriasResultado", `Error: ${error.message}`);
    } finally {
        toggleLoading(button, false);
    }
}

async function consultarPorColorYFecha() {
    const color = document.getElementById("color").value;
    const fechaInicio = formatToEnglishDate(document.getElementById("fechaInicio").value); // Modificado
    const fechaFin = formatToEnglishDate(document.getElementById("fechaFin").value); // Modificado
    const multicolor = document.getElementById("multicolor").checked ? 'true' : 'false';
    const button = document.querySelector("button[onclick='consultarPorColorYFecha()']");

    if (!color) {
        mostrarError("colorResultado", "Por favor, selecciona un color.");
        return;
    }

    try {
        toggleLoading(button, true);
        let url = `${BASE_URL}/cartas/filtrarPorColorFecha?color=${color}&multicolor=${multicolor}`;
        if (fechaInicio) url += `&fechaInicio=${fechaInicio}`;
        if (fechaFin) url += `&fechaFin=${fechaFin}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las cartas por color');
        }

        const data = await response.json();
        mostrarResultado("colorResultado", data);
    } catch (error) {
        console.error("Error:", error);
        mostrarError("colorResultado", `Error: ${error.message}`);
    } finally {
        toggleLoading(button, false);
    }
}

async function consultarMazoInfo() {
    const username = document.getElementById("username").value.trim();
    const mazoNombre = document.getElementById("mazoNombre").value.trim();
    const button = document.querySelector("button[onclick='consultarMazoInfo()']");

    if (!username || !mazoNombre) {
        mostrarError("mazoResultado", "Por favor, ingresa tanto el nombre de usuario como el nombre del mazo.");
        return;
    }

    try {
        toggleLoading(button, true);
        const url = `${BASE_URL}/mazos/por-jugador?username=${encodeURIComponent(username)}&mazoNombre=${encodeURIComponent(mazoNombre)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener la información del mazo');
        }

        const data = await response.json();
        mostrarResultado("mazoResultado", data);
    } catch (error) {
        console.error("Error:", error);
        mostrarError("mazoResultado", `Error: ${error.message}`);
    } finally {
        toggleLoading(button, false);
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
            mostrarError("cartasResultado", 'Error al cerrar sesión. Intenta nuevamente.');
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mostrarError("cartasResultado", 'Error de conexión al cerrar sesión');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }

    document.querySelectorAll('button').forEach(button => {
        if (button.innerHTML.includes('fa-search')) {
            button.setAttribute('data-icon', button.innerHTML);
        }
    });

    console.log('Aplicación de consultas Magic cargada correctamente');
});