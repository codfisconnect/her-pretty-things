import { Router } from 'express'
import { claimReward, validateReward } from '../controllers/gameController.js'

const gameRoutes = Router()

gameRoutes.post('/reward', claimReward)
gameRoutes.post('/validate-reward', validateReward)

export default gameRoutes
