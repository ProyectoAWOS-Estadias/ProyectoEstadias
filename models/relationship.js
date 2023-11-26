import Usuario from './Usuario.js'
import Rol from './Rol.js';


export default (models) => {
    const { Usuario, Rol } = models;
  
    Usuario.belongsToMany(Rol, { through: 'tbd_usuariosRoles', foreignKey: 'Usuario_ID' });
    Rol.belongsToMany(Usuario, { through: 'tbd_usuariosRoles', foreignKey: 'Rol_ID' });
  };

export {Rol, Usuario}