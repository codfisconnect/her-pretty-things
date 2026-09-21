import './ScoopManagement.css'
import { useEffect, useState } from 'react'
import {
  getAdminScoopConfig,
  updateAdminScoopOption,
  updateAdminScoopSetting,
  uploadAdminScoopImage,
  createAdminScoopOption,
  deleteAdminScoopOption,
} from '../../../services/adminService'
import type {
  AdminScoopConfig,
  AdminScoopOption,
} from '../../../services/adminService'

function ScoopManagement() {
  const [config, setConfig] = useState<AdminScoopConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [firstScoopPrice, setFirstScoopPrice] = useState('')
  const [additionalScoopPrice, setAdditionalScoopPrice] = useState('')
  const [maxScoops, setMaxScoops] = useState('')
  const [maxPreferredItems, setMaxPreferredItems] = useState('')
  const [maxExcludedItems, setMaxExcludedItems] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageMessage, setImageMessage] = useState('')

  const [addingOptionType, setAddingOptionType] = useState<
    'colour' | 'character' | 'item' | null
  >(null)

  const [newOptionName, setNewOptionName] = useState('')
  const [addingOption, setAddingOption] = useState(false)



  useEffect(() => {
    getAdminScoopConfig()
      .then((data) => {
        setConfig(data)

        setFirstScoopPrice(
          String(data.setting.firstScoopPrice),
        )

        setAdditionalScoopPrice(
          String(data.setting.additionalScoopPrice),
        )

        setMaxScoops(
          String(data.setting.maxScoops),
        )

        setMaxPreferredItems(
          String(data.setting.maxPreferredItems),
        )

        setMaxExcludedItems(
          String(data.setting.maxExcludedItems),
        )
        setImageMessage('')
      })
      .catch((error) => {
        console.error(
          'Could not load Scoop configuration:',
          error,
        )

        setError(
          'Could not load Scoop configuration.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setUploadingImage(true)
    setImageMessage('')

    try {
      const result = await uploadAdminScoopImage(file)

      await updateAdminScoopSetting({
        firstScoopPrice: Number(firstScoopPrice),
        additionalScoopPrice: Number(additionalScoopPrice),
        maxScoops: Number(maxScoops),
        maxPreferredItems: Number(maxPreferredItems),
        maxExcludedItems: Number(maxExcludedItems),
        imageUrl: result.imageUrl,
      })

      const updatedConfig = await getAdminScoopConfig()
      setConfig(updatedConfig)

      setImageMessage('Scoop image uploaded successfully.')
    } catch (error) {
      console.error('Could not upload Scoop image:', error)
      setImageMessage('Could not upload Scoop image.')
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const handleSaveSettings = async () => {
    setMessage('')
    setError('')

    const firstPrice = Number(firstScoopPrice)
    const additionalPrice = Number(additionalScoopPrice)
    const maximumScoops = Number(maxScoops)
    const preferredLimit = Number(maxPreferredItems)
    const excludedLimit = Number(maxExcludedItems)

    if (
      !Number.isInteger(firstPrice) ||
      firstPrice < 0
    ) {
      setError(
        'First Scoop price must be a valid amount.',
      )
      return
    }

    if (
      !Number.isInteger(additionalPrice) ||
      additionalPrice < 0
    ) {
      setError(
        'Additional Scoop price must be a valid amount.',
      )
      return
    }

    if (
      !Number.isInteger(maximumScoops) ||
      maximumScoops < 1 ||
      maximumScoops > 50
    ) {
      setError(
        'Maximum Scoops must be between 1 and 50.',
      )
      return
    }

    if (
      !Number.isInteger(preferredLimit) ||
      preferredLimit < 0 ||
      preferredLimit > 20
    ) {
      setError(
        'Preferred Items limit must be between 0 and 20.',
      )
      return
    }

    if (
      !Number.isInteger(excludedLimit) ||
      excludedLimit < 0 ||
      excludedLimit > 20
    ) {
      setError(
        'Excluded Items limit must be between 0 and 20.',
      )
      return
    }

    try {
      setSaving(true)

      await updateAdminScoopSetting({
        firstScoopPrice: firstPrice,
        additionalScoopPrice: additionalPrice,
        maxScoops: maximumScoops,
        maxPreferredItems: preferredLimit,
        maxExcludedItems: excludedLimit,
      })

      const refreshedConfig = await getAdminScoopConfig()

      setConfig(refreshedConfig)
      setMessage(
        'Scoop settings updated successfully.',
      )
    } catch (error) {
      console.error(
        'Could not update Scoop settings:',
        error,
      )

      setError(
        error instanceof Error
          ? error.message
          : 'Could not update Scoop settings.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleOptionToggle = async (
    type: 'colour' | 'character' | 'item',
    option: AdminScoopOption,
  ) => {
    try {
      setError('')

      await updateAdminScoopOption(type, option.id, {
        active: !option.active,
      })

      const refreshedConfig = await getAdminScoopConfig()
      setConfig(refreshedConfig)
    } catch (error) {
      console.error('Could not update Scoop option:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'Could not update Scoop option.',
      )
    }
  }

  const handleDeleteOption = async (
    type: 'colour' | 'character' | 'item',
    option: AdminScoopOption,
  ) => {
    const confirmed = window.confirm(
      `Delete "${option.name}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setMessage('')

      await deleteAdminScoopOption(type, option.id)

      const refreshedConfig = await getAdminScoopConfig()
      setConfig(refreshedConfig)

      setMessage('Scoop option deleted successfully.')
    } catch (error) {
      console.error('Could not delete Scoop option:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'Could not delete Scoop option.',
      )
    }
  }

  const handleAddOption = async () => {
    if (!addingOptionType || !newOptionName.trim()) {
      return
    }

    try {
      setAddingOption(true)
      setError('')
      setMessage('')

      await createAdminScoopOption({
        type: addingOptionType,
        name: newOptionName.trim(),
      })

      const refreshedConfig = await getAdminScoopConfig()
      setConfig(refreshedConfig)

      setNewOptionName('')
      setAddingOptionType(null)
      setMessage('Scoop option added successfully.')
    } catch (error) {
      console.error('Could not add Scoop option:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'Could not add Scoop option.',
      )
    } finally {
      setAddingOption(false)
    }
  }

  const renderOptions = (
    title: string,
    type: 'colour' | 'character' | 'item',
    options: AdminScoopOption[],
  ) => (
    <section className="admin-scoop-section">
      <div className="admin-scoop-section-header">
        <div>
          <h2>{title}</h2>

          <p>
            {options.length}{' '}
            {options.length === 1
              ? 'option'
              : 'options'}
          </p>
        </div>

        <button
          type="button"
          className="admin-scoop-add-button"
          onClick={() => {
            setAddingOptionType(type)
            setNewOptionName('')
            setError('')
            setMessage('')
          }}
        >
          + Add
        </button>
      </div>

      {addingOptionType === type && (
        <div className="admin-scoop-add-form">
          <input
            type="text"
            value={newOptionName}
            onChange={(event) =>
              setNewOptionName(event.target.value)
            }
            placeholder={`Enter ${title.slice(0, -1).toLowerCase()} name`}
            autoFocus
          />

          <button
            type="button"
            className="admin-scoop-save-button"
            onClick={handleAddOption}
            disabled={
              addingOption ||
              !newOptionName.trim()
            }
          >
            {addingOption ? 'Adding...' : 'Add'}
          </button>

          <button
            type="button"
            className="admin-scoop-cancel-button"
            onClick={() => {
              setAddingOptionType(null)
              setNewOptionName('')
            }}
            disabled={addingOption}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="admin-scoop-options">
        {options.map((option) => (
          <div
            key={option.id}
            className="admin-scoop-option"
          >
            <div>
              <strong>{option.name}</strong>

              <span>
                Order: {option.sortOrder}
              </span>
            </div>

            <button
              type="button"
              className={
                option.active
                  ? 'admin-scoop-toggle active'
                  : 'admin-scoop-toggle'
              }
              onClick={() =>
                handleOptionToggle(type, option)
              }
              aria-pressed={option.active}
            >
              <span className="admin-scoop-toggle-track">
                <span className="admin-scoop-toggle-thumb" />
              </span>

              <span>
                {option.active
                  ? 'Active'
                  : 'Inactive'}
              </span>
            </button>

            <button
              type="button"
              className="admin-scoop-delete-button"
              onClick={() => handleDeleteOption(type, option)}
            >
              Delete
            </button>

          </div>
        ))}
      </div>
    </section>
  )

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          Loading Scoop Management...
        </div>
      </div>
    )
  }

  if (error && !config) {
    return (
      <div className="admin-page">
        <div className="products-error">
          {error}
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="admin-page">
        <div className="products-error">
          Scoop configuration is unavailable.
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page scoop-management-page">
      <div className="admin-scoop-header">
        <div>
          <span className="admin-eyebrow">
            HER PRETTY THINGS
          </span>

          <h1>Scoop Management</h1>

          <p>
            Manage Scoop pricing, shipping, limits,
            and customization options.
          </p>
        </div>
      </div>

      <section className="scoop-management-section">
        <div className="scoop-management-section-header">
          <div>
            <h2>Scoop Image</h2>
            <p>
              Upload the image displayed for Mystery Scoop in the admin product list.
            </p>
          </div>
        </div>

        {config?.setting.imageUrl && (
          <div className="scoop-image-preview">
            <img
              src={config.setting.imageUrl}
              alt="Mystery Scoop"
            />
          </div>
        )}

        <label className="scoop-image-upload">
          <span>
            {uploadingImage ? 'Uploading...' : 'Choose Image'}
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
        </label>

        {imageMessage && (
          <p className="scoop-image-message">
            {imageMessage}
          </p>
        )}
      </section>
      <section className="admin-scoop-section">
        <div className="admin-scoop-section-header">
          <div>
            <h2>Pricing & Limits</h2>

            <p>
              Update the Scoop configuration used by
              the storefront.
            </p>
          </div>

          <button
            type="button"
            className="admin-button"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {message && (
          <div className="admin-success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="products-error">
            {error}
          </div>
        )}

        <div className="admin-scoop-settings-grid">
          <label className="admin-scoop-setting">
            <span>First Scoop Price</span>

            <div className="admin-scoop-input">
              <span>₹</span>

              <input
                type="number"
                min="0"
                step="1"
                value={firstScoopPrice}
                onChange={(event) =>
                  setFirstScoopPrice(
                    event.target.value,
                  )
                }
              />
            </div>
          </label>

          <label className="admin-scoop-setting">
            <span>Additional Scoop Price</span>

            <div className="admin-scoop-input">
              <span>₹</span>

              <input
                type="number"
                min="0"
                step="1"
                value={additionalScoopPrice}
                onChange={(event) =>
                  setAdditionalScoopPrice(
                    event.target.value,
                  )
                }
              />
            </div>
          </label>

          <label className="admin-scoop-setting">
            <span>Maximum Scoops</span>

            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={maxScoops}
              onChange={(event) =>
                setMaxScoops(event.target.value)
              }
            />
          </label>

          <label className="admin-scoop-setting">
            <span>Preferred Items Limit</span>

            <input
              type="number"
              min="0"
              max="20"
              step="1"
              value={maxPreferredItems}
              onChange={(event) =>
                setMaxPreferredItems(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="admin-scoop-setting">
            <span>Excluded Items Limit</span>

            <input
              type="number"
              min="0"
              max="20"
              step="1"
              value={maxExcludedItems}
              onChange={(event) =>
                setMaxExcludedItems(
                  event.target.value,
                )
              }
            />
          </label>

          <div className="admin-scoop-setting">
            <span>Configuration Status</span>

            <strong>
              {config.setting.active
                ? 'Active'
                : 'Inactive'}
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-scoop-section">
        <div className="admin-scoop-section-header">
          <div>
            <h2>Shipping Rules</h2>

            <p>
              Shipping amount based on total number
              of Scoops.
            </p>
          </div>
        </div>

        <div className="admin-scoop-shipping-table">
          <div className="admin-scoop-shipping-row header">
            <span>Scoops</span>
            <span>Shipping</span>
            <span>Status</span>
          </div>

          {config.shippingRules.map((rule) => (
            <div
              key={rule.id}
              className="admin-scoop-shipping-row"
            >
              <strong>
                {rule.scoopCount}
                {rule.scoopCount === 1
                  ? ' Scoop'
                  : ' Scoops'}
              </strong>

              <strong>₹{rule.shipping}</strong>

              <span
                className={
                  rule.active
                    ? 'admin-scoop-status active'
                    : 'admin-scoop-status inactive'
                }
              >
                {rule.active
                  ? 'Active'
                  : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {renderOptions(
        'Colours',
        'colour',
        config.colours,
      )}

      {renderOptions(
        'Characters',
        'character',
        config.characters,
      )}

      {renderOptions(
        'Scoop Items',
        'item',
        config.items,
      )}
    </div>
  )
}

export default ScoopManagement