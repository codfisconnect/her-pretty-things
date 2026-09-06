import { Router } from 'express'
import { createCartItem, deleteCartItem, editCartItem, readCart } from '../controllers/cartController.js'

const cartRoutes = Router()
cartRoutes.post('/items', createCartItem)
cartRoutes.get('/:cartId', readCart)
cartRoutes.put('/items/:itemId', editCartItem)
cartRoutes.delete('/items/:itemId', deleteCartItem)

export default cartRoutes
