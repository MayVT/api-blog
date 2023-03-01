// Variables
// _ Listado
const listadoArticulosDOM = document.querySelector("#listado-articulos");
const plantillaArticulo = document.querySelector("#plantilla-articulo").content.firstElementChild;
const loadingDOM = document.querySelector("#loading");
const marcadorDOM = document.querySelector("#marcador");
// - Single page con articulo de blog
const singleDOM = document.querySelector("#single-blog");
const singleTitleDOM = document.querySelector("#single-blog__title");
const singleContentDOM = document.querySelector("#single-blog__content");
const botonVolverDOM = document.querySelector("#boton-volver");
const singleComments = document.querySelector("#single-blog__comments");
// - Comentarios
const plantillaComentario = document.querySelector("#plantilla-comentarios").content.firstElementChild;

// - Data
let articulos = [];
let comments = [];
// - 3 estados : "listado articulos" , "single articulo", "loading"
let estado = "listado articulos";
// - Paginado
let paginaActual = 1;
const articulosPorPagina = 6;
let observerMarcador = null;
// - API
const urlAPI = "https://jsonplaceholder.typicode.com/";

// Funciones

function renderizar() {
    // Comprobar estado
            //--- podemos hacerlo con condicionales o con un switch
            /*if (estado === "listado articulos") {
                singleDOM.classList.add("d-none");
                singleDOM.classList.remove("d-block");
            }
            if (estado === "single articulo") {
                singleDOM.classList.remove("d-none");
                singleDOM.classList.add("d-block");
            }*/
    switch (estado) {
        case "listado articulos":
            singleDOM.classList.add("d-none");
            listadoArticulosDOM.classList.remove("d-none");
            loadingDOM.classList.add("d-none");
            break;
        case "single articulo":
            singleDOM.classList.remove("d-none");
            listadoArticulosDOM.classList.add("d-none");
            loadingDOM.classList.add("d-none");
            break;
        case "loading":
            loadingDOM.classList.remove("d-none");
            break;
    }
    // Borramos el contenido del listado
    listadoArticulosDOM.innerHTML = "";
    // Lista de artículos
    articulos.forEach(function (articulo) {
        // Clonamos la plantilla
        const miTarjetaArticulo = plantillaArticulo.cloneNode(true);
        const tituloTarjetaArticulo = miTarjetaArticulo.querySelector("#titulo");
        tituloTarjetaArticulo.textContent = articulo.title;
        const resumenTarjetaArticulo = miTarjetaArticulo.querySelector("#resumen");
        resumenTarjetaArticulo.textContent = articulo.body;
        // Anyadimos la id al boton de Ver
        const botonVerArticulo = miTarjetaArticulo.querySelector("#ver-articulo");
        botonVerArticulo.dataset.id = articulo.id;
        botonVerArticulo.addEventListener("click", function() {
            obtenerSingleArticulo(articulo.id);
        });
        // Insertamos en el listado
        listadoArticulosDOM.appendChild(miTarjetaArticulo);
    });
    // Lista de comentarios
    singleComments.innerHTML = "";
    comments.forEach(function(comment) {
        const miComentario = plantillaComentario.cloneNode(true);
        const tituloComentario = miComentario.querySelector("#comment__title");
        tituloComentario.textContent = comment.name;
        const emailComentario = miComentario.querySelector("#comment__email");
        emailComentario.textContent = comment.email;
        const cuerpoComentario = miComentario.querySelector("#comment__body");
        cuerpoComentario.textContent = comment.body;
        singleComments.appendChild(miComentario);
    });

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
    // Quitar loading

    // Renderizar
    renderizar();
}

function cambiarEstado(nuevoEstado) {
    estado = nuevoEstado;
    return renderizar();
}

async function obtenerSingleArticulo(id) {
    // Mostrar loading
    cambiarEstado("loading");
    // Obtener datos articulo
    const miFetch = await fetch(`${urlAPI}posts/${id}`);
    // Transforma la respuesta en json
    const json = await miFetch.json();
    // Modificamos el HTML de single
    singleTitleDOM.textContent = json.title;
    singleContentDOM.textContent = json.body;
    // Obtener comentarios del artículo
    const miFetchComments = await fetch(`${urlAPI}posts/${id}/comments`);
    // Transforma la respuesta en json
    comments = await miFetchComments.json();

    // Al terminar de cargar los datos, quitamos loading y cambiamos de estado
    cambiarEstado("single articulo");
}


// Eventos
botonVolverDOM.addEventListener("click", function() {
    cambiarEstado("listado articulos");
});



// Inicio
obtenerArticulos();
vigilanteDeMarcador();
