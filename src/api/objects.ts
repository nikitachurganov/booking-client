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
  /** Интервалы дня, в которые админ разрешил бронь (например, до и после обеда); нужны для free */
  workIntervals: TimeRange[]
  available: boolean
  description: string
  department: string
  contact: { name: string; email: string; phone: string }
  /** Услуги объекта; пустой список — выбор услуги не нужен */
  services: string[]
  documents: { id: string; title: string; required: boolean }[]
}

export interface TimeRange {
  /** HH:mm */
  start: string
  end: string
}

export interface TimeSlot extends TimeRange {
  available: boolean
}

/** Отправленная заявка на бронь — то, что показывает окно «Заявка отправлена» */
export interface BookingSummary {
  /** Номер заявки (пока генерируется на клиенте, до появления бэкенда) */
  number: string
  title: string
  /** «Корпус L, L240» */
  place: string
  /** DD.MM.YYYY */
  date: string
  /** HH:mm–HH:mm · 1 ч 30 мин */
  time: string
  service?: string
}

const defaultDescription =
  'Оборудование для проведения исследований и учебных работ. Перед началом работы необходимо пройти инструктаж и ознакомиться с инструкцией по эксплуатации. Доступно в рабочие часы лаборатории, запись по слотам.'

const baseExtra = {
  /** Обед с 12 до 13 — бронь до и после него */
  workIntervals: [
    { start: '08:00', end: '12:00' },
    { start: '13:00', end: '18:00' },
  ],
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

/** HH:mm → минуты от начала суток */
export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Минуты от начала суток → HH:mm */
export const minutesToTime = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

const findObject = (id: string) => objects.find((o) => o.id === id)

/** Слоты по 30 минут с 06:00 до 22:00; для сегодняшнего дня прошедшие не показываются */
export function buildSlots(objectId: string, day: Date, now = new Date()): TimeSlot[] {
  const isToday = day.toDateString() === now.toDateString()
  const seed = objectId.length + day.getDate()
  const slots: TimeSlot[] = []
  for (let m = 6 * 60, i = 0; m < 22 * 60; m += 30, i++) {
    if (isToday && m <= now.getHours() * 60 + now.getMinutes()) continue
    slots.push({ start: minutesToTime(m), end: minutesToTime(m + 30), available: (i * 7 + seed) % 5 !== 0 })
  }
  return slots
}

export async function fetchSlots(objectId: string, day: Date): Promise<TimeSlot[]> {
  return buildSlots(objectId, day)
}

/* ---------- свободная бронь ---------- */

/** Шаг сетки времени при свободной брони, мин */
export const FREE_STEP = 15

/** Минимальная длительность брони, округлённая вверх до шага сетки */
export const freeMinDuration = (obj: Pick<BookingObject, 'minDuration'>) =>
  Math.max(FREE_STEP, Math.ceil(obj.minDuration / FREE_STEP) * FREE_STEP)

/** Брони, оформленные в этой сессии: делят свободные интервалы на части */
const freeBookings = new Map<string, TimeRange[]>()
const bookingsKey = (objectId: string, day: Date) => `${objectId}|${day.toDateString()}`

/** Чужие брони, которые уже есть в системе (имитация: часть дней с «окнами» посреди интервала) */
function seededBusy(objectId: string, day: Date): TimeRange[] {
  const seed = objectId.length + day.getDate()
  const busy: TimeRange[] = []
  if (seed % 4 === 0) busy.push({ start: '09:30', end: '11:00' })
  if (seed % 5 === 1) busy.push({ start: '14:15', end: '16:00' })
  return busy
}

/** Сегодня прошедшее время недоступно: граница — ближайший шаг сетки после текущего момента */
const freeFrom = (day: Date, now: Date) =>
  day.toDateString() === now.toDateString()
    ? Math.ceil((now.getHours() * 60 + now.getMinutes()) / FREE_STEP) * FREE_STEP
    : 0

/**
 * Свободные интервалы дня: рабочие интервалы админа минус брони.
 * Остатки короче минимальной брони пропадают — занять их всё равно нельзя.
 */
export function buildFreeIntervals(obj: BookingObject, day: Date, now = new Date()): TimeRange[] {
  const min = freeMinDuration(obj)
  const from = freeFrom(day, now)
  const busy = [...seededBusy(obj.id, day), ...(freeBookings.get(bookingsKey(obj.id, day)) ?? [])]
    .map((r): [number, number] => [timeToMinutes(r.start), timeToMinutes(r.end)])
    .sort((a, b) => a[0] - b[0])

  const result: TimeRange[] = []
  const push = (s: number, e: number) => {
    if (e - s >= min) result.push({ start: minutesToTime(s), end: minutesToTime(e) })
  }
  for (const w of obj.workIntervals) {
    const end = timeToMinutes(w.end)
    let cursor = Math.max(timeToMinutes(w.start), from)
    for (const [busyStart, busyEnd] of busy) {
      if (busyStart >= end) break
      if (busyEnd <= cursor) continue
      push(cursor, busyStart)
      cursor = busyEnd
    }
    push(cursor, end)
  }
  return result
}

export async function fetchFreeIntervals(objectId: string, day: Date): Promise<TimeRange[]> {
  const obj = findObject(objectId)
  return obj?.bookingType === 'free' ? buildFreeIntervals(obj, day) : []
}

/** Бронь отрезка: свободный интервал, в который он попал, делится на остатки до и после */
export async function bookFree(objectId: string, day: Date, range: TimeRange): Promise<void> {
  const obj = findObject(objectId)
  if (!obj) throw new Error('Объект не найден')
  const start = timeToMinutes(range.start)
  const end = timeToMinutes(range.end)
  if (end - start < freeMinDuration(obj)) throw new Error('Бронь короче минимальной длительности')
  const fits = buildFreeIntervals(obj, day).some(
    (i) => timeToMinutes(i.start) <= start && end <= timeToMinutes(i.end),
  )
  // пока заполняли форму, время мог занять кто-то другой
  if (!fits) throw new Error('Это время уже занято — выберите другое')
  const key = bookingsKey(objectId, day)
  freeBookings.set(key, [...(freeBookings.get(key) ?? []), range])
}

/** Загрузка дня: сколько слотов (для свободной брони — минут) свободно из всех */
export function dayAvailability(objectId: string, day: Date) {
  const obj = findObject(objectId)
  if (obj?.bookingType === 'free') {
    const now = new Date()
    const from = freeFrom(day, now)
    const total = obj.workIntervals.reduce(
      (sum, w) => sum + Math.max(0, timeToMinutes(w.end) - Math.max(timeToMinutes(w.start), from)),
      0,
    )
    const free = buildFreeIntervals(obj, day, now).reduce(
      (sum, i) => sum + timeToMinutes(i.end) - timeToMinutes(i.start),
      0,
    )
    return { free, total }
  }
  const slots = buildSlots(objectId, day)
  return { free: slots.filter((s) => s.available).length, total: slots.length }
}
