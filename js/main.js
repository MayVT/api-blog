// Variables
const listadoArticulosDOM = document.querySelector("#listado-articulos");
const plantillaArticulo = document.querySelector("#plantilla-articulo").content.firstElementChild;
const plantillaLoading = document.querySelector("#loading").content.firstElementChild;
const marcadorDOM = document.querySelector("#marcador");
const urlAPI = "https://jsonplaceholder.typicode.com/";
let articulos = [];
let paginaActual = 1;
const articulosPorPagina = 6;
let observerMarcador = null;

// Funciones

function renderizar() {
    listadoArticulosDOM.innerHTML = "";
    articulos.forEach(function(articulo) {
        const miArticulo = plantillaArticulo.cloneNode(true);
        const tituloArticulo = miArticulo.querySelector("#titulo");
        tituloArticulo.textContent = articulo.title;
        const resumenArticulo = miArticulo.querySelector("#resumen");
        resumenArticulo.textContent = articulo.body;
        listadoArticulosDOM.appendChild(miArticulo);
    });
}


function mostrarLoadingListadoArticulos() {
    const miLoading = plantillaLoading.cloneNode(true);
    marcadorDOM.appendChild(miLoading);
}


function quitarLoadingListadoArticulos() {
    marcadorDOM.innerHTML = "";
}
function avanzarPagina() {
    paginaActual = paginaActual + 1;
    obtenerArticulos();
}

function vigilanteDeMarcador() {
// Creamos un objeto IntersectionObserver
    observerMarcador = new IntersectionObserver((entries) => {
        // Comprobamos todas las intesecciones. En este caso el marcador
        entries.forEach((entry) => {
            // Si es observable, entra
            if (entry.isIntersecting) {
                // Aumentamos la pagina actual
                avanzarPagina();
            }
        });
    });
    observerMarcador.observe(marcadorDOM);
}


async function obtenerArticulos() {
    // Mostramos loading mientras se hace la petición
    mostrarLoadingListadoArticulos();
    // Calculamos los cortes para paginas
    const corteInicio = (paginaActual - 1) * articulosPorPagina;
    const corteFinal = articulosPorPagina;
    // Construimos los parámetros de la URL
    const parametrosURL = new URLSearchParams();
    parametrosURL.set("_start", corteInicio);
    parametrosURL.set("_limit", corteFinal);
    const miFetch = await fetch(`${urlAPI}posts?${parametrosURL.toString()}`);
    const json = await miFetch.json();
    // Dejamos de pasar de página cuando la api ya no nos da mas información
    // -- detenemos el observer, que es quien decide cuando se cambia de página
    if(json.length === 0) {
        observerMarcador.unobserve(marcadorDOM);
    }
    articulos = articulos.concat(json);
    quitarLoadingListadoArticulos();
    renderizar();
}


// Eventos



// Inicio
obtenerArticulos();
vigilanteDeMarcador();
