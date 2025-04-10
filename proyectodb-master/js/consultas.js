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

async function consultarOfertasUsuario() {
    const username = document.getElementById("usernameOfertas").value.trim();
    const button = document.querySelector("button[onclick='consultarOfertasUsuario()']");

    if (!username) {
        mostrarError("ofertasResultado", "Por favor, ingresa un nombre de usuario.");
        return;
    }

    try {
        toggleLoading(button, true);
        const response = await fetch(`${BASE_URL}/usuarios/ofertas-estadisticas?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las ofertas del usuario');
        }

        const data = await response.json();
        mostrarResultado("ofertasResultado", data);
    } catch (error) {
        console.error("Error:", error);
        mostrarError("ofertasResultado", `Error: ${error.message}`);
    } finally {
        toggleLoading(button, false);
    }
}

async function consultarCategoriasCartas() {
    const nombre = document.getElementById("coleccionNombreCategorias").value.trim();
    const button = document.querySelector("button[onclick='consultarCategoriasCartas()']");

    if (!nombre) {
        mostrarError("categoriasCartasResultado", "Por favor, ingresa un nombre de colección válido.");
        return;
    }

    try {
        toggleLoading(button, true);
        const response = await fetch(`${BASE_URL}/colecciones/categorias?coleccionNombre=${encodeURIComponent(nombre)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las categorías de cartas');
        }

        const { data } = await response.json(); // Extract 'data' from the response JSON

        if (data && data.length > 0) {
            mostrarResultado("categoriasCartasResultado", data); // Pass the JSON data directly
        } else {
            mostrarError("categoriasCartasResultado", "No se encontraron categorías para esta colección");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarError("categoriasCartasResultado", `Error: ${error.message}`);
    } finally {
        toggleLoading(button, false);
    }
}

async function consultarHistorialUsuario() {
    const username = document.getElementById("usernameHistorial").value.trim();
    const button = document.querySelector("button[onclick='consultarHistorialUsuario()']");
    const resultadoDiv = document.getElementById("historialResultado");

    if (!username) {
        mostrarError("historialResultado", "Por favor, ingresa un nombre de usuario.");
        return;
    }

    try {
        toggleLoading(button, true);
        resultadoDiv.innerHTML = '<div class="loading-message">Cargando transacciones...</div>';

        const response = await fetch(`${BASE_URL}/usuarios/historial-transacciones?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener el historial');
        }

        const { data } = await response.json();

        resultadoDiv.innerHTML = ''; // Limpiar mensaje de carga

        if (!data || data.length === 0) {
            resultadoDiv.innerHTML = '<div class="info">No se encontraron transacciones para este usuario</div>';
            return;
        }

        // Crear tabla de resultados
        const tablaHTML = `
            <table class="tabla-transacciones">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Operación</th>
                        <th>Monto</th>
                        <th>Contraparte</th>
                        <th>Tipo</th>
                        <th>Contacto</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(trans => `
                        <tr>
                            <td>${trans.producto || 'N/A'}</td>
                            <td><span class="badge ${trans.tipo === 'Venta' ? 'badge-venta' : 'badge-compra'}">${trans.tipo}</span></td>
                            <td class="monto">${trans.monto} €</td>
                            <td>${trans.contraparte?.nombre || 'Desconocido'}</td>
                            <td>${trans.contraparte?.tipo || 'N/A'}</td>
                            <td>${trans.contraparte?.contacto || 'No disponible'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="resumen">Total de transacciones: ${data.length}</div>
        `;

        resultadoDiv.innerHTML = tablaHTML;

    } catch (error) {
        console.error("Error en consultarHistorialUsuario:", error);
        resultadoDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
        toggleLoading(button, false);
    }
}

async function consultarPorCombinacionColorYFecha() {
    const colorCombinacion = document.getElementById("colorCombinacion").value;
    const fechaInicio = document.getElementById("fechaInicioCombinacion").value;
    const fechaFin = document.getElementById("fechaFinCombinacion").value;
    const multicolor = document.getElementById("multicolorCombinacion").value;
    const button = document.querySelector("button[onclick='consultarPorCombinacionColorYFecha()']");

    if (!colorCombinacion) {
        mostrarError("combinacionColorResultado", "Por favor, selecciona una combinación de colores.");
        return;
    }

    try {
        toggleLoading(button, true);
        let url = `${BASE_URL}/cartas/filtrarPorColorFecha?color=${encodeURIComponent(colorCombinacion)}`;
        if (fechaInicio) url += `&fechaInicio=${encodeURIComponent(fechaInicio)}`;
        if (fechaFin) url += `&fechaFin=${encodeURIComponent(fechaFin)}`;
        if (multicolor !== "all") url += `&multicolor=${encodeURIComponent(multicolor)}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las cartas por combinación de colores');
        }

        const data = await response.json();
        mostrarResultado("combinacionColorResultado", data);
    } catch (error) {
        console.error("Error:", error);
        mostrarError("combinacionColorResultado", `Error: ${error.message}`);
    } finally {
        toggleLoading(button, false);
    }
}