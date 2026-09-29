import { Router } from 'express'
import { fetchInstagramFeed } from '../controllers/instagramController.js'

const instagramRoutes = Router()

instagramRoutes.get('/media', fetchInstagramFeed)
instagramRoutes.get('/recent', fetchInstagramFeed)

export default instagramRoutes
