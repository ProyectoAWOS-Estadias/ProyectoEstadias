


const admin = (req, res) => {
    res.render('estadias-admin/admin', {
        pagina: 'Bienvenido Administrador',
        barra: true

    })
}

const crear = (req, res) => {
    res.render('estadias-admin/crear', {
        pagina: 'Subir Empresa',
        barra: true

    })
}

const mapa = (req, res) => {
    res.render('estadias-admin/mapa', {
        pagina: 'Ejemplo de mapa para ponerlo en algun lado',
        barra: true

    })
}


export {
    admin, crear, mapa
}