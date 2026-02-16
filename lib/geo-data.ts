export interface CityCoordinates {
  name: string
  lat: number
  lng: number
}

// Координати на основните български градове
export const cityCoordinates: Record<string, CityCoordinates> = {
  'София': { name: 'София', lat: 42.6977, lng: 23.3219 },
  'Пловдив': { name: 'Пловдив', lat: 42.1354, lng: 24.7453 },
  'Варна': { name: 'Варна', lat: 43.2141, lng: 27.9147 },
  'Бургас': { name: 'Бургас', lat: 42.5048, lng: 27.4626 },
  'Русе': { name: 'Русе', lat: 43.8356, lng: 25.9657 },
  'Стара Загора': { name: 'Стара Загора', lat: 42.4258, lng: 25.6345 },
  'Плевен': { name: 'Плевен', lat: 43.417, lng: 24.6067 },
  'Сливен': { name: 'Сливен', lat: 42.6819, lng: 26.3229 },
  'Добрич': { name: 'Добрич', lat: 43.5726, lng: 27.8273 },
  'Шумен': { name: 'Шумен', lat: 43.2742, lng: 26.919 },
  'Перник': { name: 'Перник', lat: 42.6052, lng: 23.0378 },
  'Хасково': { name: 'Хасково', lat: 41.9341, lng: 25.5557 },
  'Ямбол': { name: 'Ямбол', lat: 42.4823, lng: 26.5004 },
  'Пазарджик': { name: 'Пазарджик', lat: 42.1928, lng: 24.3336 },
  'Благоевград': { name: 'Благоевград', lat: 42.0209, lng: 23.0943 },
  'Велико Търново': { name: 'Велико Търново', lat: 43.0757, lng: 25.6172 },
  'Враца': { name: 'Враца', lat: 43.2102, lng: 23.5528 },
  'Габрово': { name: 'Габрово', lat: 42.8742, lng: 25.3187 },
  'Асеновград': { name: 'Асеновград', lat: 42.01, lng: 24.8743 },
  'Видин': { name: 'Видин', lat: 43.9962, lng: 22.8679 },
  'Казанлък': { name: 'Казанлък', lat: 42.6194, lng: 25.3929 },
  'Кърджали': { name: 'Кърджали', lat: 41.6455, lng: 25.3711 },
  'Кюстендил': { name: 'Кюстендил', lat: 42.2869, lng: 22.6939 },
  'Монтана': { name: 'Монтана', lat: 43.4085, lng: 23.2257 },
  'Силистра': { name: 'Силистра', lat: 44.1147, lng: 27.2672 },
  'Търговище': { name: 'Търговище', lat: 43.2462, lng: 26.5698 },
  'Ловеч': { name: 'Ловеч', lat: 43.137, lng: 24.714 },
  'Разград': { name: 'Разград', lat: 43.5242, lng: 26.5243 },
}

// Център на България за начален изглед
export const BULGARIA_CENTER = {
  lat: 42.7339,
  lng: 25.4858,
}

export const BULGARIA_BOUNDS = {
  north: 44.215,
  south: 41.235,
  west: 22.357,
  east: 28.609,
}

// Функция за намиране на координати по име на град
export function getCityCoordinates(cityName: string): CityCoordinates | null {
  // Търсене по точно съвпадение
  if (cityCoordinates[cityName]) {
    return cityCoordinates[cityName]
  }

  // Търсене по частично съвпадение (case-insensitive)
  const normalizedName = cityName.toLowerCase().trim()
  for (const [key, value] of Object.entries(cityCoordinates)) {
    if (key.toLowerCase() === normalizedName) {
      return value
    }
  }

  return null
}
