import { Router } from 'express'
import { getPincodeDetails } from '../controllers/pincodeController.js'

const pincodeRoutes = Router()

pincodeRoutes.get('/:pincode', getPincodeDetails)

export default pincodeRoutes
