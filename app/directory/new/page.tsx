import PersonForm from '@/components/directory/PersonForm'

export default function NewPersonPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Добавяне на Нов Човек</h1>
          <p className="mt-1 text-sm text-gray-500">
             Въведете данните за новия член, доброволец или симпатизант.
          </p>
        </div>
        
        <PersonForm />
      </div>
    </div>
  )
}
