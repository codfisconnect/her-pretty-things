import { Router } from 'express'
import { fetchWishlist, handleToggle, handleMerge } from '../controllers/wishlistController.js'

const wishlistRoutes = Router()

wishlistRoutes.get('/', fetchWishlist)
wishlistRoutes.post('/toggle', handleToggle)
wishlistRoutes.post('/merge', handleMerge)

export default wishlistRoutes
