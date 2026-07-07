/**
 * UX prototype mock service. It intentionally keeps state in the client so the
 * booking flow can be demonstrated without backend/API integration.
 */

export const bookingShowcaseGroups = [
  {
    value: 'equipment',
    label: 'Оборудование',
    description: 'Приборы, лабораторная техника и рабочие комплекты',
  },
  {
    value: 'services',
    label: 'Услуги и работы',
    description: 'Запись, трансляции, подготовка материалов и сопровождаемые работы',
  },
  {
    value: 'workplaces',
    label: 'Рабочие места',
    description: 'Индивидуальные места для самостоятельной работы и проектных команд',
  },
  {
    value: 'meeting-rooms',
    label: 'Переговорные',
    description: 'Комнаты для встреч, созвонов и командных обсуждений',
  },
  {
    value: 'classrooms',
    label: 'Учебные помещения',
    description: 'Аудитории, компьютерные классы и пространства для занятий',
  },
  {
    value: 'event-spaces',
    label: 'Событийные площадки',
    description: 'Залы и площадки для лекций, презентаций и мероприятий',
  },
  {
    value: 'sports',
    label: 'Спортивные объекты',
    description: 'Залы, площадки и спортивная инфраструктура',
  },
];

/** @type {import('../types/bookingObject').BookingObject[]} */
const bookingObjects = [
  {
    id: 'spectrometer-l500',
    equipmentId: 'SP-L500-001',
    title: 'Спектрометр L500',
    showcaseGroup: 'equipment',
    type: 'Научное оборудование',
    category: 'Исследования и измерения',
    laboratory: 'Лаборатория оптических измерений',
    imageUrl: '/images/spectrometer.png',
    description:
      'Лабораторный спектрометр для спектрального анализа образцов и исследовательских работ. Перед бронированием нужно изучить инструкцию по эксплуатации и подтвердить ознакомление с техникой безопасности.',
    location: 'Корпус L',
    room: 'L500',
    department: 'Инженерная школа',
    services: [
      { id: 'spectral-analysis', title: 'Спектральный анализ', durationHours: 3 },
      { id: 'calibration', title: 'Калибровка образцов', durationHours: 2 },
      { id: 'lab-measurement', title: 'Лабораторные измерения', durationHours: 1 },
    ],
    characteristics: [
      { label: 'Диапазон', value: '190-1100 нм' },
      { label: 'Точность', value: 'до 0,2 нм' },
      { label: 'Лимит сессии', value: '3 часа' },
    ],
    assets: ['Кюветы', 'Калибровочный набор', 'Рабочая станция'],
    documents: [
      {
        id: 'spectrometer-operation',
        title: 'Инструкция по эксплуатации',
        required: true,
        viewed: false,
        content:
          'Перед запуском спектрометра проверьте состояние кювет, чистоту оптического тракта и готовность рабочей станции. Не открывайте защитный кожух при включенном источнике света. После завершения измерений сохраните протокол, очистите рабочее место и выключите оборудование по инструкции. Ответственность за соблюдение регламента несет пользователь, оформивший бронирование.',
      },
      {
        id: 'spectrometer-safety',
        title: 'Техника безопасности',
        required: true,
        viewed: true,
        content:
          'Работа выполняется только в защитных очках и перчатках. Запрещено использовать поврежденные кюветы, оставлять реагенты без маркировки и переносить образцы вне лабораторной зоны. При обнаружении неисправности остановите работу и сообщите ответственному сотруднику лаборатории.',
      },
    ],
    requirements: [
      {
        id: 'general-safety',
        title: 'Общий инструктаж по ТБ',
        description: 'Запись найдена в журнале обучения',
        kind: 'manual',
        complete: true,
      },
      {
        id: 'operation-document',
        title: 'Инструкция по эксплуатации',
        description: 'Нужно изучить документ до конца',
        kind: 'document',
        documentId: 'spectrometer-operation',
      },
    ],
    slots: [
      { id: 'sp-1', date: '2026-07-08', start: '09:00', end: '12:00', available: true },
      { id: 'sp-2', date: '2026-07-08', start: '13:00', end: '16:00', available: false, status: 'booked' },
      { id: 'sp-3', date: '2026-07-09', start: '10:00', end: '13:00', available: true },
      { id: 'sp-4', date: '2026-07-10', start: '14:00', end: '17:00', available: true },
    ],
    moderationRequired: true,
    restrictedAccess: false,
    requiresCheckIn: true,
    requiresCheckOut: true,
    collectiveBooking: false,
    contactPerson: 'Анна Ли',
    moderator: 'Лаборатория оптических измерений',
    subAssetsCount: 3,
  },
  {
    id: 'microscope-m220',
    equipmentId: 'MC-M220-014',
    title: 'Микроскоп M220',
    showcaseGroup: 'equipment',
    type: 'Научное оборудование',
    category: 'Исследования и измерения',
    laboratory: 'Лаборатория биотехнологий',
    imageUrl: '/images/spectrometer.png',
    description:
      'Микроскоп для учебных и исследовательских наблюдений. Доступен после подтверждения правил работы с объективами и журналом образцов.',
    location: 'Корпус C',
    room: 'C212',
    department: 'Школа естественных наук',
    services: [
      { id: 'sample-view', title: 'Наблюдение образцов', durationHours: 2 },
      { id: 'photo-protocol', title: 'Фотофиксация', durationHours: 1 },
    ],
    characteristics: [
      { label: 'Увеличение', value: '40x-1000x' },
      { label: 'Камера', value: '12 Мп' },
      { label: 'Рабочих мест', value: '2' },
    ],
    assets: ['Объективы', 'Предметные стекла', 'Цифровая камера'],
    documents: [
      {
        id: 'microscope-rules',
        title: 'Регламент лаборатории',
        required: true,
        viewed: true,
        content:
          'Перед началом работы проверьте чистоту объективов и состояние предметного столика. После завершения сессии верните объектив на минимальное увеличение, выключите подсветку и отметьте использование расходных материалов в журнале.',
      },
    ],
    requirements: [
      {
        id: 'microscope-rules',
        title: 'Регламент лаборатории',
        description: 'Документ уже изучен',
        kind: 'document',
        documentId: 'microscope-rules',
      },
    ],
    slots: [
      { id: 'mc-1', date: '2026-07-08', start: '11:00', end: '13:00', available: true },
      { id: 'mc-2', date: '2026-07-09', start: '15:00', end: '17:00', available: true },
      { id: 'mc-3', date: '2026-07-10', start: '09:00', end: '11:00', available: false, status: 'requested' },
    ],
    moderationRequired: false,
    restrictedAccess: false,
    requiresCheckIn: true,
    requiresCheckOut: true,
    collectiveBooking: true,
    contactPerson: 'Ольга Ким',
    moderator: 'Кафедра биотехнологий',
    subAssetsCount: 4,
  },
  {
    id: 'conference-a301',
    equipmentId: 'RM-A301-022',
    title: 'Конференц-зал Атриум',
    showcaseGroup: 'event-spaces',
    type: 'Помещение',
    category: 'Встречи и мероприятия',
    laboratory: 'Административный департамент',
    imageUrl: '/images/spectrometer.png',
    description:
      'Зал для встреч, лекций и публичных мероприятий до 80 человек. Бронирование подтверждает ответственный за площадку.',
    location: 'Корпус A',
    room: 'A301',
    department: 'Административный департамент',
    services: [
      { id: 'lecture', title: 'Лекция', durationHours: 2 },
      { id: 'meeting', title: 'Очная встреча', durationHours: 1 },
      { id: 'public-event', title: 'Публичное мероприятие', durationHours: 3 },
    ],
    characteristics: [
      { label: 'Вместимость', value: '80 человек' },
      { label: 'Оборудование', value: 'Проектор, микрофоны' },
      { label: 'Подтверждение', value: 'Требуется' },
    ],
    assets: ['Проектор', 'Микрофоны', 'Система видеосвязи'],
    documents: [],
    requirements: [],
    slots: [
      { id: 'cf-1', date: '2026-07-08', start: '10:00', end: '12:00', available: false, status: 'booked' },
      { id: 'cf-2', date: '2026-07-09', start: '10:00', end: '12:00', available: true },
      { id: 'cf-3', date: '2026-07-09', start: '15:00', end: '18:00', available: true },
    ],
    moderationRequired: true,
    restrictedAccess: false,
    requiresCheckIn: false,
    requiresCheckOut: false,
    collectiveBooking: true,
    contactPerson: 'Ирина Волкова',
    moderator: 'Служба бронирования аудиторий',
    subAssetsCount: 0,
  },
  {
    id: 'media-studio-b120',
    equipmentId: 'ST-B120-003',
    title: 'Медиа-студия B120',
    showcaseGroup: 'services',
    type: 'Студия',
    category: 'Запись и трансляции',
    laboratory: 'Медиацентр',
    imageUrl: '/images/spectrometer.png',
    description:
      'Пространство для записи видео, подкастов и онлайн-трансляций. Перед использованием нужен короткий инструктаж по студийному оборудованию.',
    location: 'Корпус B',
    room: 'B120',
    department: 'Медиацентр',
    services: [
      { id: 'video-record', title: 'Видеозапись', durationHours: 2 },
      { id: 'podcast', title: 'Подкаст', durationHours: 1 },
      { id: 'stream', title: 'Онлайн-трансляция', durationHours: 3 },
    ],
    characteristics: [
      { label: 'Камеры', value: '3' },
      { label: 'Звук', value: 'Петличные микрофоны' },
      { label: 'Свет', value: 'Постоянный LED' },
    ],
    assets: ['Камеры', 'Петличные микрофоны', 'Свет'],
    documents: [
      {
        id: 'studio-equipment',
        title: 'Инструкция по студийному оборудованию',
        required: true,
        viewed: false,
        content:
          'Перед записью проверьте питание камер, уровень заряда микрофонов и настройки света. Запрещено менять кабельную коммутацию без сотрудника медиацентра. После сессии сохраните проект на рабочую станцию и освободите карту памяти.',
      },
    ],
    requirements: [
      {
        id: 'studio-instruction',
        title: 'Инструкция по оборудованию',
        description: 'Нужно изучить перед бронированием',
        kind: 'document',
        documentId: 'studio-equipment',
      },
    ],
    slots: [
      { id: 'ms-1', date: '2026-07-08', start: '16:00', end: '18:00', available: true },
      { id: 'ms-2', date: '2026-07-10', start: '12:00', end: '14:00', available: true },
    ],
    moderationRequired: false,
    restrictedAccess: false,
    requiresCheckIn: true,
    requiresCheckOut: true,
    collectiveBooking: true,
    contactPerson: 'Михаил Сон',
    moderator: 'Медиацентр',
    subAssetsCount: 4,
  },
  {
    id: 'meeting-l308',
    equipmentId: 'RM-L308-009',
    title: 'Переговорная L308',
    showcaseGroup: 'meeting-rooms',
    type: 'Помещение',
    category: 'Встречи и мероприятия',
    laboratory: 'Административный департамент',
    imageUrl: '/images/spectrometer.png',
    description:
      'Небольшая переговорная для рабочих встреч до 10 человек. Временно недоступна из-за обслуживания.',
    location: 'Корпус L',
    room: 'L308',
    department: 'Административный департамент',
    services: [{ id: 'work-meeting', title: 'Рабочая встреча', durationHours: 1 }],
    characteristics: [
      { label: 'Вместимость', value: '10 человек' },
      { label: 'Статус', value: 'Обслуживание' },
      { label: 'Оборудование', value: 'Экран, камера' },
    ],
    assets: ['Экран', 'Камера', 'Маркерная доска'],
    documents: [],
    requirements: [],
    slots: [],
    moderationRequired: false,
    restrictedAccess: false,
    requiresCheckIn: false,
    requiresCheckOut: false,
    collectiveBooking: true,
    contactPerson: 'Служба эксплуатации',
    moderator: 'Служба эксплуатации',
    subAssetsCount: 0,
  },
  {
    id: 'coworking-c405',
    equipmentId: 'WP-C405-018',
    title: 'Рабочее место C405',
    showcaseGroup: 'workplaces',
    type: 'Рабочее место',
    category: 'Индивидуальная работа',
    laboratory: 'Коворкинг кампуса',
    imageUrl: '/images/spectrometer.png',
    description:
      'Индивидуальное место с монитором и розетками для самостоятельной работы, подготовки проектов и онлайн-встреч.',
    location: 'Корпус C',
    room: 'C405',
    department: 'Студенческий офис',
    services: [{ id: 'desk-work', title: 'Работа за столом', durationHours: 2 }],
    characteristics: [
      { label: 'Оснащение', value: 'Монитор, розетки' },
      { label: 'Режим', value: 'Тихая зона' },
      { label: 'Лимит', value: '4 часа' },
    ],
    assets: ['Монитор', 'Кресло', 'Настольная лампа'],
    documents: [],
    requirements: [],
    slots: [
      { id: 'wp-1', date: '2026-07-08', start: '09:00', end: '11:00', available: true },
      { id: 'wp-2', date: '2026-07-08', start: '12:00', end: '14:00', available: true },
      { id: 'wp-3', date: '2026-07-09', start: '15:00', end: '17:00', available: false, status: 'booked' },
    ],
    moderationRequired: false,
    restrictedAccess: false,
    requiresCheckIn: true,
    requiresCheckOut: true,
    collectiveBooking: false,
    contactPerson: 'Студенческий офис',
    moderator: 'Студенческий офис',
    subAssetsCount: 0,
  },
  {
    id: 'classroom-d214',
    equipmentId: 'CL-D214-031',
    title: 'Учебная аудитория D214',
    showcaseGroup: 'classrooms',
    type: 'Учебное помещение',
    category: 'Занятия и семинары',
    laboratory: 'Учебный департамент',
    imageUrl: '/images/spectrometer.png',
    description:
      'Аудитория для семинаров и практических занятий до 32 человек. Доступна для преподавателей и организаторов учебных активностей.',
    location: 'Корпус D',
    room: 'D214',
    department: 'Учебный департамент',
    services: [
      { id: 'seminar', title: 'Семинар', durationHours: 2 },
      { id: 'practice-class', title: 'Практическое занятие', durationHours: 2 },
    ],
    characteristics: [
      { label: 'Вместимость', value: '32 человека' },
      { label: 'Оснащение', value: 'Проектор, доска' },
      { label: 'Подтверждение', value: 'Требуется' },
    ],
    assets: ['Проектор', 'Маркерная доска', 'Компьютер преподавателя'],
    documents: [],
    requirements: [],
    slots: [
      { id: 'cl-1', date: '2026-07-08', start: '08:30', end: '10:00', available: true },
      { id: 'cl-2', date: '2026-07-09', start: '10:15', end: '11:45', available: true },
    ],
    moderationRequired: true,
    restrictedAccess: false,
    requiresCheckIn: false,
    requiresCheckOut: false,
    collectiveBooking: true,
    contactPerson: 'Марина Соколова',
    moderator: 'Учебный департамент',
    subAssetsCount: 0,
  },
  {
    id: 'sport-hall-s1',
    equipmentId: 'SPT-S1-007',
    title: 'Спортивный зал S1',
    showcaseGroup: 'sports',
    type: 'Спортивный объект',
    category: 'Тренировки и секции',
    laboratory: 'Спортивный клуб',
    imageUrl: '/images/spectrometer.png',
    description:
      'Зал для командных тренировок, секций и студенческих спортивных мероприятий. Для бронирования нужен ответственный организатор.',
    location: 'Спорткомплекс',
    room: 'S1',
    department: 'Спортивный клуб',
    services: [
      { id: 'team-training', title: 'Командная тренировка', durationHours: 2 },
      { id: 'sport-event', title: 'Спортивное мероприятие', durationHours: 3 },
    ],
    characteristics: [
      { label: 'Покрытие', value: 'Паркет' },
      { label: 'Инвентарь', value: 'По запросу' },
      { label: 'Доступ', value: 'Через модерацию' },
    ],
    assets: ['Раздевалки', 'Табло', 'Спортивный инвентарь'],
    documents: [
      {
        id: 'sport-safety',
        title: 'Правила использования спортивного зала',
        required: true,
        viewed: false,
        content:
          'Перед занятием проверьте состояние площадки и наличие ответственного организатора. Используйте зал только в спортивной обуви. После тренировки верните инвентарь и освободите помещение вовремя.',
      },
    ],
    requirements: [
      {
        id: 'sport-safety',
        title: 'Правила спортивного объекта',
        description: 'Нужно изучить перед бронированием',
        kind: 'document',
        documentId: 'sport-safety',
      },
    ],
    slots: [
      { id: 'spth-1', date: '2026-07-08', start: '18:00', end: '20:00', available: true },
      { id: 'spth-2', date: '2026-07-10', start: '16:00', end: '18:00', available: true },
    ],
    moderationRequired: true,
    restrictedAccess: false,
    requiresCheckIn: true,
    requiresCheckOut: true,
    collectiveBooking: true,
    contactPerson: 'Спортивный клуб',
    moderator: 'Спортивный клуб',
    subAssetsCount: 0,
  },
];

export async function fetchBookingObjects() {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  return structuredClone(bookingObjects);
}

export function getBookingObjectsFilterOptions(objects) {
  return {
    types: [...new Set(objects.map((object) => object.type))],
    laboratories: [...new Set(objects.map((object) => object.laboratory))],
    services: [...new Set(objects.flatMap((object) => object.services.map((service) => service.title)))],
  };
}

export function getBookingShowcaseGroups() {
  return bookingShowcaseGroups;
}
