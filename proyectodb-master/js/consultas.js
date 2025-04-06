const BASE_URL = "http://localhost:4000"; // jose cambia esto si tu backend usa otro puerto

async function consultarCartasPorColeccion() {
  const id = document.getElementById("coleccionId").value;

  if (!id) {
    document.getElementById("cartasResultado").innerText = "Por favor, ingresa un ID de colección.";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/cartas?coleccionId=${id}`, { credentials: "include" });

    if (!res.ok) {
      const errorData = await res.json();
      document.getElementById("cartasResultado").innerText = `Error: ${errorData.error || res.statusText}`;
      return;
    }

    const data = await res.json();
    document.getElementById("cartasResultado").innerText = JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error al consultar cartas:", error);
    document.getElementById("cartasResultado").innerText = "Error al consultar cartas. Revisa la consola para más detalles.";
  }
}

async function consultarColeccionesPorCarta() {
  const id = document.getElementById("cartaId").value;

  if (!id) {
    document.getElementById("coleccionesResultado").innerText = "Por favor, ingresa un ID de carta.";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/colecciones/carta?cartaId=${id}`, { credentials: "include" });

    if (!res.ok) {
      const errorText = await res.json(); // Intenta leer el error como texto
      document.getElementById("coleccionesResultado").innerText = `Error: ${errorText}`;
      return;
    }

    const data = await res.json();
    document.getElementById("coleccionesResultado").innerText = JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error al consultar colecciones:", error);
    document.getElementById("coleccionesResultado").innerText = "Error al consultar colecciones. Revisa la consola para más detalles.";
  }
}

async function consultarCategorias() {
  const id = document.getElementById("coleccionIdCat").value;
  const res = await fetch(`${BASE_URL}/categorias?coleccionId=${id}`, { credentials: "include" });
  const data = await res.json();
  document.getElementById("categoriasResultado").innerText = JSON.stringify(data, null, 2);
}

async function consultarPorColorYFecha() {
  const color = document.getElementById("color").value;
  const fechaInicio = document.getElementById("fechaInicio").value;
  const fechaFin = document.getElementById("fechaFin").value;
  const multicolor = document.getElementById("multicolor").checked;

  const url = `${BASE_URL}/cartas-por-color?color=${color}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&multicolor=${multicolor}`;
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  document.getElementById("colorResultado").innerText = JSON.stringify(data, null, 2);
}
