import { DataTypes } from "sequelize";
import db from '../config/db.js'
import Usuario from "./Usuario.js";

const Rol = db.define('tbc_roles',{
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
       
  })
  
export default Rol;