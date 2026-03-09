import nodemailer from 'nodemailer'

const ALLOWED_TEMPLATE_KEYS = [
  'firstName',
  'fullName', 
  'email',
  'city',
  'profession',
  'phone',
  'role',
  'organization',
] as const

type AllowedKey = typeof ALLOWED_TEMPLATE_KEYS[number]

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function sanitizeData(data: Record<string, string>): Record<AllowedKey, string> {
  const sanitized: Record<string, string> = {}
  for (const key of ALLOWED_TEMPLATE_KEYS) {
    if (data[key] !== undefined) {
      sanitized[key] = String(data[key]).slice(0, 500)
    }
  }
  return sanitized
}

export async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  console.log('No SMTP config found. Generating Ethereal test account...')
  const testAccount = await nodemailer.createTestAccount()
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })
}

function interpolateTemplate(template: string, data: Record<string, string>): string {
  const sanitizedData = sanitizeData(data)
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (ALLOWED_TEMPLATE_KEYS.includes(key as AllowedKey)) {
      const typedKey = key as AllowedKey
      return sanitizedData[typedKey] !== undefined ? sanitizedData[typedKey] : match
    }
    return match
  })
}

interface SendEmailParams {
  to: string
  subjectTemplate: string
  bodyTemplate: string
  data: Record<string, string>
  fromEmail?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendTemplatedEmail({ to, subjectTemplate, bodyTemplate, data, fromEmail }: SendEmailParams) {
  if (!EMAIL_REGEX.test(to)) {
    throw new Error('Невалиден имейл адрес')
  }
  
  if (subjectTemplate.length > 500 || bodyTemplate.length > 50000) {
    throw new Error('Превишен размер на шаблона')
  }
  
  const transporter = await getTransporter()
  
  const subject = interpolateTemplate(subjectTemplate, data)
  const text = interpolateTemplate(bodyTemplate, data)
  const escapedText = escapeHtml(text)
  
  const info = await transporter.sendMail({
    from: fromEmail || process.env.SMTP_FROM || '"Political CRM" <no-reply@crm.bg>',
    to,
    subject: subject.slice(0, 200),
    text,
    html: escapedText.replace(/\n/g, '<br/>'),
  })

  if (info.messageId && !process.env.SMTP_HOST) {
    console.log('Preview Email URL: %s', nodemailer.getTestMessageUrl(info))
  }

  return info
}
