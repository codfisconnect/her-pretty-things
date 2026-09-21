import type { Request, Response } from 'express'

import {
  getAdminScoopConfig,
  updateAdminScoopSetting,
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
  } = request.body

  const setting = await updateAdminScoopSetting({
    firstScoopPrice,
    additionalScoopPrice,
    maxScoops,
    maxPreferredItems,
    maxExcludedItems,
  })

  response.json({
    success: true,
    data: setting,
  })
}