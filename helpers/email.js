import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
        }
      });
      
      const { email, matricula, token } = datos

      //enviar email
      await transport.sendMail({
        from: 'EstadiasTIC.com',
        to: email,
        subject: 'Confirma tu cuenta con EstadiasTIC.com',
        text: 'Confirma tu cuenta con EstadiasTIC.com',
        html:`
            <p> Hola  esta es tu matricula de la UTXJ ${matricula} ? , compruebala en nuestro sitio EstadiasTIC.com </p>

            <p>Tu cuenta ya esta lista, activala en el siguiente enlace:
              <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta </a></p> 

            <p>Si no creaste esta cuenta, puedes ignorar el mensaje</p>  
              
              `
      })
}


//Verificar Contraseña
const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
      }
    });
    
    const { email, matricula, token } = datos

    //enviar email
    await transport.sendMail({
      from: 'EstadiasTIC.com',
      to: email,
      subject: 'Restablece tu Password EstadiasTIC.com',
      text: 'Restablece tu Password EstadiasTIC.com',
      html:`
          <p> Hola  esta es tu matricula de la UTXJ ${matricula} ? , Has solicitado restablecer tu password en EstadiasTIC.com </p>

          <p>Siue el siguiente enlace para generar un password nuevo:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer Password </a></p> 

          <p>Si tu no solicitaste el cambio de password, puedes ignorar el mensaje</p>  
          `
    })
}


export {
      emailRegistro,
      emailOlvidePassword
}