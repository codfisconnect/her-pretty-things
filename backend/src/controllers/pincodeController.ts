import type { Request, Response } from 'express'
import { lookupPincode } from '../services/pincodeService.js'

export async function getPincodeDetails(request: Request, response: Response): Promise<void> {
  const pincode = request.params.pincode

  if (typeof pincode !== 'string' || !/^[1-9][0-9]{5}$/.test(pincode.trim())) {
    response.status(400).json({
      success: false,
      message: 'Invalid pincode format. Pincode must be exactly 6 numeric digits starting with 1-9.',
    })
    return
  }

  const cleanPincode = pincode.trim()
  const result = await lookupPincode(cleanPincode)

  if (!result) {
    response.status(404).json({
      success: false,
      message: 'Pincode not found. Please check the pincode.',
    })
    return
  }

  response.json({
    success: true,
    data: result,
  })
}
