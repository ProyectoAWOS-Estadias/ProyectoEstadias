

const estudiante = (req, res) => {
    res.render('estudiantes/home', {
        pagina: 'Bienvenido Estudiante',
        barra: true
    })
}

export {
    estudiante
}