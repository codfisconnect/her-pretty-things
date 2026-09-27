import { Router } from 'express'
import { fetchBusinessInfo, handleDamageClaim } from '../controllers/businessController.js'

const businessRoutes = Router()

businessRoutes.get('/', fetchBusinessInfo)
businessRoutes.post('/damage-claim', handleDamageClaim)

export default businessRoutes
