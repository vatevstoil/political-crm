import '@testing-library/jest-dom'

// Mock next/cache for server-side functions used in tests
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: Function) => fn,
}))
