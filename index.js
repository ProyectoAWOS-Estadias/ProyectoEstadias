import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'
import ticRoutes from './routes/ticRoutes.js'
import estudiantesRoutes from './routes/estudianteRoutes.js'
import db from './config/db.js'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import {Rol, Usuario} from './models/relationship.js'

//crea la app
const app = express()
 
//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))

//Habilitar Cookie-Parser
app.use( cookieParser() )

//Habilitar CSRF
app.use( csrf({cookie: true}) )

//Conexion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log("Conexion correcta a la Base de Datos")

} catch (error) {
    console.log(error)
}

//Habilitar pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta Publica
app.use (express.static('public'))

//Routing
app.use('/auth', usuarioRoutes)
app.use('/', ticRoutes)
app.use('/tic', estudiantesRoutes)


//definir un puerto}
const port = process.env.PORT || 3000;

//Definir el puerto para correrlo
app.listen(port, () => {
    console.log(`El servidor esta siendo ejecutado en el puerto ${port}`)
})
