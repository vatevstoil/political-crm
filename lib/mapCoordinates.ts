export interface CityCoordinate {
  lat: number
  lng: number
  name: string
}

export const BULGARIAN_CITIES: Record<string, CityCoordinate> = {
  'софия': { lat: 42.6977, lng: 23.3219, name: 'София' },
  'пловдив': { lat: 42.1449, lng: 24.7501, name: 'Пловдив' },
  'варна': { lat: 43.2141, lng: 27.9147, name: 'Варна' },
  'бургac': { lat: 42.5048, lng: 27.4626, name: 'Бургас' },
  'русе': { lat: 43.8356, lng: 25.9657, name: 'Русе' },
  'стара загора': { lat: 42.4258, lng: 25.6345, name: 'Стара Загора' },
  'плевен': { lat: 43.4170, lng: 24.6067, name: 'Плевен' },
  'сливен': { lat: 42.6817, lng: 26.3229, name: 'Сливен' },
  'добрич': { lat: 43.5667, lng: 27.8333, name: 'Добрич' },
  'шумен': { lat: 43.2712, lng: 26.9261, name: 'Шумен' },
  'перник': { lat: 42.6052, lng: 23.0378, name: 'Перник' },
  'хасково': { lat: 41.9342, lng: 25.5556, name: 'Хасково' },
  'ябълница': { lat: 43.0314, lng: 24.1136, name: 'Ябълница' },
  'ямбол': { lat: 42.4842, lng: 26.5035, name: 'Ямбол' },
  'пазарджик': { lat: 42.1928, lng: 24.3336, name: 'Пазарджик' },
  'благоевград': { lat: 42.0209, lng: 23.0943, name: 'Благоевград' },
  'велико търново': { lat: 43.0757, lng: 25.6172, name: 'Велико Търново' },
  'враца': { lat: 43.2046, lng: 23.5486, name: 'Враца' },
  'габрово': { lat: 42.8743, lng: 25.3175, name: 'Габрово' },
  'асеновград': { lat: 42.0105, lng: 24.8767, name: 'Асеновград' },
  'видин': { lat: 43.9962, lng: 22.8679, name: 'Видин' },
  'казанлък': { lat: 42.6194, lng: 25.3949, name: 'Казанлък' },
  'кюстендил': { lat: 42.2839, lng: 22.6911, name: 'Кюстендил' },
  'кърджали': { lat: 41.6389, lng: 25.3672, name: 'Кърджали' },
  'монтана': { lat: 43.4125, lng: 23.2250, name: 'Монтана' },
  'димитровград': { lat: 42.0611, lng: 25.5894, name: 'Димитровград' },
  'търговище': { lat: 43.2512, lng: 26.5722, name: 'Търговище' },
  'ловеч': { lat: 43.1370, lng: 24.7142, name: 'Ловеч' },
  'силистра': { lat: 44.1167, lng: 27.2667, name: 'Силистра' },
  'дупница': { lat: 42.2660, lng: 23.1163, name: 'Дупница' },
  'свищов': { lat: 43.6231, lng: 25.3522, name: 'Свищов' },
  'разград': { lat: 43.5262, lng: 26.5242, name: 'Разград' },
  'горна оряховица': { lat: 43.1256, lng: 25.7001, name: 'Горна Оряховица' },
  'смолян': { lat: 41.5772, lng: 24.7011, name: 'Смолян' },
  'петрич': { lat: 41.3986, lng: 23.2075, name: 'Петрич' },
  'сандански': { lat: 41.5658, lng: 23.2783, name: 'Сандански' },
  'самоков': { lat: 42.3386, lng: 23.5511, name: 'Самоков' },
  'севлиево': { lat: 43.0258, lng: 25.1114, name: 'Севлиево' },
  'лом': { lat: 43.8242, lng: 23.2367, name: 'Лом' },
  'карлово': { lat: 42.6369, lng: 24.8061, name: 'Карлово' },
  'велинград': { lat: 42.0294, lng: 23.9934, name: 'Велинград' },
  'нова загора': { lat: 42.4925, lng: 26.0122, name: 'Нова Загора' },
  'троян': { lat: 42.8833, lng: 24.7167, name: 'Троян' },
  'айтос': { lat: 42.7006, lng: 27.2511, name: 'Айтос' },
  'ботевград': { lat: 42.9078, lng: 23.7919, name: 'Ботевград' },
  'харманли': { lat: 41.9333, lng: 25.9000, name: 'Харманли' },
  'пещера': { lat: 42.0286, lng: 24.3006, name: 'Пещера' },
  'гоце делчев': { lat: 41.5714, lng: 23.7264, name: 'Гоце Делчев' },
  'свиленград': { lat: 41.9667, lng: 26.2833, name: 'Свиленград' },
  'исперих': { lat: 43.7000, lng: 26.8000, name: 'Исперих' },
  'берковица': { lat: 43.2333, lng: 23.1667, name: 'Берковица' },
  'трявна': { lat: 42.8833, lng: 25.5000, name: 'Трявна' },
  'палango': { lat: 43.4000, lng: 24.8667, name: 'Палango' },
  'раковски': { lat: 42.3000, lng: 24.9667, name: 'Раковски' },
  'несебър': { lat: 42.6500, lng: 27.7333, name: 'Несебър' },
  'поморие': { lat: 42.6167, lng: 27.6000, name: 'Поморие' },
  'созопол': { lat: 42.4333, lng: 27.7000, name: 'Созопол' },
  'приморско': { lat: 42.2667, lng: 27.7500, name: 'Приморско' },
  'симитли': { lat: 41.8833, lng: 23.1667, name: 'Симитли' },
  'мелник': { lat: 41.5167, lng: 23.2833, name: 'Мелник' },
  'батак': { lat: 41.9500, lng: 24.0667, name: 'Батак' },
  'рудозем': { lat: 41.4833, lng: 24.8333, name: 'Рудозем' },
  'мадан': { lat: 41.5167, lng: 24.9333, name: 'Мадан' },
  'еолница': { lat: 43.2833, lng: 26.6500, name: 'Еолница' },
  // France
  'paris': { lat: 48.8566, lng: 2.3522, name: 'Paris' },
  'marseille': { lat: 43.2965, lng: 5.3698, name: 'Marseille' },
  'lyon': { lat: 45.7640, lng: 4.8357, name: 'Lyon' },
  'toulouse': { lat: 43.6047, lng: 1.4442, name: 'Toulouse' },
  'nice': { lat: 43.7102, lng: 7.2620, name: 'Nice' },
  'strasbourg': { lat: 48.5734, lng: 7.7521, name: 'Strasbourg' },
  'bordeaux': { lat: 44.8378, lng: -0.5792, name: 'Bordeaux' },
  'bordeau': { lat: 44.8378, lng: -0.5792, name: 'Bordeaux' },
  'grenoble': { lat: 45.1885, lng: 5.7245, name: 'Grenoble' },
  'anger': { lat: 47.4784, lng: -0.5632, name: 'Angers' },
  'angers': { lat: 47.4784, lng: -0.5632, name: 'Angers' },
  'geneve': { lat: 46.2044, lng: 6.1432, name: 'Genève' },
  'genève': { lat: 46.2044, lng: 6.1432, name: 'Genève' },
  'geneva': { lat: 46.2044, lng: 6.1432, name: 'Genève' },
  'dijon': { lat: 47.3220, lng: 5.0415, name: 'Dijon' },
  'valence': { lat: 44.9334, lng: 4.8924, name: 'Valence' },
}

const CITY_VARIATIONS: Record<string, string> = {
  'софия': 'софия',
  'sofia': 'софия',
  'plovdiv': 'пловдив',
  'varna': 'варна',
  'burgas': 'бургac',
  'ruse': 'русе',
  'stara zagora': 'стара загора',
  'плевен': 'плевен',
  'pleven': 'плевен',
  'sliven': 'сливен',
  'dobrich': 'добрич',
  'shumen': 'шумен',
  'pernik': 'перник',
  'haskovo': 'хасково',
  'yambol': 'ямбол',
  'pazardzhik': 'пазарджик',
  'blagoevgrad': 'благоевград',
  'veliko tarnovo': 'велико търново',
  'vratsa': 'враца',
  'gabrovo': 'габрово',
  'asenovgrad': 'асеновград',
  'vidin': 'видин',
  'kazanluk': 'казанлък',
  'kyustendil': 'кюстендил',
  'kardzhali': 'кърджали',
  'montana': 'монтана',
  'dimitrovgrad': 'димитровград',
  'targovishte': 'търговище',
  'lovech': 'ловеч',
  'silistra': 'силистра',
  'dupnica': 'дупница',
  'svishtov': 'свищов',
  'razgrad': 'разград',
  'gorna oryahovitsa': 'горна оряховица',
  'smolyan': 'смолян',
  'petrich': 'петрич',
  'sandanski': 'сандански',
  'samokov': 'самоков',
  'sevlievo': 'севлиево',
  'lom': 'лом',
  'karlovo': 'карлово',
  'velingrad': 'велинград',
  'nova zagora': 'нова загора',
  'troyan': 'троян',
  'aytos': 'айтос',
  'botevgrad': 'ботевград',
  'harmanli': 'харманли',
  'peshters': 'пещера',
  'goce delchev': 'гоце делчев',
}

export function getCoordinatesForCity(city: string | null | undefined): CityCoordinate | null {
  if (!city) return null
  
  const normalized = city.toLowerCase().trim()
  
  if (BULGARIAN_CITIES[normalized]) {
    return BULGARIAN_CITIES[normalized]
  }
  
  const variation = CITY_VARIATIONS[normalized]
  if (variation && BULGARIAN_CITIES[variation]) {
    return BULGARIAN_CITIES[variation]
  }
  
  for (const [key, coords] of Object.entries(BULGARIAN_CITIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords
    }
  }
  
  return null
}
