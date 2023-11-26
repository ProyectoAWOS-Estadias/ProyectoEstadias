import express from "express"
import {admin, crear, mapa } from '../controllers/ticController.js'

const router = express.Router()

router.get('/administrador', admin)
router.get('/estadias-admin/crear', crear)
router.get('/estadias-admin/mapa', mapa)


export default router