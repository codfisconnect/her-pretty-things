import { Router } from 'express'
import { getActiveGreeting } from '../controllers/seasonalGreetingController.js'

const seasonalGreetingRoutes = Router()

seasonalGreetingRoutes.get('/active', getActiveGreeting)

export default seasonalGreetingRoutes
