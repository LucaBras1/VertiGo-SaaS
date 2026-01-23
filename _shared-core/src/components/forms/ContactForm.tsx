'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/ui/Button'
import { FormField, Input, Textarea, Select } from './FormField'
import { contactFormSchema, type ContactFormData, subjectOptions } from '@/lib/validations/contact'
import { CheckCircle, XCircle } from 'lucide-react'

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>({ type: 'idle' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setStatus({ type: 'loading' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Děkujeme za zprávu! Odpovíme vám co nejdříve.',
        })
        reset()
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Něco se pokazilo. Zkuste to prosím znovu.',
        })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Nepodařilo se odeslat zprávu. Zkontrolujte připojení k internetu.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Name */}
      <FormField label="Jméno a příjmení" required error={errors.name?.message}>
        <Input
          type="text"
          placeholder="Jan Novák"
          hasError={!!errors.name}
          {...register('name')}
        />
      </FormField>

      {/* Email */}
      <FormField label="E-mail" required error={errors.email?.message}>
        <Input
          type="email"
          placeholder="jan.novak@email.cz"
          hasError={!!errors.email}
          {...register('email')}
        />
      </FormField>

      {/* Phone */}
      <FormField label="Telefon" error={errors.phone?.message} hint="Nepovinné">
        <Input
          type="tel"
          placeholder="+420 123 456 789"
          hasError={!!errors.phone}
          {...register('phone')}
        />
      </FormField>

      {/* Subject */}
      <FormField label="Předmět" required error={errors.subject?.message}>
        <Select hasError={!!errors.subject} {...register('subject')}>
          {subjectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      {/* Message */}
      <FormField label="Zpráva" required error={errors.message?.message}>
        <Textarea
          rows={6}
          placeholder="Napište nám váš dotaz nebo požadavek..."
          hasError={!!errors.message}
          {...register('message')}
        />
      </FormField>

      {/* Status Messages */}
      {status.type === 'success' && (
        <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{status.message}</span>
          </div>
        </div>
      )}

      {status.type === 'error' && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{status.message}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting || status.type === 'loading'}
      >
        {isSubmitting || status.type === 'loading' ? 'Odesílám...' : 'Odeslat zprávu'}
      </Button>

      <p className="text-sm text-neutral-gray-400 text-center">
        Odesláním souhlasíte se zpracováním osobních údajů za účelem odpovědi
        na váš dotaz.
      </p>
    </form>
  )
}
