const refreshBtn = document.getElementById('refresh-btn');
const bookTableBody = document.querySelector('#tabla_libros tbody');

const modal = document.querySelector('#modal');
const modalTitulo = document.querySelector('#titulo_modal');
const btnAbrirModal = document.querySelector('#btn-abrir-modal');
const btnCerrarModal = document.querySelector('#close-btn');
const botonGuardar = document.querySelector('#create-btn');
const botonActualizar = document.querySelector('#create-btn');

let IdLibroActual = null; // Variable para almacenar el ID del libro

// * Función para renderizar libros en la tabla
function renderBooks(libros) {
    bookTableBody.innerHTML = '';

    libros.forEach(libro => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${libro.id}</td>
        <td>${libro.titulo}</td>
        <td>${libro.autores}</td>
        <td>${libro.genero}</td>
        <td>${libro.idioma}</td>
        <td>$${libro.precio}</td>
        <td>${libro.disponibilidad}</td>
        <td>${libro.valoracion}</td>
        <td>
        <div class="button_edit">
            <button id="edit_form" data-id="${libro.id}">Editar</button>
            <button id="delete_libro" data-id="${libro.id} data-name="${libro.titulo}">Eliminar</button>
        </div>
        </td>
    `;

        // Aplicar un if para dar estilo a libros agotados
        const libroDisponibilidad = libro.disponibilidad.toLowerCase();
        if (libroDisponibilidad === "no disponible" || libroDisponibilidad === "agotado") {
            row.classList.add('no_disponible');
        }
        bookTableBody.appendChild(row); // Limpia la tabla
    });
}

// * Función para obtener todos los libros
async function fetchBooks() {
    try {
        const response = await fetch('/data/libros.json');
        if (!response.ok) throw new Error('Error al obtener los libros');
        const libros = await response.json();
        renderBooks(libros);
    } catch (error) {
        console.error(error);
    }
}

refreshBtn.addEventListener('click', fetchBooks); // Evento para refrescar la tabla
fetchBooks(); // Cargar libros al inicio

// * Funciones del Modal para añadir libros
// * Abrimos Modal al presionar botón
btnAbrirModal.addEventListener('click', () => {
    modalTitulo.textContent = "Crear Información Libro";
    botonGuardar.textContent = "Crear";

    // Limpiar los campos del formulario
    document.getElementById('titulo').value = '';
    document.getElementById('autores').value = '';
    document.getElementById('genero').value = '';
    document.getElementById('idioma').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('disponibilidad').value = '';
    document.getElementById('valoracion').value = '';

    IdLibroActual = null; // No hay un libro para editar

    modal.showModal(); // Mostrar modal
})

// * Cerramos Modal al presionar botón
btnCerrarModal.addEventListener('click', () => {
    modal.close();  // Cerrar modal
})

// * Función para editar información de libros con el modal
// * Primero buscamos obtener el GET del libro que seleccionamos con el id
bookTableBody.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'edit_form') {
        modalTitulo.textContent = "Editar información Libro"
        botonActualizar.textContent = "Actualizar"

        const libroId = parseInt(e.target.dataset.id);
        IdLibroActual = libroId; // Almacenamos ID

        fetch(`http://localhost:3000/libros/${libroId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(libro => {
                modal.showModal();
                document.getElementById('titulo').value = libro.titulo;
                document.getElementById('autores').value = libro.autores;
                document.getElementById('genero').value = libro.genero;
                document.getElementById('idioma').value = libro.idioma;
                document.getElementById('precio').value = libro.precio;
                document.getElementById('disponibilidad').value = libro.disponibilidad;
                document.getElementById('valoracion').value = libro.valoracion;
            })
            .catch(error => console.error("Error al obtener información del libro:", error))
    }
})

// * Obtención de datos del form del modal para desplegar en la página
botonGuardar.addEventListener('click', function (event) {
    event.preventDefault(); // Evitamos formulario se envíe inmediato

    const formData = new FormData(document.getElementById('form-libro'));

    const libro = {
        titulo: formData.get('titulo'),
        autores: formData.get('autores'),
        genero: formData.get('genero'),
        idioma: formData.get('idioma'),
        precio: parseFloat(formData.get('precio')),
        disponibilidad: formData.get('disponibilidad'),
        valoracion: parseFloat(formData.get('valoracion'))
    };

    // ! Condicional para hacer el POST o PUT
    if (IdLibroActual === null) {
        // Enviar datos al servidor con fetch
        fetch('http://localhost:3000/libros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(libro)
        })
            .then(response => response.json())
            .then(libro => {
                modal.close();
                fetchBooks();
            })
            .catch(error => {
                console.error("Error al enviar los datos: ", error)
            })
    } else {
        fetch(`http://localhost:3000/libros/${IdLibroActual}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(libro)
        })
            .then(response => response.json())
            .then(libro => {
                modal.close();
                fetchBooks();
            })
            .catch(error => {
                console.error("Error al actualizar los datos: ", error)
            })
    }
});


// * Función para eliminar libro
bookTableBody.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'delete_libro') {
        const libroId = parseInt(e.target.dataset.id);

        const confirmacion = confirm(`Confirma eliminar ID del libro: ${libroId}, definitivamente`)

        if (confirmacion) {
            fetch(`http://localhost:3000/libros/${libroId}`, {
                method: 'DELETE',
            })
                .then(response => response.json())
                .then(() => {
                    fetchBooks();
                })
                .catch(error => {
                    console.error("Error al eliminar el libro: ", error)
                })
        }
    }
})


