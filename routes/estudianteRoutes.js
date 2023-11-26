import express from "express"
import { estudiante } from '../controllers/estudianteController.js'

const router = express.Router()

router.get('/home', estudiante)


export default router
