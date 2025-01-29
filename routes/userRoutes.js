const express = require('express');
const fs = require('fs');
const router = express.Router();
const filePath = './data/libros.json';

// * Obtener todos los libros (GET)
router.get('/libros', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error al obtener los libros.")
        }
        res.json(JSON.parse(data));
    });
})

// * Obtener todos los libros por ID (GET)
router.get('/libros/:id', (req, res) => {
    const librosId = parseInt(req.params.id);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error al encontrar el libro.")
        }
        const libros = JSON.parse(data);
        const libro = libros.find((libro) => libro.id === librosId)

        if (!libro) {
            return res.status(404).send("Libro no encontrado.")
        }
        res.json(libro);  
    });
})

// * Crear un nuevo libro (POST)
router.post('/libros', (req, res) => {
    const newLibro = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error al crear el libro.")
        }
        const libros = JSON.parse(data);
        newLibro.id = libros.length ? libros[libros.length - 1].id + 1 : 1;
        libros.push(newLibro);

        fs.writeFile(filePath, JSON.stringify(libros, null, 2), (err) => {
            if (err) {
                return res.status(500).send("Error al guardar los libros.")
            }
            res.status(201).send(newLibro);
        });
    });
});


// * Actualizar un libro (PUT)
router.put('/libros/:id', (req, res) => {
    const librosId = parseInt(req.params.id);
    const libroActualizado = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error al encontrar el libro.")
        }
        let libros = JSON.parse(data);
        const index = libros.findIndex((libro) => libro.id === librosId);

        if (index === -1) {
            return res.status(404).send("Libro no encontrado.");
        }

        libros[index] = { ...libros[index], ...libroActualizado };
        fs.writeFile(filePath, JSON.stringify(libros, null, 2), (err, data) => {
            if (err) {
                return res.status(500).send("Error al guardar los libros.")
            }
            res.json(libros[index]);
        });
    });
});


// * Eliminar un libro (DELETE)
router.delete('/libros/:id', (req, res) => {
    const librosId = parseInt(req.params.id);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error al encontrar el libro.")
        }

        let libros = JSON.parse(data);
        const newBooks = libros.filter((libro) => libro.id !== librosId);

        if (libros.length === newBooks.length){
            return res.status(404).send("Libro no encontrado.")
        }

        fs.writeFile(filePath, JSON.stringify(newBooks, null, 2), (err) => {
            if (err) {
                return res.status(500).send("Error al eliminar el libro.");
            }
            res.status(204).send();
        });
    });
});

module.exports = router;