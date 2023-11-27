

const estudiante = (req, res) => {
    res.render('estudiantes/home', {
        pagina: 'Bienvenido Nuevo Estudiante',
        barra: true
    })
}

export {
    estudiante
}