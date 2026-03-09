'use client'

import { createPerson, updatePerson, CreatePersonState } from '@/app/actions/people'
import { useActionState } from 'react'
import { User, Mail, Phone, MapPin, Briefcase, CreditCard, Camera, Facebook, Linkedin, Instagram, Calendar, Users, Hash, Map } from 'lucide-react'
import Link from 'next/link'
import { Person } from '@prisma/client'

type PersonWithExtra = Person & {
  votingMobile?: string | null
  pensioner?: boolean
  disability?: string | null
  employer?: string | null
  university?: string | null
  specialty?: string | null
}

interface PersonFormProps {
  initialData?: PersonWithExtra
  backHref?: string
}

export default function PersonForm({ initialData, backHref = '/directory' }: PersonFormProps) {
  const initialState: CreatePersonState = { message: null, errors: {} }
  const [state, formAction, isPending] = useActionState(
    initialData ? updatePerson.bind(null, initialData.id) : createPerson,
    initialState
  )

  // Helper to format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  return (
    <form action={formAction} className="bg-white dark:bg-slate-800 shadow dark:shadow-slate-900/50 rounded-lg overflow-hidden">
      <div className="p-6 space-y-8">
        
        {/* Global Error Message */}
        {state.message && (
          <div className={`p-4 rounded-md ${state.errors ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
            {state.message}
          </div>
        )}

        {/* --- Основна Информация --- */}
        <div>
          <h3 className="text-[18px] font-bold leading-6 text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2 mb-4">Основна Информация</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            {/* Full Name (Bulgarian) */}
            <div className="sm:col-span-3">
              <label htmlFor="fullName" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Име и Фамилия (BG) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  defaultValue={initialData?.fullName}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="Иван Иванов"
                />
              </div>
              {state.errors?.fullName && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.fullName.join(', ')}</p>
              )}
            </div>

            {/* Full Name (English) */}
            <div className="sm:col-span-3">
              <label htmlFor="fullNameEn" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Name (EN)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullNameEn"
                  id="fullNameEn"
                  defaultValue={(initialData as Record<string, unknown>)?.fullNameEn as string | undefined}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="Ivan Ivanov"
                />
              </div>
            </div>

            {/* Role */}
            <div className="sm:col-span-3">
              <label htmlFor="role" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Роля
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <select
                  name="role"
                  id="role"
                  defaultValue={initialData?.role || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                >
                  <option value="">Изберете роля</option>
                  <option value="Координатор">Координатор</option>
                  <option value="Член">Член</option>
                  <option value="Симпатизант">Симпатизант</option>
                  <option value="Доброволец">Доброволец</option>
                </select>
              </div>
              {state.errors?.role && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.role.join(', ')}</p>
              )}
            </div>

            {/* Status */}
            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Статус
              </label>
              <select
                name="status"
                id="status"
                defaultValue={initialData?.status || 'Active'}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
              >
                <option value="Active">Активен</option>
                <option value="Inactive">Неактивен</option>
                <option value="Excluded">Изключен</option>
              </select>
            </div>

            {/* Membership Card ID */}
            <div className="sm:col-span-3">
              <label htmlFor="membershipCardId" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Номер на карта
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="membershipCardId"
                  id="membershipCardId"
                  defaultValue={initialData?.membershipCardId || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="ABC-12345"
                />
              </div>
            </div>

             {/* Photo URL */}
             <div className="sm:col-span-6">
              <label htmlFor="photoUrl" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Снимка (URL)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Camera className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="photoUrl"
                  id="photoUrl"
                  defaultValue={initialData?.photoUrl || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              {state.errors?.photoUrl && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.photoUrl.join(', ')}</p>
              )}
            </div>

          </div>
        </div>

        {/* --- Контакти и Социални Мрежи --- */}
        <div>
          <h3 className="text-[18px] font-bold leading-6 text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2 mb-4">Контакти и Социални Мрежи</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Email */}
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Имейл
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={initialData?.email || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="ivan@example.com"
                />
              </div>
              {state.errors?.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.email.join(', ')}</p>
              )}
            </div>

            {/* Phone */}
            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Телефон
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  defaultValue={initialData?.phone || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="0888 123 456"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="sm:col-span-2">
              <label htmlFor="socialFb" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Facebook
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Facebook className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="socialFb"
                  id="socialFb"
                  defaultValue={initialData?.socialFb || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="https://facebook.com/..."
                />
              </div>
              {state.errors?.socialFb && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.socialFb.join(', ')}</p>
              )}
            </div>

            {/* Instagram */}
            <div className="sm:col-span-2">
              <label htmlFor="socialInstagram" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Instagram
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Instagram className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="socialInstagram"
                  id="socialInstagram"
                  defaultValue={initialData?.socialInstagram || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="https://instagram.com/..."
                />
              </div>
              {state.errors?.socialInstagram && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.socialInstagram.join(', ')}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="sm:col-span-2">
              <label htmlFor="socialLinkedin" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                LinkedIn
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Linkedin className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="socialLinkedin"
                  id="socialLinkedin"
                  defaultValue={initialData?.socialLinkedin || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              {state.errors?.socialLinkedin && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.socialLinkedin.join(', ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* --- Локация --- */}
        <div>
          <h3 className="text-[18px] font-bold leading-6 text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2 mb-4">Локация</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            {/* Region */}
            <div className="sm:col-span-2">
              <label htmlFor="region" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Област
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Map className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="region"
                  id="region"
                  defaultValue={initialData?.region || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="София-град"
                />
              </div>
            </div>

             {/* City */}
             <div className="sm:col-span-2">
              <label htmlFor="city" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Град/Село
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="city"
                  id="city"
                  defaultValue={initialData?.city || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="София"
                />
              </div>
            </div>

            {/* Voting Section */}
            <div className="sm:col-span-2">
              <label htmlFor="votingSection" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Избирателна Секция
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  name="votingSection"
                  id="votingSection"
                  defaultValue={initialData?.votingSection || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="001"
                />
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Адрес
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="address"
                  id="address"
                  defaultValue={initialData?.address || ''}
                  className="block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
                  placeholder="ул. Витоша 1, ет. 2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Демография и Професия --- */}
        <div>
          <h3 className="text-[18px] font-bold leading-6 text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2 mb-4">Демография и Професия</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            {/* Birth Date */}
            <div className="sm:col-span-2">
              <label htmlFor="birthDate" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Дата на раждане
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <input
                  type="date"
                  name="birthDate"
                  id="birthDate"
                  defaultValue={formatDateForInput(initialData?.birthDate)}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="sm:col-span-2">
              <label htmlFor="gender" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Пол
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </div>
                <select
                  name="gender"
                  id="gender"
                  defaultValue={initialData?.gender || ''}
                  className="block w-full pl-10 rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] py-2.5 border text-gray-900 dark:text-slate-100 font-medium"
                >
                  <option value="">Непосочен</option>
                  <option value="Male">Мъж</option>
                  <option value="Female">Жена</option>
                  <option value="Other">Друго</option>
                </select>
              </div>
            </div>
            
            {/* Profession */}
            <div className="sm:col-span-2">
              <label htmlFor="profession" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Професия
              </label>
              <input
                type="text"
                name="profession"
                id="profession"
                defaultValue={initialData?.profession || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
                placeholder="Инженер"
              />
            </div>

             {/* Skills */}
             <div className="sm:col-span-6">
              <label htmlFor="skills" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Умения <span className="text-gray-500 dark:text-slate-400 text-[13px] font-normal">(разделени със запетая)</span>
              </label>
              <input
                type="text"
                name="skills"
                id="skills"
                defaultValue={initialData?.skills || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
                placeholder="Маркетинг, Организация, IT"
              />
            </div>

          </div>
        </div>

        {/* --- Политическа Информация --- */}
        <div>
          <h3 className="text-[18px] font-bold leading-6 text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2 mb-4">Политическа Информация</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            {/* Employer */}
            <div className="sm:col-span-3">
              <label htmlFor="employer" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Работодател
              </label>
              <input
                type="text"
                name="employer"
                id="employer"
                defaultValue={initialData?.employer || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
                placeholder="Държавна администрация"
              />
            </div>

            {/* University */}
            <div className="sm:col-span-3">
              <label htmlFor="university" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Университет
              </label>
              <input
                type="text"
                name="university"
                id="university"
                defaultValue={initialData?.university || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
                placeholder="Софийски университет"
              />
            </div>

            {/* Specialty */}
            <div className="sm:col-span-3">
              <label htmlFor="specialty" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Специалност
              </label>
              <input
                type="text"
                name="specialty"
                id="specialty"
                defaultValue={initialData?.specialty || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
                placeholder="Право"
              />
            </div>

            {/* Voting Mobile */}
            <div className="sm:col-span-3">
              <label htmlFor="votingMobile" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Мобилен за гласуване
              </label>
              <input
                type="text"
                name="votingMobile"
                id="votingMobile"
                defaultValue={initialData?.votingMobile || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] placeholder:text-gray-400 dark:placeholder-slate-400 py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
                placeholder="0888 123 456"
              />
            </div>

            {/* Pensioner */}
            <div className="sm:col-span-3">
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="pensioner"
                  id="pensioner"
                  defaultChecked={initialData?.pensioner || false}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded"
                />
                <label htmlFor="pensioner" className="ml-2 block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                  Пенсионер
                </label>
              </div>
            </div>

            {/* Disability */}
            <div className="sm:col-span-3">
              <label htmlFor="disability" className="block text-[14px] font-semibold text-gray-900 dark:text-slate-300">
                Увреждане
              </label>
              <select
                name="disability"
                id="disability"
                defaultValue={initialData?.disability || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-[15px] py-2.5 border px-3 text-gray-900 dark:text-slate-100 font-medium"
              >
                <option value="">Няма</option>
                <option value="Physical">Физическо</option>
                <option value="Visual">Зрително</option>
                <option value="Hearing">Слухово</option>
                <option value="Mental">Умствено</option>
                <option value="Other">Друго</option>
              </select>
            </div>

          </div>
        </div>

      </div>
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-end space-x-3">
        <Link
          href={backHref}
          className="inline-flex justify-center py-2.5 px-5 border border-gray-300 dark:border-slate-600 shadow-sm text-[14px] font-semibold rounded-md text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Отказ
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center py-2.5 px-5 border border-transparent shadow-sm text-[14px] font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPending ? 'Запазване...' : 'Запази'}
        </button>
      </div>
    </form>
  )
}
