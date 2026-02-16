# Communication Features Implementation Plan

> **For Claude:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add email composition, WhatsApp messaging, and direct call features to the political CRM for bulk communication with selected people.

**Architecture:** Create a reusable communication component that can be used in:
- Groups page (bulk actions)
- Directory page (selected people)
- Individual profile page

**Tech Stack:** 
- React (Next.js)
- Tailwind CSS
- Existing toast notifications (sonner)
- WhatsApp API (wa.me links)
- tel: and mailto: protocols

---

### Task 1: Create Email Compose Modal Component

**Files:**
- Create: `components/communication/EmailComposeModal.tsx`

**Step 1: Create modal with form**

```tsx
// components/communication/EmailComposeModal.tsx
'use client'

import { useState } from 'react'
import { X, Send, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface EmailComposeModalProps {
  isOpen: boolean
  onClose: () => void
  recipients: { email: string; name: string }[]
  subject?: string
}

export default function EmailComposeModal({ isOpen, onClose, recipients, subject = '' }: EmailComposeModalProps) {
  const [emailSubject, setEmailSubject] = useState(subject)
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  if (!isOpen) return null

  const handleSend = () => {
    // Create mailto link with subject and body
    const recipientEmails = recipients.map(r => r.email).join(',')
    const mailto = `mailto:${recipientEmails}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    toast.success(`Отворен имейл клиент за ${recipients.length} получателя`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ново съобщение</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            До: {recipients.map(r => r.name).join(', ')}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Относно</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Заглавие на съобщението..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Съобщение</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Напишете вашето съобщение..."
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-xl hover:bg-slate-50"
          >
            Отказ
          </button>
          <button
            onClick={handleSend}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            Изпрати
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Test by adding to groups page**

Modify: `app/groups/page.tsx` to use EmailComposeModal in the bulk actions section.

---

### Task 2: Create WhatsApp Message Component

**Files:**
- Create: `components/communication/WhatsAppButton.tsx`

**Step 1: Create WhatsApp button component**

```tsx
// components/communication/WhatsAppButton.tsx
'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phone: string
  message?: string
  name?: string
}

export default function WhatsAppButton({ phone, message = '', name }: WhatsAppButtonProps) {
  const formatPhone = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    // If it starts with 0, remove it and add 359
    if (digits.startsWith('0')) {
      return '359' + digits.slice(1)
    }
    // If it doesn't start with 359, add it
    if (!digits.startsWith('359')) {
      return '359' + digits
    }
    return digits
  }

  const handleClick = () => {
    const formattedPhone = formatPhone(phone)
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
      title={name ? `WhatsApp на ${name}` : 'WhatsApp'}
    >
      <MessageCircle className="h-4 w-4" />
    </button>
  )
}
```

**Step 2: Add to PersonCard and group member display**

Modify: `components/directory/PersonCard.tsx` and `app/groups/page.tsx` to include WhatsAppButton.

---

### Task 3: Add Direct Call Button

**Files:**
- Modify: `components/directory/PersonCard.tsx`
- Modify: `app/groups/page.tsx`

**Step 1: Add phone call button to PersonCard**

Add after the email button:
```tsx
<a 
  href={`tel:${person.phone}`}
  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
  title="Обади се"
>
  <Phone className="h-4 w-4" />
</a>
```

---

### Task 4: Integrate Communication Features into Groups Page

**Files:**
- Modify: `app/groups/page.tsx`

**Step 1: Import and add communication buttons**

Add imports:
```tsx
import EmailComposeModal from '@/components/communication/EmailComposeModal'
import WhatsAppButton from '@/components/communication/WhatsAppButton'
import { Phone, Mail } from 'lucide-react'
```

**Step 2: Add state for modals**

```tsx
const [showEmailModal, setShowEmailModal] = useState(false)
const [emailRecipients, setEmailRecipients] = useState<{email: string; name: string}[]>([])
```

**Step 3: Replace email button with new functionality**

Replace simple email button with:
```tsx
<button
  onClick={() => {
    setEmailRecipients(members.map(m => ({ 
      email: m.person.email || '', 
      name: m.person.fullName 
    })).filter(r => r.email))
    setShowEmailModal(true)
  }}
  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
  title="Имейл"
>
  <Mail className="h-4 w-4" />
</button>
```

**Step 4: Add modal to render**

Add before closing div:
```tsx
{showEmailModal && (
  <EmailComposeModal
    isOpen={showEmailModal}
    onClose={() => setShowEmailModal(false)}
    recipients={emailRecipients}
  />
)}
```

---

### Task 5: Update Directory Page with Communication Features

**Files:**
- Modify: `components/directory/DirectoryGrid.tsx`

**Step 1: Add email compose to bulk actions**

Add EmailComposeModal to DirectoryGrid and add button in the floating action bar.

---

## Testing Checklist

- [ ] Email compose modal opens with recipients
- [ ] Email opens default mail client with BCC
- [ ] WhatsApp button opens wa.me with correct phone
- [ ] Phone button triggers tel: link
- [ ] Bulk email works from groups page
- [ ] Toast notifications work for all actions
