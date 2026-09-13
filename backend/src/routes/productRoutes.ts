import { Router } from 'express'
import { getProducts } from '../controllers/productController.js'

const productRoutes = Router()

productRoutes.get('/', getProducts)

export default productRoutes