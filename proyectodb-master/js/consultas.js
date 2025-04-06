const BASE_URL = "http://localhost:3000"; // jose cambia esto si tu backend usa otro puerto

async function consultarCartasPorColeccion() {
  const id = document.getElementById("coleccionId").value;
  const res = await fetch(`${BASE_URL}/cartas?coleccionId=${id}`, { credentials: "include" });
  const data = await res.json();
  document.getElementById("cartasResultado").innerText = JSON.stringify(data, null, 2);
}

async function consultarColeccionesPorCarta() {
  const id = document.getElementById("cartaId").value;
  const res = await fetch(`${BASE_URL}/colecciones?cartaId=${id}`, { credentials: "include" });
  const data = await res.json();
  document.getElementById("coleccionesResultado").innerText = JSON.stringify(data, null, 2);
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
