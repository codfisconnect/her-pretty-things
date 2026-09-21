import { Router } from 'express'
import { getScoopConfigController } from '../controllers/scoopController.js'

const router = Router()

router.get('/config', getScoopConfigController)

export default router