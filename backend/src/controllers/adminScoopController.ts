import type { Request, Response } from 'express'
import { HttpError } from '../middleware/errorHandler.js'
import { uploadProductImage } from '../services/cloudinaryService.js'
import {
  getAdminScoopConfig,
  updateAdminScoopSetting,
  updateAdminScoopOption,
  createAdminScoopOption,
  deleteAdminScoopOption,
} from '../services/adminScoopService.js'

export async function getAdminScoopConfigController(
  _request: Request,
  response: Response,
) {
  const config = await getAdminScoopConfig()

  response.json({
    success: true,
    data: config,
  })
}

export async function updateAdminScoopSettingController(
  request: Request,
  response: Response,
) {
  const {
    firstScoopPrice,
    additionalScoopPrice,
    maxScoops,
    maxPreferredItems,
    maxExcludedItems,
    imageUrl,
  } = request.body

  const setting = await updateAdminScoopSetting({
    firstScoopPrice,
    additionalScoopPrice,
    maxScoops,
    maxPreferredItems,
    maxExcludedItems,
    imageUrl,
  })

  response.json({
    success: true,
    data: setting,
  })
}

export async function updateAdminScoopOptionController(
  request: Request,
  response: Response,
) {
  const rawType = request.params.type
  const rawId = request.params.id

  if (
    typeof rawType !== 'string' ||
    typeof rawId !== 'string'
  ) {
    throw new Error('Invalid Scoop option parameters.')
  }

  const type =
    rawType === 'colour' ||
      rawType === 'character' ||
      rawType === 'item'
      ? rawType
      : (() => {
        throw new Error('Invalid Scoop option type.')
      })()

  const id = rawId

  const {
    name,
    active,
    sortOrder,
  } = request.body

  const option = await updateAdminScoopOption({
    type,
    id,
    name,
    active,
    sortOrder,
  })

  response.json({
    success: true,
    data: option,
  })
}

export async function createAdminScoopOptionController(
  request: Request,
  response: Response,
) {
  const {
    type,
    name,
    sortOrder,
  } = request.body

  if (
    type !== 'colour' &&
    type !== 'character' &&
    type !== 'item'
  ) {
    throw new HttpError(
      400,
      'Invalid Scoop option type.',
    )
  }

  const option = await createAdminScoopOption({
    type,
    name,
    sortOrder,
  })

  response.status(201).json({
    success: true,
    data: option,
  })
}

export async function deleteAdminScoopOptionController(
  request: Request,
  response: Response,
) {
  const rawType = request.params.type
  const rawId = request.params.id

  if (
    typeof rawType !== 'string' ||
    typeof rawId !== 'string'
  ) {
    throw new HttpError(
      400,
      'Invalid Scoop option parameters.',
    )
  }

  const type =
    rawType === 'colour' ||
      rawType === 'character' ||
      rawType === 'item'
      ? rawType
      : (() => {
        throw new HttpError(
          400,
          'Invalid Scoop option type.',
        )
      })()

  await deleteAdminScoopOption({
    type,
    id: rawId,
  })

  response.json({
    success: true,
    message: 'Scoop option deleted successfully.',
  })
}

export async function uploadAdminScoopImage(
  request: Request,
  response: Response,
) {
  const uploadedImage = request.file

  if (!uploadedImage) {
    throw new HttpError(
      400,
      'Scoop image is required.',
    )
  }

  const cloudinaryResult = await uploadProductImage(
    uploadedImage.buffer,
    uploadedImage.originalname,
  )

  response.json({
    success: true,
    data: {
      imageUrl: cloudinaryResult.secure_url,
    },
  })
}