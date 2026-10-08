export type ObjectTag = 'training' | 'permit' | 'operator'

export interface BookingObject {
  id: string
  categoryId: string
  title: string
  /** Обложка для карточек */
  image: string | null
  /** Галерея для модала (первое фото — обложка); может быть пустой */
  images: string[]
  tags: ObjectTag[]
  nearestSlot: string | null
  extraSlots: number
  building: string
  room: string
  /** Минимальная длительность брони, мин */
  minDuration: number
  /** slots — бронь по слотам, free — свободная бронь */
  bookingType: 'slots' | 'free'
  available: boolean
  description: string
  department: string
  contact: { name: string; email: string; phone: string }
  /** Услуги объекта; пустой список — выбор услуги не нужен */
  services: string[]
  documents: { id: string; title: string; required: boolean }[]
}

export interface TimeSlot {
  /** HH:mm */
  start: string
  end: string
  available: boolean
}

const defaultDescription =
  'Оборудование для проведения исследований и учебных работ. Перед началом работы необходимо пройти инструктаж и ознакомиться с инструкцией по эксплуатации. Доступно в рабочие часы лаборатории, запись по слотам.'

const baseExtra = {
  description: defaultDescription,
  department: 'ИМКТ',
  contact: { name: 'Иванов Иван Иванович', email: 'ivanov.ii@dvfu.ru', phone: '+7 (900) 123-45-67' },
  services: ['Измерение образцов', 'Калибровка оборудования', 'Обучение работе'],
  documents: [
    { id: 'safety', title: 'Инструктаж по ТБ', required: true },
    { id: 'manual', title: 'Инструкция по эксплуатации', required: false },
  ],
}

const img = (n: number) => new URL(`../assets/objects/${n}.jpg`, import.meta.url).href

const equipment = (
  n: number,
  title: string,
  image: number,
  tags: ObjectTag[],
  extra: Partial<BookingObject> = {},
): BookingObject => ({
  id: `eq-${n}`,
  categoryId: 'equipment',
  title,
  image: img(image),
  images: [img(image)],
  tags,
  nearestSlot: '01.07, 12:00-14:00',
  extraSlots: 5,
  building: 'Корпус L',
  room: 'L500',
  minDuration: 30,
  bookingType: 'slots',
  available: true,
  ...baseExtra,
  ...extra,
})

const objects: BookingObject[] = [
  equipment(1, 'Спектрометр для анализа образцов', 1, ['training', 'permit'], {
    description:
      'Спектрометр для качественного анализа состава образцов и измерения оптических характеристик. Подходит для учебных и исследовательских работ, требует предварительного допуска.',
    room: 'L240',
    images: [img(1), img(6), img(7), img(10), img(4)],
  }),
  equipment(2, '3D-принтер', 2, ['training'], {
    bookingType: 'free',
    minDuration: 60,
    images: [img(2), img(8)],
    services: [],
  }),
  equipment(3, 'Роботизированный манипулятор', 3, [], { minDuration: 300 }),
  equipment(4, 'Климатическая камера', 4, ['permit', 'operator'], { minDuration: 720 }),
  equipment(5, 'Осциллограф', 5, ['permit'], { bookingType: 'free' }),
  equipment(6, 'Спектрометр', 6, ['operator'], { minDuration: 15 }),
  equipment(7, 'Спектрофотометр', 7, []),
  equipment(8, 'Фрезерный станок', 8, ['training'], { minDuration: 300 }),
  equipment(9, 'Лазерный станок', 9, ['operator', 'training', 'permit'], { minDuration: 60 }),
  equipment(10, 'Электронный микроскоп', 10, [], { minDuration: 1440 }),
  equipment(11, 'Оптический микроскоп', 10, [], { nearestSlot: null, extraSlots: 0, available: false }),
  equipment(12, 'Центрифуга', 7, ['training'], { nearestSlot: null, extraSlots: 0, available: false }),
  {
    id: 'sv-1', categoryId: 'services', title: 'Калибровка оборудования', image: null, images: [], tags: ['operator'],
    nearestSlot: '23.07, 19:00-22:00', extraSlots: 2, building: 'Корпус M', room: 'M101',
    minDuration: 60, bookingType: 'slots', available: true,
    ...baseExtra,
  },
  {
    id: 'wp-1', categoryId: 'workplaces', title: 'Рабочее место в коворкинге', image: null, images: [], tags: [],
    nearestSlot: '01.07, 10:00-12:00', extraSlots: 8, building: 'Корпус L', room: 'L120',
    minDuration: 60, bookingType: 'free', available: true,
    ...baseExtra,
    services: [],
  },
  {
    id: 'mr-1', categoryId: 'meeting-rooms', title: 'Переговорная «Восток»', image: null, images: [], tags: [],
    nearestSlot: '02.07, 08:30-09:00', extraSlots: 12, building: 'Корпус S', room: 'S210',
    minDuration: 30, bookingType: 'slots', available: true,
    ...baseExtra,
    services: [],
  },
]

export async function fetchObjects(categoryId: string): Promise<BookingObject[]> {
  return objects.filter((o) => o.categoryId === categoryId)
}

/** Слоты по 30 минут с 06:00 до 22:00; для сегодняшнего дня прошедшие не показываются */
export function buildSlots(objectId: string, day: Date, now = new Date()): TimeSlot[] {
  const isToday = day.toDateString() === now.toDateString()
  const seed = objectId.length + day.getDate()
  const slots: TimeSlot[] = []
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  for (let m = 6 * 60, i = 0; m < 22 * 60; m += 30, i++) {
    if (isToday && m <= now.getHours() * 60 + now.getMinutes()) continue
    slots.push({ start: fmt(m), end: fmt(m + 30), available: (i * 7 + seed) % 5 !== 0 })
  }
  return slots
}

export async function fetchSlots(objectId: string, day: Date): Promise<TimeSlot[]> {
  return buildSlots(objectId, day)
}

/** Загрузка дня: сколько слотов свободно из всех */
export function dayAvailability(objectId: string, day: Date) {
  const slots = buildSlots(objectId, day)
  return { free: slots.filter((s) => s.available).length, total: slots.length }
}
