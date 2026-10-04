import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Truck,
  Gift,
  ArrowRight,
  Lock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { createOrder, type ShippingDetails } from '../../services/orderService'
import { createPayment, verifyPayment } from '../../services/paymentService'
import { validateRewardCodeApi } from '../../services/gameService'
import { verifyPincodeApi, type PincodeLookupResponse } from '../../services/pincodeService'
import {
  INDIA_STATES_AND_UTS,
  getCitiesForState,
  checkAddressConsistency,
  normalizeStateName,
  type ConsistencyCheckResult,
} from '../../utils/indiaLocations'
import {
  validateFullName,
  validateEmail,
  validatePhone,
  normalizeIndianPhone,
  validateAddressLine1,
  validateAddressLine2,
  validatePincodeFormat,
} from '../../utils/checkoutValidation'
import CitySelect from '../../components/CitySelect/CitySelect'
import './Checkout.css'

declare global {
  interface Window {
    Razorpay: any
  }
}

type PincodeVerificationStatus =
  | 'idle'
  | 'loading'
  | 'verified'
  | 'not_found'
  | 'error'
  | 'mismatch'

interface PincodeState {
  status: PincodeVerificationStatus
  data: PincodeLookupResponse | null
  errorMessage: string | null
  consistency: ConsistencyCheckResult | null
  verifiedPincode: string | null
}

export const Checkout: React.FC = () => {
  const { cart, subtotal, shipping, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState<ShippingDetails>({
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })

  // Field-level error messages
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // City dependent state
  const [stateCities, setStateCities] = useState<string[]>([])
  const [loadingCities, setLoadingCities] = useState(false)

  // Real pincode verification state
  const [pincodeState, setPincodeState] = useState<PincodeState>({
    status: 'idle',
    data: null,
    errorMessage: null,
    consistency: null,
    verifiedPincode: null,
  })

  const pincodeAbortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Promo code
  const [promoCode, setPromoCode] = useState('')
  const [appliedReward, setAppliedReward] = useState<{
    code: string
    rewardType: string
    rewardDescription: string
  } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)

  // Payment & submit state
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [paymentPending, setPaymentPending] = useState(false)

  // Ensure Razorpay SDK script is loaded
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Update cities list whenever state changes
  useEffect(() => {
    if (!formData.state) {
      setStateCities([])
      return
    }

    let isSubscribed = true
    setLoadingCities(true)

    getCitiesForState(formData.state)
      .then((cities) => {
        if (isSubscribed) {
          setStateCities(cities)
        }
      })
      .catch((err) => {
        console.error('Failed to load cities for state:', err)
        if (isSubscribed) setStateCities([])
      })
      .finally(() => {
        if (isSubscribed) setLoadingCities(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [formData.state])

  // Pincode verification logic
  const performPincodeLookup = useCallback(
    async (pinToVerify: string, currentState: string, currentCity: string) => {
      // Cancel any in-flight lookup to prevent race conditions
      if (pincodeAbortControllerRef.current) {
        pincodeAbortControllerRef.current.abort()
      }

      const controller = new AbortController()
      pincodeAbortControllerRef.current = controller

      setPincodeState({
        status: 'loading',
        data: null,
        errorMessage: null,
        consistency: null,
        verifiedPincode: pinToVerify,
      })

      try {
        const result = await verifyPincodeApi(pinToVerify, controller.signal)

        // Consistency check if State / UT is already selected
        let consistency: ConsistencyCheckResult | null = null
        if (currentState) {
          consistency = checkAddressConsistency(currentState, currentCity, result)
        }

        let newStatus: PincodeVerificationStatus = 'verified'
        let errorMessage: string | null = null

        if (consistency && !consistency.stateMatches) {
          newStatus = 'mismatch'
          errorMessage =
            consistency.stateErrorMessage ||
            `This pincode belongs to ${result.state}, not ${currentState}.`
        } else if (consistency && !consistency.cityMatches && currentCity) {
          newStatus = 'mismatch'
          errorMessage =
            consistency.cityErrorMessage ||
            `The selected city does not match the postal information for this pincode.`
        }

        setPincodeState({
          status: newStatus,
          data: result,
          errorMessage,
          consistency,
          verifiedPincode: pinToVerify,
        })
      } catch (err: any) {
        if (err.name === 'AbortError') return

        const isNotFound = err.status === 404
        setPincodeState({
          status: isNotFound ? 'not_found' : 'error',
          data: null,
          errorMessage: isNotFound
            ? 'Pincode not found. Please check the pincode.'
            : 'Unable to verify this pincode right now. Please retry.',
          consistency: null,
          verifiedPincode: pinToVerify,
        })
      }
    },
    [],
  )

  // Re-run consistency check when state or city changes, if pincode is already verified
  useEffect(() => {
    if (pincodeState.data && pincodeState.verifiedPincode) {
      if (formData.state) {
        const consistency = checkAddressConsistency(
          formData.state,
          formData.city,
          pincodeState.data,
        )

        if (!consistency.stateMatches) {
          setPincodeState((prev) => ({
            ...prev,
            status: 'mismatch',
            consistency,
            errorMessage:
              consistency.stateErrorMessage ||
              `This pincode belongs to ${pincodeState.data!.state}, not ${formData.state}.`,
          }))
        } else if (formData.city && !consistency.cityMatches) {
          setPincodeState((prev) => ({
            ...prev,
            status: 'mismatch',
            consistency,
            errorMessage:
              consistency.cityErrorMessage ||
              `The selected city does not match the postal information for this pincode.`,
          }))
        } else {
          setPincodeState((prev) => ({
            ...prev,
            status: 'verified',
            consistency,
            errorMessage: null,
          }))
        }
      }
    }
  }, [formData.state, formData.city])

  // Trigger pincode lookup when pincode changes
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    // Allow numeric only, max 6 digits
    const cleaned = rawVal.replace(/\D/g, '').slice(0, 6)

    setFormData((prev) => ({ ...prev, pincode: cleaned }))

    // Cancel existing timers and in-flight requests immediately
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    if (pincodeAbortControllerRef.current) {
      pincodeAbortControllerRef.current.abort()
    }

    if (cleaned.length < 6) {
      setPincodeState({
        status: 'idle',
        data: null,
        errorMessage: null,
        consistency: null,
        verifiedPincode: null,
      })
      if (touchedFields.pincode) {
        setFieldErrors((prev) => ({
          ...prev,
          pincode: 'Please enter a valid 6-digit pincode.',
        }))
      }
      return
    }

    // 6 digits entered
    if (cleaned.startsWith('0')) {
      setPincodeState({
        status: 'idle',
        data: null,
        errorMessage: null,
        consistency: null,
        verifiedPincode: null,
      })
      setFieldErrors((prev) => ({
        ...prev,
        pincode: 'Pincode must be 6 digits and cannot start with 0.',
      }))
      return
    }

    // Clear pincode format error
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.pincode
      return next
    })

    // Debounce verification call by 400ms
    debounceTimerRef.current = setTimeout(() => {
      performPincodeLookup(cleaned, formData.state, formData.city)
    }, 400)
  }

  // Handle pincode onBlur
  const handlePincodeBlur = () => {
    setTouchedFields((prev) => ({ ...prev, pincode: true }))
    const pinErr = validatePincodeFormat(formData.pincode)
    if (pinErr) {
      setFieldErrors((prev) => ({ ...prev, pincode: pinErr }))
      return
    }

    if (
      formData.pincode.length === 6 &&
      pincodeState.status === 'idle' &&
      pincodeState.verifiedPincode !== formData.pincode
    ) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      performPincodeLookup(formData.pincode, formData.state, formData.city)
    }
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value
    // Reset dependent city automatically
    setFormData((prev) => ({
      ...prev,
      state: newState,
      city: '',
    }))

    setTouchedFields((prev) => ({ ...prev, state: true }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (!newState) {
        next.state = 'Please select a state or union territory.'
      } else {
        delete next.state
      }
      delete next.city
      return next
    })
  }

  const handleCityChange = (newCity: string) => {
    setFormData((prev) => ({ ...prev, city: newCity }))
    setTouchedFields((prev) => ({ ...prev, city: true }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (!newCity) {
        next.city = 'Please select a city.'
      } else {
        delete next.city
      }
      return next
    })
  }

  const handleBlurField = (fieldName: keyof ShippingDetails) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, formData[fieldName] || '')
  }

  const validateField = (fieldName: keyof ShippingDetails, value: string) => {
    let error: string | null = null
    switch (fieldName) {
      case 'fullName':
        error = validateFullName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'phoneNumber':
        error = validatePhone(value)
        break
      case 'addressLine1':
        error = validateAddressLine1(value)
        break
      case 'addressLine2':
        error = validateAddressLine2(value)
        break
      case 'state':
        error = value ? null : 'Please select a state or union territory.'
        break
      case 'city':
        error = value ? null : 'Please select a city.'
        break
      case 'pincode':
        error = validatePincodeFormat(value)
        break
      default:
        break
    }

    setFieldErrors((prev) => {
      const next = { ...prev }
      if (error) {
        next[fieldName] = error
      } else {
        delete next[fieldName]
      }
      return next
    })
    return error
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touchedFields[name]) {
      validateField(name as keyof ShippingDetails, value)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoError('')
    setValidatingPromo(true)
    try {
      const res = await validateRewardCodeApi(promoCode.trim())
      if (res.valid) {
        setAppliedReward(res)
        setPromoCode('')
      } else {
        setPromoError('Invalid or expired promo code.')
      }
    } catch {
      setPromoError('Could not validate promo code.')
    } finally {
      setValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedReward(null)
  }

  // Trigger Razorpay payment flow
  const launchRazorpay = async (orderId: string, _orderTotal?: number) => {
    setSubmitting(true)
    setOrderError('')
    try {
      const paymentData = await createPayment(orderId)

      // Fallback if testing without active keys or in offline mock
      if (!window.Razorpay || !paymentData.keyId || paymentData.keyId.startsWith('mock_')) {
        await verifyPayment({
          orderId,
          razorpayOrderId: paymentData.razorpayOrderId || 'mock_rzp_order',
          razorpayPaymentId: 'mock_pay_' + Date.now(),
          razorpaySignature: 'mock_sig',
        })
        await clearCart()
        navigate(`/payment/success/${orderId}`)
        return
      }

      const normalizedPhone = normalizeIndianPhone(formData.phoneNumber) || formData.phoneNumber

      const rzp = new window.Razorpay({
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Her Pretty Things',
        description: `Order #${orderId}`,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          contact: normalizedPhone,
        },
        theme: {
          color: '#db2777',
        },
        handler: async (response: any) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            await clearCart()
            navigate(`/payment/success/${orderId}`)
          } catch (err: any) {
            setOrderError(err.message || 'Payment verification failed. Please contact support.')
          } finally {
            setSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false)
            setPaymentPending(true)
            setOrderError('Payment window was closed. You can retry paying now.')
          },
        },
      })

      rzp.open()
    } catch (err: any) {
      console.error('Launch Razorpay error:', err)
      setOrderError(err.message || 'Could not initiate payment. Please retry.')
      setSubmitting(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="container checkout-empty-wrap">
        <h2>Your Cart is Empty</h2>
        <p>Add some lovely things to your cart before proceeding to checkout.</p>
        <Link to="/scoops" className="button button-dark" style={{ marginTop: '1rem' }}>
          Explore Scoops
        </Link>
      </main>
    )
  }

  // Handle Checkout submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOrderError('')

    // Validate all fields
    const nameErr = validateFullName(formData.fullName)
    const emailErr = validateEmail(formData.email)
    const phoneErr = validatePhone(formData.phoneNumber)
    const addr1Err = validateAddressLine1(formData.addressLine1)
    const addr2Err = validateAddressLine2(formData.addressLine2)
    const stateErr = formData.state ? null : 'Please select a state or union territory.'
    const cityErr = formData.city ? null : 'Please select a city.'
    const pinErr = validatePincodeFormat(formData.pincode)

    const errors: Record<string, string> = {}
    if (nameErr) errors.fullName = nameErr
    if (emailErr) errors.email = emailErr
    if (phoneErr) errors.phoneNumber = phoneErr
    if (addr1Err) errors.addressLine1 = addr1Err
    if (addr2Err) errors.addressLine2 = addr2Err
    if (stateErr) errors.state = stateErr
    if (cityErr) errors.city = cityErr
    if (pinErr) errors.pincode = pinErr

    setFieldErrors(errors)
    setTouchedFields({
      fullName: true,
      email: true,
      phoneNumber: true,
      addressLine1: true,
      addressLine2: true,
      state: true,
      city: true,
      pincode: true,
    })

    if (Object.keys(errors).length > 0) {
      setOrderError('Please correct the highlighted fields before placing your order.')
      return
    }

    // Check pincode status
    if (pincodeState.status === 'loading') {
      setOrderError('Please wait while we verify your pincode.')
      return
    }

    if (pincodeState.status === 'not_found') {
      setOrderError('Pincode not found. Please enter a valid Indian pincode.')
      return
    }

    if (pincodeState.status === 'mismatch') {
      setOrderError(pincodeState.errorMessage || 'Pincode does not match your selected State or City.')
      return
    }

    if (pincodeState.status === 'error') {
      setOrderError('Unable to verify this pincode right now. Please retry.')
      return
    }

    if (pincodeState.status === 'idle' || !pincodeState.data) {
      setOrderError('Please verify your 6-digit pincode.')
      return
    }

    // Normalized valid values
    const normalizedPhone = normalizeIndianPhone(formData.phoneNumber)!
    const validatedFormData: ShippingDetails = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: normalizedPhone,
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2?.trim() || undefined,
      city: formData.city.trim(),
      state: normalizeStateName(formData.state),
      pincode: formData.pincode.trim(),
    }

    setSubmitting(true)

    try {
      // 1. Create order in authoritative backend
      const order = await createOrder(
        cart.id,
        validatedFormData,
        user?.id || undefined,
        appliedReward?.code || undefined,
      )

      setCreatedOrderId(order.id)
      localStorage.setItem('hpt_order_id', order.id)

      // 2. Launch Razorpay payment
      await launchRazorpay(order.id, order.totalAmount)
    } catch (err: any) {
      console.error('Checkout error:', err)
      setOrderError(err.message || 'Could not create order. Please check all fields.')
      setSubmitting(false)
    }
  }

  return (
    <main className="container checkout-page">
      <div className="checkout-page-header">
        <span className="eyebrow">
          <Lock size={14} /> SECURE 256-BIT ENCRYPTED CHECKOUT
        </span>
        <h1>Complete Your Order</h1>
      </div>

      {orderError && (
        <div className="checkout-alert error" role="alert">
          <AlertCircle size={17} />
          <span>{orderError}</span>
          {paymentPending && createdOrderId && (
            <button
              type="button"
              className="retry-pay-btn"
              onClick={() => launchRazorpay(createdOrderId, total)}
              disabled={submitting}
            >
              Retry Payment
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="checkout-grid-layout" noValidate>
        {/* Left Column: Shipping Address */}
        <div className="checkout-form-col">
          <section className="checkout-card">
            <h2>Shipping & Contact Information</h2>

            <div className="checkout-form-grid">
              {/* Full Name */}
              <label className={`checkout-input-group full ${fieldErrors.fullName ? 'has-error' : ''}`}>
                <span>Full Name *</span>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlurField('fullName')}
                  placeholder="e.g. Diya Sen or A. Rahman"
                  autoComplete="name"
                  aria-invalid={!!fieldErrors.fullName}
                />
                {fieldErrors.fullName && (
                  <span className="field-error-msg">{fieldErrors.fullName}</span>
                )}
              </label>

              {/* Email Address */}
              <label className={`checkout-input-group half ${fieldErrors.email ? 'has-error' : ''}`}>
                <span>Email Address *</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlurField('email')}
                  placeholder="name@example.com"
                  autoComplete="email"
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <span className="field-error-msg">{fieldErrors.email}</span>
                )}
              </label>

              {/* Phone Number */}
              <label className={`checkout-input-group half ${fieldErrors.phoneNumber ? 'has-error' : ''}`}>
                <span>Phone Number *</span>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  inputMode="numeric"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlurField('phoneNumber')}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  aria-invalid={!!fieldErrors.phoneNumber}
                />
                {fieldErrors.phoneNumber && (
                  <span className="field-error-msg">{fieldErrors.phoneNumber}</span>
                )}
              </label>

              {/* Address Line 1 */}
              <label className={`checkout-input-group full ${fieldErrors.addressLine1 ? 'has-error' : ''}`}>
                <span>Address Line 1 (Flat, House, Street) *</span>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  onBlur={() => handleBlurField('addressLine1')}
                  placeholder="Flat 3B, Sunshine Apartments, 12th Cross"
                  autoComplete="address-line1"
                  aria-invalid={!!fieldErrors.addressLine1}
                />
                {fieldErrors.addressLine1 && (
                  <span className="field-error-msg">{fieldErrors.addressLine1}</span>
                )}
              </label>

              {/* Address Line 2 */}
              <label className={`checkout-input-group full ${fieldErrors.addressLine2 ? 'has-error' : ''}`}>
                <span>Address Line 2 (Area, Landmark - Optional)</span>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2 || ''}
                  onChange={handleChange}
                  onBlur={() => handleBlurField('addressLine2')}
                  placeholder="Near Lotus Garden"
                  autoComplete="address-line2"
                  aria-invalid={!!fieldErrors.addressLine2}
                />
                {fieldErrors.addressLine2 && (
                  <span className="field-error-msg">{fieldErrors.addressLine2}</span>
                )}
              </label>

              {/* State / UT */}
              <label className={`checkout-input-group third ${fieldErrors.state ? 'has-error' : ''}`}>
                <span>State / UT *</span>
                <select
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleStateChange}
                  onBlur={() => handleBlurField('state')}
                  aria-invalid={!!fieldErrors.state}
                >
                  <option value="">Select State / UT</option>
                  {INDIA_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {fieldErrors.state && (
                  <span className="field-error-msg">{fieldErrors.state}</span>
                )}
              </label>

              {/* City */}
              <div className={`checkout-input-group third ${fieldErrors.city ? 'has-error' : ''}`}>
                <span>City *</span>
                <CitySelect
                  value={formData.city}
                  onChange={handleCityChange}
                  cities={stateCities}
                  disabled={!formData.state}
                  loading={loadingCities}
                  error={fieldErrors.city}
                  placeholder="Search or select city"
                />
                {fieldErrors.city && (
                  <span className="field-error-msg">{fieldErrors.city}</span>
                )}
              </div>

              {/* Pincode */}
              <label className={`checkout-input-group third ${fieldErrors.pincode ? 'has-error' : ''}`}>
                <span>Pincode *</span>
                <input
                  type="text"
                  name="pincode"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  onBlur={handlePincodeBlur}
                  placeholder="600001"
                  autoComplete="postal-code"
                  aria-invalid={!!fieldErrors.pincode}
                />
                {fieldErrors.pincode && (
                  <span className="field-error-msg">{fieldErrors.pincode}</span>
                )}
              </label>

              {/* Real Pincode Verification Status */}
              {pincodeState.status !== 'idle' && (
                <div className="pincode-status-wrap">
                  {pincodeState.status === 'loading' && (
                    <div className="pincode-status-card loading" role="status">
                      <div className="pincode-status-header">
                        <Loader2 size={16} className="spinner-icon" />
                        <span>Verifying pincode...</span>
                      </div>
                    </div>
                  )}

                  {pincodeState.status === 'verified' && pincodeState.data && (
                    <div className="pincode-status-card success" role="status">
                      <div className="pincode-status-header">
                        <CheckCircle2 size={16} />
                        <span>✓ Pincode verified</span>
                      </div>
                      <div className="pincode-details-grid">
                        <div className="pincode-detail-item">
                          <span>Area: </span>
                          <strong>
                            {pincodeState.data.postOffices?.[0]?.name || 'Local Area'}
                          </strong>
                        </div>
                        <div className="pincode-detail-item">
                          <span>District: </span>
                          <strong>{pincodeState.data.district}</strong>
                        </div>
                        <div className="pincode-detail-item">
                          <span>State: </span>
                          <strong>{pincodeState.data.state}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {pincodeState.status === 'mismatch' && (
                    <div className="pincode-status-card error" role="alert">
                      <div className="pincode-status-header">
                        <XCircle size={16} />
                        <span>✕ Location Mismatch</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem' }}>
                        {pincodeState.errorMessage}
                      </p>
                    </div>
                  )}

                  {pincodeState.status === 'not_found' && (
                    <div className="pincode-status-card error" role="alert">
                      <div className="pincode-status-header">
                        <XCircle size={16} />
                        <span>✕ Pincode not found</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem' }}>
                        {pincodeState.errorMessage || 'Please check the pincode.'}
                      </p>
                    </div>
                  )}

                  {pincodeState.status === 'error' && (
                    <div className="pincode-status-card warning" role="alert">
                      <div className="pincode-status-header">
                        <AlertTriangle size={16} />
                        <span>Verification Notice</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem' }}>
                        {pincodeState.errorMessage ||
                          'Unable to verify this pincode right now. Please retry.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Delivery & Security Note */}
          <div className="checkout-trust-box">
            <div className="trust-row">
              <Truck size={18} color="#db2777" />
              <div>
                <strong>Pan India Fast Dispatch</strong>
                <p>Orders are dispatched within 24-48 hours. Prepaid orders only.</p>
              </div>
            </div>
            <div className="trust-row">
              <ShieldCheck size={18} color="#db2777" />
              <div>
                <strong>Transit Replacement Guarantee</strong>
                <p>100% replacement in case of transit damage (unboxing video required).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Payment Button */}
        <aside className="checkout-sidebar-col">
          <div className="checkout-summary-card">
            <h2>Order Summary ({cart.items.length} items)</h2>

            {/* Items mini list */}
            <div className="checkout-items-mini-list">
              {cart.items.map((item) => (
                <div key={item.id} className="checkout-mini-item">
                  <div className="mini-item-name">
                    <span>
                      {item.isCustomizedScoop
                        ? `${item.numberOfScoops}-Scoop Surprise`
                        : item.isByob
                          ? 'Custom Gift Box (BYOB)'
                          : item.product?.name}
                    </span>
                    <small>Qty: {item.quantity}</small>
                  </div>
                  <strong>₹{item.total.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>

            {/* Promo / Pretty Play Reward code */}
            <div className="checkout-promo-box">
              <div className="promo-input-row">
                <input
                  type="text"
                  placeholder="Promo or Game Reward code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={validatingPromo || !promoCode.trim()}
                >
                  {validatingPromo ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {promoError && <span className="promo-err-msg">{promoError}</span>}

              {appliedReward && (
                <div className="applied-promo-tag">
                  <Gift size={14} />
                  <span>
                    {appliedReward.code}: {appliedReward.rewardDescription}
                  </span>
                  <button type="button" onClick={handleRemovePromo}>
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Math */}
            <div className="checkout-math">
              <div className="math-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="math-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
              </div>
              {appliedReward && (
                <div className="math-row gift-row">
                  <span>Free Gift</span>
                  <span className="free-gift-text">One Cute Pen (Included)</span>
                </div>
              )}
              <div className="math-row total-row">
                <span>Total Amount</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" className="checkout-pay-btn" disabled={submitting}>
              {submitting
                ? 'Connecting to Razorpay...'
                : `Pay ₹${total.toLocaleString('en-IN')} with Razorpay`}
              <ArrowRight size={17} />
            </button>

            <p className="checkout-safe-note">
              ✦ Fast UPI, Cards, NetBanking, and Wallets accepted safely.
            </p>
          </div>
        </aside>
      </form>
    </main>
  )
}

export default Checkout
