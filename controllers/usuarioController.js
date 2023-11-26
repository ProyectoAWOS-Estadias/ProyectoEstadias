import {check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarId, generarJWT } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword} from '../helpers/email.js'
import csurf from 'csurf';
import Rol from '../models/Rol.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesion',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    //Validacion
    await check('matricula').notEmpty().withMessage("La matricula no puede ir vacia").run(req)
    await check('password').notEmpty().withMessage("El passwordes obligatorio").run(req)

    let resultado = validationResult(req)

    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken :req.csrfToken(),
            errores: resultado.array()
        })

    }

    const {matricula, password } = req.body

    //Comprobar si el usuario existe

    const usuario = await Usuario.findAll({
        where: {matricula},
        include: [{
            model:Rol,
            as: 'usuarios_roles',
            through:Rol.Usuario_Rol}
        ]})
    if(!usuario){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken :req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        })
    }    

    //Confiormamos si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken :req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido Confirmada'}]
        })
    } 

    //Revisar el password
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken :req.csrfToken(),
            errores: [{msg: 'El password es incorrecto'}]
        })
    }

    //Autenticar al usuario
    const token = generarJWT({ id: usuario.id, matricula: usuario.nombre})
    console.log(token)

    // todo: recuperar los roles del usuario atraves de la tabla mucnos a muchos y si esadministrador mostrar el menu de administrador de lo contrario mostrar el de estidante
    console.log('Mostrando el resultado del JOIN')
    console.log(usuario)

    //Almacenar en una cookie
    return res.cookie('_token', token, {
        httpOnly: true
        //secure: true
        //sameSite: true
    }).redirect('/administrador')
}


const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken :req.csrfToken()
    })
}

const registrar = async (req, res) => {
    //Validacion
    await check('matricula').notEmpty().withMessage("La matricula no puede ir vacia").run(req)
    await check('email').isEmail().withMessage("Eso no parece un email").run(req)
    await check('password').isLength({min: 6}).withMessage("El password debe tener al menos 6 caracteres").run(req)
    await check('repetir_password').equals(req.body.password).withMessage("Los password no son iguales").run(req)
    let resultado = validationResult(req)

    //return res.json(resultado array())
    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/registro',{
            csrfToken :req.csrfToken(),
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
                matricula: req.body.matricula,
                email: req.body.email
            }
        })

    }

    //Extraer los datos
    const {matricula, email, password} = req.body

    //Verificar que el usuario no este registrado
    const existeUsuario = await Usuario.findOne({ where: { email : req.body.email}  })
    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            errores: [{msg: 'El Usuario ya esta registrado'}],
            usuario: {
                matricula: req.body.matricula,
                email: req.body.email
            }
        })

    }

    //Almacenar un usuario
    const usuario = await Usuario.create({
        matricula,
        email,
        password,
        token: generarId()
    })

    //Envia email de confirmacion
    emailRegistro({
        matricula: usuario.matricula,
        email: usuario.email,
        token: usuario.token
    })


    //mostrar mensaje de confirmacion
    res.render('templates/mensaje.pug',{
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmacion, presiona en el enlace'
    })
}


// Funcion para comprobar una cuenta
const confirmar = async (req, res) => {
    // req.params.token
    let { token } = req.params

    // Veificar si el token es valido
    const usuario = await Usuario.findOne({ where : { token }})
    
    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }
        //Confirmar la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save();

    
    return res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta ha sido confirmada exitosamente'
    })
}


const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu Acceso a Estadias TIC',
        csrfToken : req.csrfToken()
    })
}

const resetPassword = async (req, res) => {

        //Validacion
        await check('email').isEmail().withMessage("Eso no parece un email").run(req)
        
        let resultado = validationResult(req)

        //verificar que el resultado este vacio
        if(!resultado.isEmpty()){
            //Errores
            return res.render('auth/olvide-password',{
                pagina: 'Recupera tu acceso a Estadias TIC',
                csrfToken : req.csrfToken(),
                errores: resultado.array()
                
            })
        }

    //Buscar el Usuario
    const {email} = req.body

    const usuario = await Usuario.findOne({ where: {email}})
    if(!usuario){
        return res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Estadias TIC',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'El Email no Pertenece a ningun usuario'}]
    })
    }

    //Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    //Enviar un Gmail
    emailOlvidePassword({
        email: usuario.email,
        matricula: usuario.matricula,
        token: usuario.token
    })
    

    //Renderizar un Mensaje-Mostrando un mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina: 'Restablece tu password',
        mensaje: 'Hemos Enviado un Email con las instrucciones'
    })

}
const comprobarToken = async (req, res) => {
    const  token  = req.params.token;

    const usuario = await Usuario.findOne({ where: {token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu password',
            mensaje: 'Hubo un error al validar tu informacion, intentalo de nuevo',
            error: true
        })
    }

    //Mostrar formulario
    res.render('auth/reset-password', {
        pagina: 'Restablece tu Password',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    //Validar el password
    await check('password').isLength({min: 6}).withMessage("El password debe tener al menos 6 caracteres").run(req)

    let resultado = validationResult(req)
    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/reset-password',{
            csrfToken :req.csrfToken(),
            pagina: 'Restablece tu Password',
            errores: resultado.array()
        })

    }

    const {token} = req.params
    const {password} = req.body;

    //Indentificar quien hace el cambio 

    const usuario = await Usuario.findOne({where: {token}})

    //Hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash( password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Restablecido',
        mensaje: 'El password ha sido cambiado exitosamente'
    })

}

const consultaRoles = async (req, res) => {
  const userID = req.params.userID
  console.log(`buscando los roles del usuario ${userID} `)
  const usuario = await Usuario.findByPk(userID,{
    include: [{
      model: Rol}]})
  console.log(usuario)
  //const roles=usuario.getRoles()
  //console.log.roles

 // res.json({ userID, roles }) // Enviar solo la columna 'nombre' de los roles
}



export {
    formularioLogin,
    autenticar,
     formularioRegistro, 
     registrar,
     formularioOlvidePassword, 
     confirmar,
     resetPassword,
     comprobarToken,
     nuevoPassword,
     consultaRoles
}