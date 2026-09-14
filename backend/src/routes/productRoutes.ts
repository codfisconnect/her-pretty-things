import { Router } from 'express'
import {
  getProducts,
  getProductById,
} from '../controllers/productController.js'

const productRoutes = Router()

productRoutes.get('/', getProducts)
productRoutes.get('/:id', getProductById)

export default productRoutes