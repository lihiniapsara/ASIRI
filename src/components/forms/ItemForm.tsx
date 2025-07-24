import React, { useState, useEffect } from "react"
import type { Item } from "../../types/Item"

interface ItemFormProps {
  item?: Item | null
  onSubmit: (itemData: Omit<Item, "id">) => void
}

interface ItemFormData {
  name: string
  price: string
}

interface FormErrors {
  name?: string
  price?: string
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit }) => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    price: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price.toString(),
      })
    } else {
      setFormData({
        name: "",
        price: "",
      })
    }
    setErrors({})
  }, [item])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Item name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Item name must be at least 2 characters"
    }

    // Price validation
    if (!formData.price.trim()) {
      newErrors.price = "Price is required"
    } else {
      const priceValue = parseFloat(formData.price)
      if (isNaN(priceValue)) {
        newErrors.price = "Price must be a valid number"
      } else if (priceValue <= 0) {
        newErrors.price = "Price must be greater than 0"
      } else if (priceValue > 999999.99) {
        newErrors.price = "Price cannot exceed $999,999.99"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        price: parseFloat(formData.price),
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleChange(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
          Item Name
        </label>
        <input
          type='text'
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.name ? "border-red-300" : "border-gray-300"
          }`}
          placeholder='Enter item name'
        />
        {errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor='price' className='block text-sm font-medium text-gray-700 mb-1'>
          Price ($)
        </label>
        <input
          type='text'
          id='price'
          name='price'
          value={formData.price}
          onChange={handlePriceChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.price ? "border-red-300" : "border-gray-300"
          }`}
          placeholder='0.00'
        />
        {errors.price && <p className='mt-1 text-sm text-red-600'>{errors.price}</p>}
      </div>
    </form>
  )
}

export default ItemForm
