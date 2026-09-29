import { Router } from 'express'
import { fetchByobSettings, fetchByobProducts } from '../controllers/byobController.js'

const byobRoutes = Router()

byobRoutes.get('/settings', fetchByobSettings)
byobRoutes.get('/products', fetchByobProducts)

export default byobRoutes
