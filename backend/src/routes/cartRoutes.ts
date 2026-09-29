import { Router } from 'express'
import {
  createCartItem,
  deleteCartItem,
  editCartItem,
  readCart,
  handleGetOrCreate,
  handleClearCart,
} from '../controllers/cartController.js'

const cartRoutes = Router()

cartRoutes.post('/get-or-create', handleGetOrCreate)
cartRoutes.post('/items', createCartItem)
cartRoutes.put('/items/:itemId', editCartItem)
cartRoutes.delete('/items/:itemId', deleteCartItem)
cartRoutes.delete('/:cartId', handleClearCart)
cartRoutes.get('/:cartId', readCart)

export default cartRoutes
