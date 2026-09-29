import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { getDatabase } from '../config/database.js'

export type NotificationEventType =
  | 'NEW_ORDER'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'ORDER_CANCELLED'
  | 'REFUND_PROCESSED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'DAMAGE_CLAIM'

interface SendNotificationOptions {
  eventType: NotificationEventType
  orderId?: string
  idempotencyKey: string
  subject: string
  htmlContent: string
  textContent: string
  metadata?: Record<string, unknown>
}

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT || 587)

  if (host && user && pass) {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
      return transporter
    } catch (err) {
      console.error('[NotificationService] Failed to initialize SMTP transporter:', err)
      return null
    }
  }

  return null
}

export function getOwnerEmail(): string {
  return (
    process.env.OWNER_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'shop.herprettythings@gmail.com'
  ).trim()
}

export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM ||
    '"Her Pretty Things" <orders@herprettythings.com>'
  ).trim()
}

/**
 * Idempotent, failure-safe notification dispatcher.
 * Guaranteed never to throw or crash the caller (e.g. order creation / payment webhook).
 */
export async function sendOwnerNotification(options: SendNotificationOptions): Promise<boolean> {
  const database = getDatabase()
  const recipient = getOwnerEmail()

  try {
    // 1. Idempotency check: see if this event was already processed
    const existing = await database.orderNotificationEvent.findUnique({
      where: { idempotencyKey: options.idempotencyKey },
    }).catch(() => null)

    if (existing && existing.status === 'SENT') {
      console.log(`[NotificationService] Skipping duplicate notification for key: ${options.idempotencyKey}`)
      return true
    }

    const mailer = getTransporter()
    let sendSuccess = false
    let errorMsg: string | null = null

    if (mailer) {
      try {
        await mailer.sendMail({
          from: getEmailFrom(),
          to: recipient,
          subject: options.subject,
          text: options.textContent,
          html: options.htmlContent,
        })
        sendSuccess = true
      } catch (err: any) {
        errorMsg = err instanceof Error ? err.message : String(err)
        console.error(`[NotificationService] SMTP delivery failed for ${options.subject}:`, errorMsg)
      }
    } else {
      // In local development or when SMTP is not configured, format and log safely to console and record in DB
      console.log(`\n======================================================`)
      console.log(`[OWNER NOTIFICATION EMAIL DISPATCHED]`)
      console.log(`To: ${recipient}`)
      console.log(`Subject: ${options.subject}`)
      console.log(`Event: ${options.eventType} | Order: ${options.orderId || 'N/A'}`)
      console.log(`Key: ${options.idempotencyKey}`)
      console.log(`------------------------------------------------------`)
      console.log(options.textContent)
      console.log(`======================================================\n`)
      sendSuccess = true // Recorded and delivered to local diagnostic log
    }

    // 2. Persist notification event to database for audit and idempotency
    await database.orderNotificationEvent.upsert({
      where: { idempotencyKey: options.idempotencyKey },
      update: {
        status: sendSuccess ? 'SENT' : 'FAILED',
        attempts: { increment: 1 },
        errorDetails: errorMsg,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      },
      create: {
        eventType: options.eventType,
        orderId: options.orderId || null,
        idempotencyKey: options.idempotencyKey,
        recipient,
        subject: options.subject,
        status: sendSuccess ? 'SENT' : 'FAILED',
        attempts: 1,
        errorDetails: errorMsg,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      },
    }).catch((dbErr: any) => {
      console.warn('[NotificationService] Could not persist notification event to DB:', dbErr?.message)
    })

    return sendSuccess
  } catch (outerErr: any) {
    // Non-blocking: email failures must NEVER disrupt the ecommerce flow
    console.error('[NotificationService] Unexpected error in sendOwnerNotification:', outerErr)
    return false
  }
}

// Reusable branded HTML template wrapper
function wrapEmailTemplate(title: string, subtitle: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #fffafb; color: #2d1822; }
    .wrapper { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; border: 1px solid #fce7f3; overflow: hidden; box-shadow: 0 4px 20px rgba(190, 24, 93, 0.06); }
    .header { background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%); padding: 32px 28px; border-bottom: 1px solid #fbcfe8; text-align: center; }
    .logo-mark { display: inline-block; font-size: 24px; color: #be185d; margin-bottom: 8px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #831843; letter-spacing: -0.3px; }
    .header p { margin: 6px 0 0; font-size: 14px; color: #9d174d; }
    .content { padding: 32px 28px; font-size: 15px; line-height: 1.6; }
    .pill { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .pill-success { background: #dcfce7; color: #166534; }
    .pill-pending { background: #fef3c7; color: #92400e; }
    .pill-danger { background: #fee2e2; color: #991b1b; }
    .card { background: #fff5f7; border: 1px solid #fce7f3; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .card-row:last-child { margin-bottom: 0; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th { text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; color: #9d174d; border-bottom: 2px solid #fce7f3; }
    .items-table td { padding: 12px 10px; font-size: 14px; border-bottom: 1px solid #fdf2f8; vertical-align: top; }
    .footer { background: #fffafb; padding: 20px 28px; text-align: center; font-size: 12px; color: #9d174d; border-top: 1px solid #fce7f3; }
    .footer a { color: #be185d; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="logo-mark">✧ 🎀 ✧</span>
      <h1>Her Pretty Things</h1>
      <p>${subtitle}</p>
    </div>
    <div class="content">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>Her Pretty Things Store Operations ✦ Royapettah, Chennai, Tamil Nadu</p>
      <p>View all orders in the <a href="http://localhost:5173/admin/orders">Admin Studio</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// 1. New Order Received Notification
export async function notifyNewOrder(order: any): Promise<boolean> {
  const orderNum = order.orderNumber || order.id
  const orderId = order.id
  const customerName = order.customer?.name || order.address?.fullName || 'Valued Customer'
  const customerEmail = order.customer?.email || order.address?.email || 'N/A'
  const customerPhone = order.customer?.phone || order.address?.phoneNumber || 'N/A'
  const total = Number(order.totalAmount || 0)
  const items = order.items || []

  const itemsHtml = items.map((it: any) => {
    let details = ''
    if (it.isCustomizedScoop) {
      details = `<div style="font-size: 12px; color: #be185d; margin-top: 4px;">Scoops: ${it.numberOfScoops} · Theme: ${it.colourTheme || 'None'} · Character: ${it.preferredCharacter || 'None'}</div>`
    } else if (it.isByob && it.byobDetails?.items) {
      const boxItems = it.byobDetails.items.map((bi: any) => `${bi.name} × ${bi.quantity}`).join(', ')
      details = `<div style="font-size: 12px; color: #be185d; margin-top: 4px;">BYOB Hamper (${it.byobDetails.items.length} items): ${boxItems}</div>`
    }
    return `
      <tr>
        <td><strong>${it.productName}</strong>${details}</td>
        <td style="text-align: center;">${it.quantity}</td>
        <td style="text-align: right;">₹${Number(it.unitPrice).toLocaleString('en-IN')}</td>
        <td style="text-align: right;"><strong>₹${Number(it.totalPrice).toLocaleString('en-IN')}</strong></td>
      </tr>
    `
  }).join('')

  const prettyPlayBadge = order.rewardCodeApplied
    ? `<div style="background: #fff1f2; border: 1px solid #fecdd3; padding: 12px; border-radius: 8px; margin: 16px 0; color: #be185d; font-size: 13px;">
         🎁 <strong>Pretty Play Winner:</strong> Include 1x Free Cute Pen (Claim Code: <code>${order.rewardCodeApplied}</code>).
       </div>`
    : ''

  const html = wrapEmailTemplate(
    `New Order Received — Order #${orderNum}`,
    `New Order Received — Order #${orderNum}`,
    `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <span class="pill pill-pending">Status: ${order.orderStatus}</span>
        <span style="font-size: 13px; color: #64748b;">${new Date().toLocaleString('en-IN')}</span>
      </div>

      <p>A new order has been placed on Her Pretty Things!</p>

      <div class="card">
        <div class="card-row"><span>Customer:</span><strong>${customerName}</strong></div>
        <div class="card-row"><span>Email:</span><strong>${customerEmail}</strong></div>
        <div class="card-row"><span>Phone:</span><strong>${customerPhone}</strong></div>
        <div class="card-row"><span>Shipping Address:</span><span>${order.address?.addressLine1}, ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}</span></div>
      </div>

      ${prettyPlayBadge}

      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="card" style="margin-top: 16px;">
        <div class="card-row"><span>Subtotal:</span><strong>₹${Number(order.subtotal || 0).toLocaleString('en-IN')}</strong></div>
        <div class="card-row"><span>Shipping:</span><strong>₹${Number(order.shippingAmount || 0).toLocaleString('en-IN')}</strong></div>
        <div class="card-row" style="font-size: 16px; color: #be185d; border-top: 1px dashed #fbcfe8; padding-top: 8px; margin-top: 8px;">
          <span>Grand Total:</span><strong>₹${total.toLocaleString('en-IN')}</strong>
        </div>
      </div>
    `
  )

  const text = `
NEW ORDER RECEIVED — Order #${orderNum}
Customer: ${customerName} (${customerEmail}, ${customerPhone})
Date: ${new Date().toLocaleString('en-IN')}
Total: ₹${total.toLocaleString('en-IN')}
Items: ${items.map((i: any) => `${i.productName} x ${i.quantity} (₹${i.totalPrice})`).join('; ')}
${order.rewardCodeApplied ? `Free Gift: Cute Pen (Code: ${order.rewardCodeApplied})` : ''}
Address: ${order.address?.addressLine1}, ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}
  `.trim()

  return sendOwnerNotification({
    eventType: 'NEW_ORDER',
    orderId,
    idempotencyKey: `NEW_ORDER_${orderId}`,
    subject: `New Order Received — Order #${orderNum}`,
    htmlContent: html,
    textContent: text,
    metadata: { orderId, total, itemsCount: items.length },
  })
}

// 2. Successful Payment Notification
export async function notifyPaymentSuccess(order: any, paymentId: string): Promise<boolean> {
  const orderNum = order.orderNumber || order.id
  const total = Number(order.totalAmount || 0)
  const customerName = order.customer?.name || order.address?.fullName || 'Customer'

  const html = wrapEmailTemplate(
    `Payment Successful — Order #${orderNum}`,
    `Payment Confirmed — ₹${total.toLocaleString('en-IN')}`,
    `
      <div style="margin-bottom: 20px;">
        <span class="pill pill-success">Payment Status: PAID</span>
      </div>

      <p>Payment for Order <strong>#${orderNum}</strong> has been successfully captured and verified via Razorpay.</p>

      <div class="card">
        <div class="card-row"><span>Order Number:</span><strong>#${orderNum}</strong></div>
        <div class="card-row"><span>Customer:</span><strong>${customerName}</strong></div>
        <div class="card-row"><span>Amount Captured:</span><strong>₹${total.toLocaleString('en-IN')}</strong></div>
        <div class="card-row"><span>Razorpay Payment ID:</span><code>${paymentId}</code></div>
        <div class="card-row"><span>Timestamp:</span><span>${new Date().toLocaleString('en-IN')}</span></div>
      </div>

      <p>This order is ready for preparation and packing.</p>
    `
  )

  const text = `
PAYMENT SUCCESSFUL — Order #${orderNum}
Amount: ₹${total.toLocaleString('en-IN')}
Customer: ${customerName}
Payment ID: ${paymentId}
Timestamp: ${new Date().toLocaleString('en-IN')}
  `.trim()

  return sendOwnerNotification({
    eventType: 'PAYMENT_SUCCESS',
    orderId: order.id,
    idempotencyKey: `PAYMENT_SUCCESS_${order.id}_${paymentId}`,
    subject: `Payment Successful — Order #${orderNum}`,
    htmlContent: html,
    textContent: text,
    metadata: { orderId: order.id, paymentId, total },
  })
}

// 3. Verified Payment Failure Notification
export async function notifyPaymentFailure(order: any, reason?: string, paymentId?: string): Promise<boolean> {
  const orderNum = order.orderNumber || order.id
  const total = Number(order.totalAmount || 0)
  const customerName = order.customer?.name || order.address?.fullName || 'Customer'

  const html = wrapEmailTemplate(
    `Payment Failed — Order #${orderNum}`,
    `Payment Attempt Failed — Order #${orderNum}`,
    `
      <div style="margin-bottom: 20px;">
        <span class="pill pill-danger">Payment Status: FAILED</span>
      </div>

      <p>A payment attempt for Order <strong>#${orderNum}</strong> has failed or was rejected by the gateway.</p>

      <div class="card">
        <div class="card-row"><span>Order Number:</span><strong>#${orderNum}</strong></div>
        <div class="card-row"><span>Customer:</span><strong>${customerName}</strong></div>
        <div class="card-row"><span>Attempted Amount:</span><strong>₹${total.toLocaleString('en-IN')}</strong></div>
        ${paymentId ? `<div class="card-row"><span>Payment ID:</span><code>${paymentId}</code></div>` : ''}
        ${reason ? `<div class="card-row"><span>Reason:</span><span style="color: #991b1b;">${reason}</span></div>` : ''}
        <div class="card-row"><span>Timestamp:</span><span>${new Date().toLocaleString('en-IN')}</span></div>
      </div>
    `
  )

  const text = `
PAYMENT FAILED — Order #${orderNum}
Customer: ${customerName}
Amount: ₹${total.toLocaleString('en-IN')}
${reason ? `Reason: ${reason}\n` : ''}
Timestamp: ${new Date().toLocaleString('en-IN')}
  `.trim()

  return sendOwnerNotification({
    eventType: 'PAYMENT_FAILED',
    orderId: order.id,
    idempotencyKey: `PAYMENT_FAILED_${order.id}_${paymentId || Date.now()}`,
    subject: `Payment Failed — Order #${orderNum}`,
    htmlContent: html,
    textContent: text,
    metadata: { orderId: order.id, reason, paymentId },
  })
}

// 4. Order Cancelled Notification
export async function notifyOrderCancelled(order: any, reason?: string, cancelledBy?: string): Promise<boolean> {
  const orderNum = order.orderNumber || order.id
  const customerName = order.customer?.name || order.address?.fullName || 'Customer'

  const html = wrapEmailTemplate(
    `Order Cancelled — Order #${orderNum}`,
    `Order Cancelled — Order #${orderNum}`,
    `
      <div style="margin-bottom: 20px;">
        <span class="pill pill-danger">Order Status: CANCELLED</span>
      </div>

      <p>Order <strong>#${orderNum}</strong> has been cancelled.</p>

      <div class="card">
        <div class="card-row"><span>Customer:</span><strong>${customerName}</strong></div>
        <div class="card-row"><span>Cancelled By:</span><strong>${cancelledBy || 'System / Customer'}</strong></div>
        ${reason ? `<div class="card-row"><span>Reason:</span><span>${reason}</span></div>` : ''}
        <div class="card-row"><span>Timestamp:</span><span>${new Date().toLocaleString('en-IN')}</span></div>
      </div>
    `
  )

  const text = `
ORDER CANCELLED — Order #${orderNum}
Customer: ${customerName}
Cancelled By: ${cancelledBy || 'System'}
${reason ? `Reason: ${reason}\n` : ''}
Timestamp: ${new Date().toLocaleString('en-IN')}
  `.trim()

  return sendOwnerNotification({
    eventType: 'ORDER_CANCELLED',
    orderId: order.id,
    idempotencyKey: `ORDER_CANCELLED_${order.id}`,
    subject: `Order Cancelled — Order #${orderNum}`,
    htmlContent: html,
    textContent: text,
    metadata: { orderId: order.id, reason, cancelledBy },
  })
}

// 5. Refund Processed Notification
export async function notifyRefundProcessed(order: any, refundId: string, amount: number, reason?: string): Promise<boolean> {
  const orderNum = order.orderNumber || order.id

  const html = wrapEmailTemplate(
    `Refund Processed — Order #${orderNum}`,
    `Refund Processed — ₹${amount.toLocaleString('en-IN')}`,
    `
      <div style="margin-bottom: 20px;">
        <span class="pill pill-success">Refund Status: PROCESSED</span>
      </div>

      <p>A refund has been successfully initiated for Order <strong>#${orderNum}</strong>.</p>

      <div class="card">
        <div class="card-row"><span>Order Number:</span><strong>#${orderNum}</strong></div>
        <div class="card-row"><span>Refund Amount:</span><strong>₹${amount.toLocaleString('en-IN')}</strong></div>
        <div class="card-row"><span>Refund ID:</span><code>${refundId}</code></div>
        ${reason ? `<div class="card-row"><span>Reason:</span><span>${reason}</span></div>` : ''}
        <div class="card-row"><span>Timestamp:</span><span>${new Date().toLocaleString('en-IN')}</span></div>
      </div>
    `
  )

  const text = `
REFUND PROCESSED — Order #${orderNum}
Amount: ₹${amount.toLocaleString('en-IN')}
Refund ID: ${refundId}
Timestamp: ${new Date().toLocaleString('en-IN')}
  `.trim()

  return sendOwnerNotification({
    eventType: 'REFUND_PROCESSED',
    orderId: order.id,
    idempotencyKey: `REFUND_PROCESSED_${order.id}_${refundId}`,
    subject: `Refund Processed — Order #${orderNum}`,
    htmlContent: html,
    textContent: text,
    metadata: { orderId: order.id, refundId, amount },
  })
}

// 6. Status Update Notification (Shipped, Delivered)
export async function notifyOrderStatusUpdate(order: any, newStatus: string): Promise<boolean> {
  const orderNum = order.orderNumber || order.id
  const customerName = order.customer?.name || order.address?.fullName || 'Customer'

  const html = wrapEmailTemplate(
    `Order ${newStatus} — Order #${orderNum}`,
    `Status Update: ${newStatus}`,
    `
      <div style="margin-bottom: 20px;">
        <span class="pill pill-success">Status: ${newStatus}</span>
      </div>

      <p>Order <strong>#${orderNum}</strong> has been updated to <strong>${newStatus}</strong>.</p>

      <div class="card">
        <div class="card-row"><span>Order Number:</span><strong>#${orderNum}</strong></div>
        <div class="card-row"><span>Customer:</span><strong>${customerName}</strong></div>
        <div class="card-row"><span>Timestamp:</span><span>${new Date().toLocaleString('en-IN')}</span></div>
      </div>
    `
  )

  const text = `
ORDER STATUS UPDATE — Order #${orderNum}
Status: ${newStatus}
Customer: ${customerName}
Timestamp: ${new Date().toLocaleString('en-IN')}
  `.trim()

  return sendOwnerNotification({
    eventType: newStatus === 'SHIPPED' ? 'ORDER_SHIPPED' : 'ORDER_DELIVERED',
    orderId: order.id,
    idempotencyKey: `STATUS_${newStatus}_${order.id}`,
    subject: `Order ${newStatus} — Order #${orderNum}`,
    htmlContent: html,
    textContent: text,
    metadata: { orderId: order.id, newStatus },
  })
}

// 7. Transit Damage Claim Notification
export async function notifyDamageClaim(claim: any): Promise<boolean> {
  const html = wrapEmailTemplate(
    `Transit Damage Report — Order #${claim.orderNumber}`,
    `Transit Damage Report Received`,
    `
      <div style="margin-bottom: 20px;">
        <span class="pill pill-danger">Status: REVIEW REQUIRED</span>
      </div>

      <p>A customer has reported transit damage with unboxing evidence.</p>

      <div class="card">
        <div class="card-row"><span>Order Number:</span><strong>#${claim.orderNumber}</strong></div>
        <div class="card-row"><span>Customer:</span><strong>${claim.customerName}</strong></div>
        <div class="card-row"><span>Email:</span><strong>${claim.customerEmail}</strong></div>
        <div class="card-row"><span>Product:</span><strong>${claim.productName}</strong></div>
        <div class="card-row"><span>Description:</span><span>${claim.description}</span></div>
        ${claim.unboxingVideoUrl ? `<div class="card-row"><span>Unboxing Video Proof:</span><a href="${claim.unboxingVideoUrl}">View Video Proof</a></div>` : ''}
        <div class="card-row"><span>Submitted:</span><span>${new Date().toLocaleString('en-IN')}</span></div>
      </div>
    `
  )

  const text = `
TRANSIT DAMAGE REPORT — Order #${claim.orderNumber}
Customer: ${claim.customerName} (${claim.customerEmail})
Product: ${claim.productName}
Description: ${claim.description}
Video: ${claim.unboxingVideoUrl || 'None'}
Submitted: ${new Date().toLocaleString('en-IN')}
  `.trim()

  return sendOwnerNotification({
    eventType: 'DAMAGE_CLAIM',
    orderId: claim.orderNumber,
    idempotencyKey: `DAMAGE_CLAIM_${claim.id}`,
    subject: `Transit Damage Report — Order #${claim.orderNumber}`,
    htmlContent: html,
    textContent: text,
    metadata: { claimId: claim.id, orderNumber: claim.orderNumber },
  })
}
