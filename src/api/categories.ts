export interface Category {
  id: string
  title: string
  count: number
  /** Ближайший свободный слот, null — слотов нет */
  nearestSlot: string | null
}

// Моковые данные до появления бэкенда
const categories: Category[] = [
  { id: 'equipment', title: 'Оборудование', count: 20, nearestSlot: 'сегодня, 12:00 - 13:00' },
  { id: 'services', title: 'Услуги и работы', count: 83, nearestSlot: '23 июля, 19:00 - 22:00' },
  { id: 'workplaces', title: 'Рабочие места', count: 41, nearestSlot: 'сегодня, 10:00 - 12:00' },
  { id: 'meeting-rooms', title: 'Переговорные', count: 120, nearestSlot: 'завтра, 08:30 - 09:00' },
  { id: 'classrooms', title: 'Учебные помещения', count: 15, nearestSlot: 'сегодня, 15:00 - 15:20' },
  { id: 'event-venues', title: 'Событийные площадки', count: 3, nearestSlot: 'послезавтра, 09:00 - 11:00' },
  { id: 'sports', title: 'Спортивные объекты', count: 0, nearestSlot: null },
]

export async function fetchCategories(): Promise<Category[]> {
  return categories
}
