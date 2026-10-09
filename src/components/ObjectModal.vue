<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  ApartmentOutlined,
  CloseOutlined,
  DownloadOutlined,
  DownOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  PictureOutlined,
  RightOutlined,
  UpOutlined,
} from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { buildSlots, dayAvailability, fetchSlots, type BookingObject, type TimeSlot } from '@/api/objects'
import ObjectContacts from '@/components/ObjectContacts.vue'
import ObjectTag from '@/components/ObjectTag.vue'

const props = defineProps<{ item: BookingObject | null }>()
const open = defineModel<boolean>('open', { default: false })

/** info — ознакомление, form — заполнение заявки */
const step = ref<'info' | 'form'>('info')

const date = ref<Dayjs>(dayjs())
/** Выбранные подряд слоты: индексы первого и последнего в slots */
const selection = ref<[number, number]>()
const service = ref<string>()
const purpose = ref('')
const slots = ref<TimeSlot[]>([])
const readDocs = ref<Set<string>>(new Set())
const photoIndex = ref(0)
const thumbsEl = ref<HTMLElement>()
const canUp = ref(false)
const canDown = ref(false)

const weekEl = ref<HTMLElement>()
const weekLeft = ref(false)
const weekRight = ref(false)
const updateWeekArrows = () => {
  const el = weekEl.value
  if (!el) return
  weekLeft.value = el.scrollLeft > 4
  weekRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}
const setWeek = (el: unknown) => {
  weekEl.value = (el as HTMLElement) ?? undefined
  if (el) nextTick(updateWeekArrows)
}
const scrollWeek = (dir: 1 | -1) => {
  const el = weekEl.value
  if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
}

/* Слайдер фото: лента со scroll-snap. Жесты листают сами, кнопки и миниатюры
   плавно прокручивают ленту, а текущий индекс считается по положению прокрутки. */
const trackEl = ref<HTMLElement>()
const setTrack = (el: unknown) => {
  trackEl.value = (el as HTMLElement) ?? undefined
}
const slideIndex = () => {
  const el = trackEl.value
  return el && el.clientWidth ? Math.round(el.scrollLeft / el.clientWidth) : 0
}
const goToPhoto = (i: number) => {
  const el = trackEl.value
  if (!el) return
  el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
}
const onTrackScroll = () => {
  const i = slideIndex()
  if (i !== photoIndex.value) photoIndex.value = i
}
const stepPhoto = (dir: 1 | -1) => {
  const next = photoIndex.value + dir
  if (next >= 0 && next < images.value.length) goToPhoto(next)
}
// выбор миниатюры (десктоп) прокручивает ленту к нужному слайду
watch(photoIndex, (i) => {
  if (slideIndex() !== i) goToPhoto(i)
})

const setThumbs =(el: unknown) => {
  thumbsEl.value = (el as HTMLElement) ?? undefined
  if (el) nextTick(updateArrows)
}
const updateArrows = () => {
  const el = thumbsEl.value
  if (!el) return
  canUp.value = el.scrollTop > 1
  canDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1
}
const scrollThumbs = (dir: 1 | -1) => {
  thumbsEl.value?.scrollBy({ top: dir * 62, behavior: 'smooth' })
}
// активная миниатюра всегда в зоне видимости; стрелки обновляются после отрисовки
watch([photoIndex, () => open.value, () => props.item?.id, step], async () => {
  await nextTick()
  thumbsEl.value?.querySelector('.thumb.active')?.scrollIntoView({ block: 'nearest' })
  updateArrows()
})

const hasServices = computed(() => !!props.item?.services.length)
const images = computed(() => props.item?.images ?? [])
const missingDocs = computed(
  () => props.item?.documents.filter((d) => d.required && !readDocs.value.has(d.id)) ?? [],
)
const docsOk = computed(() => !missingDocs.value.length)

/* ---------- доступность по дням ---------- */

const freeOn = (d: Dayjs) => (props.item ? dayAvailability(props.item.id, d.toDate()).free : 0)

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

/** Ближайшие ~2 месяца: полоска листается влево-вправо */
const week = computed(() => {
  if (!props.item) return []
  return Array.from({ length: 60 }, (_, n) => {
    const d = dayjs().add(n, 'day')
    const { free, total } = dayAvailability(props.item!.id, d.toDate())
    const ratio = total ? free / total : 0
    return {
      d,
      free,
      total,
      percent: Math.round(ratio * 100),
      // шкала из 10 сегментов; если слоты есть, горит минимум один
      segments: free ? Math.max(1, Math.round(ratio * 10)) : 0,
      level: !free ? 'none' : ratio > 0.5 ? 'high' : ratio > 0.2 ? 'mid' : 'low',
      label: n === 0 ? 'Сегодня' : n === 1 ? 'Завтра' : d.format('dd'),
      month: MONTHS[d.month()],
    }
  })
})

/* Телефон: вместо поповера по наведению день открывает нижнюю шторку с теми же слотами */
const isMobile = ref(false)
let mql: MediaQueryList | undefined
const onMql = (e: MediaQueryListEvent) => {
  isMobile.value = e.matches
}
onMounted(() => {
  mql = window.matchMedia('(max-width: 760px)')
  isMobile.value = mql.matches
  mql.addEventListener('change', onMql)
})
onBeforeUnmount(() => mql?.removeEventListener('change', onMql))

const sheetOpen = ref(false)
const sheetDay = ref<Dayjs>(dayjs())
const openSheet = (d: Dayjs) => {
  if (!isMobile.value) return
  sheetDay.value = d
  sheetOpen.value = true
}
watch(open, (v) => {
  if (!v) sheetOpen.value = false
})
// свайп вниз по ручке/заголовку закрывает шторку
let sheetY = 0
const onSheetTouchStart = (e: TouchEvent) => {
  sheetY = e.touches[0].clientY
}
const onSheetTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches[0].clientY - sheetY > 40) sheetOpen.value = false
}

const daySlots = (d: Dayjs) => (props.item ? buildSlots(props.item.id, d.toDate()) : [])

/** Ближайший свободный слот в ближайшие две недели */
const nearest = computed(() => {
  if (!props.item) return null
  for (let n = 0; n < 14; n++) {
    const d = dayjs().add(n, 'day')
    const s = buildSlots(props.item.id, d.toDate()).find((x) => x.available)
    if (s) {
      const when = n === 0 ? 'сегодня' : n === 1 ? 'завтра' : d.format('D MMMM')
      return { when, time: `${s.start}–${s.end}`, day: d }
    }
  }
  return null
})

/* ---------- слоты ---------- */

const timeOf = (t: string, day: Dayjs) => {
  const [h, m] = t.split(':').map(Number)
  return day.hour(h).minute(m).second(0)
}

const range = computed<[Dayjs, Dayjs] | undefined>(() => {
  const sel = selection.value
  if (!sel) return undefined
  return [timeOf(slots.value[sel[0]].start, date.value), timeOf(slots.value[sel[1]].end, date.value)]
})
const isSelected = (i: number) => !!selection.value && i >= selection.value[0] && i <= selection.value[1]
const selectedLabel = computed(() => {
  const sel = selection.value
  if (!sel) return ''
  const minutes = (sel[1] - sel[0] + 1) * 30
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const dur = [h ? `${h} ч` : '', m ? `${m} мин` : ''].filter(Boolean).join(' ')
  return `${slots.value[sel[0]].start}–${slots.value[sel[1]].end} · ${dur}`
})

const canSubmit = computed(
  () => !!range.value && (!hasServices.value || !!service.value) && !!purpose.value.trim() && docsOk.value,
)

const disabledDate = (d: Dayjs) => d.isBefore(dayjs().startOf('day')) || freeOn(d) === 0
const shiftDay = (n: number) => {
  // перескакиваем дни без свободных слотов
  let d = date.value.add(n, 'day')
  for (let i = 0; i < 60 && !d.isBefore(dayjs().startOf('day')) && freeOn(d) === 0; i++) d = d.add(n, 'day')
  if (!d.isBefore(dayjs().startOf('day'))) date.value = d
}
const hasPrev = computed(() => {
  for (let i = 1; i <= 60; i++) {
    const d = date.value.subtract(i, 'day')
    if (d.isBefore(dayjs().startOf('day'))) return false
    if (freeOn(d) > 0) return true
  }
  return false
})

watch(
  () => [open.value, props.item?.id] as const,
  ([isOpen]) => {
    if (!isOpen) return
    step.value = 'info'
    date.value = nearest.value?.day ?? dayjs()
    selection.value = undefined
    photoIndex.value = 0
    service.value = undefined
    purpose.value = ''
    readDocs.value = new Set()
  },
)

watch(
  () => [open.value, props.item?.id, date.value.format('YYYY-MM-DD')] as const,
  async ([isOpen, id]) => {
    if (!isOpen || !id) return
    slots.value = await fetchSlots(id, date.value.toDate())
    selection.value = undefined
  },
  { immediate: true },
)

// слоты соседние, если нет разрыва по времени
const adjacent = (i: number, j: number) => {
  const [a, b] = i < j ? [i, j] : [j, i]
  return slots.value[a].end === slots.value[b].start
}

/** Клик по слоту: выбор, расширение соседним слотом или сужение с края диапазона */
const pickSlot = (i: number) => {
  const sel = selection.value
  if (!sel) {
    selection.value = [i, i]
    return
  }
  const [from, to] = sel
  if (i === from && i === to) selection.value = undefined
  else if (i === from) selection.value = [from + 1, to]
  else if (i === to) selection.value = [from, to - 1]
  else if (i === from - 1 && adjacent(i, from)) selection.value = [i, to]
  else if (i === to + 1 && adjacent(to, i)) selection.value = [from, i]
  else selection.value = [i, i]
}

// Слоты сгруппированы по времени суток — так проще найти нужное время
const slotGroups = computed(() => {
  const groups = [
    { label: 'Утро', items: [] as { s: TimeSlot; i: number }[] },
    { label: 'День', items: [] as { s: TimeSlot; i: number }[] },
    { label: 'Вечер', items: [] as { s: TimeSlot; i: number }[] },
  ]
  slots.value.forEach((s, i) => {
    const h = Number(s.start.slice(0, 2))
    groups[h < 12 ? 0 : h < 17 ? 1 : 2].items.push({ s, i })
  })
  return groups.filter((g) => g.items.length)
})

/* ---------- действия ---------- */

/** Документ, открытый в боковой панели */
const docOpen = ref(false)
const docIndex = ref(0)
const currentDoc = computed(() => props.item?.documents[docIndex.value])

const openDoc = (id: string) => {
  const i = props.item?.documents.findIndex((d) => d.id === id) ?? -1
  if (i < 0) return
  docIndex.value = i
  docOpen.value = true
}

const stepDoc = (dir: 1 | -1) => {
  const n = props.item?.documents.length ?? 0
  if (n) docIndex.value = (docIndex.value + dir + n) % n
}

const confirmDoc = () => {
  const d = currentDoc.value
  if (!d) return
  readDocs.value = new Set(readDocs.value).add(d.id)
  docOpen.value = false
}

const goForm = (day?: Dayjs) => {
  if (day) date.value = day
  step.value = 'form'
}

const submit = () => {
  message.success('Заявка отправлена')
  open.value = false
}

/** Почему отправка недоступна — подсказка при наведении на выключенную кнопку */
const formBlockReason = computed(() => (canSubmit.value ? '' : `Осталось: ${missing.value.join(', ')}`))

/** Что ещё нужно сделать до отправки заявки */
const missing = computed(() => [
  ...(range.value ? [] : ['выбрать время']),
  ...(hasServices.value && !service.value ? ['выбрать услугу'] : []),
  ...(purpose.value.trim() ? [] : ['описать цель работы']),
  ...missingDocs.value.map((d) => `изучить «${d.title}»`),
])
</script>

<template>
  <a-modal
    v-model:open="open"
    :width="960"
    centered
    destroy-on-close
    wrap-class-name="object-modal"
  >
    <!-- h2 — название объекта; разделы справа — h3 меньшего размера -->
    <template #title>
      <h2 class="modal-title">{{ item?.title }}</h2>
    </template>

    <!-- условия допуска: отдельный блок под названием, над основным контентом -->
    <div v-if="item?.tags.length" class="tags-row">
      <ObjectTag v-for="t in item.tags" :key="t" :kind="t" />
    </div>

    <div v-if="item" class="layout" :class="`step-${step}`">
      <!-- Слева — сведения об объекте -->
      <aside class="info">
        <template v-if="step === 'info'">
          <div class="gallery">
            <div v-if="images.length > 1" class="thumbs" role="group" aria-label="Фотографии объекта">
              <button
                type="button"
                class="thumbs-arrow"
                aria-label="Прокрутить фото вверх"
                :class="{ hidden: !canUp }"
                :tabindex="canUp ? 0 : -1"
                :aria-hidden="!canUp"
                @click="scrollThumbs(-1)"
              >
                <UpOutlined />
              </button>
              <div
                :ref="setThumbs"
                class="thumbs-scroll"
                :class="{ 'fade-top': canUp, 'fade-bottom': canDown }"
                @scroll="updateArrows"
              >
                <button
                  v-for="(src, i) in images"
                  :key="src + i"
                  type="button"
                  class="thumb"
                  :class="{ active: i === photoIndex }"
                  :aria-label="`Фото ${i + 1} из ${images.length}`"
                  :aria-current="i === photoIndex"
                  @click="photoIndex = i"
                >
                  <img :src="src" alt="" loading="lazy" />
                </button>
              </div>
              <button
                type="button"
                class="thumbs-arrow"
                aria-label="Прокрутить фото вниз"
                :class="{ hidden: !canDown }"
                :tabindex="canDown ? 0 : -1"
                :aria-hidden="!canDown"
                @click="scrollThumbs(1)"
              >
                <DownOutlined />
              </button>
            </div>
            <div class="photo">
              <!-- лента слайдов: плавное листание жестом (scroll-snap) и кнопками -->
              <div v-if="images.length" :ref="setTrack" class="track" @scroll="onTrackScroll">
                <img
                  v-for="(src, i) in images"
                  :key="src + i"
                  :src="src"
                  :alt="i === photoIndex ? item.title : ''"
                  :loading="i === 0 ? 'eager' : 'lazy'"
                  draggable="false"
                />
              </div>
              <PictureOutlined v-else class="placeholder" />
              <!-- стрелки листания: только на телефоне, на крайних фото скрыты -->
              <button
                v-if="images.length > 1"
                type="button"
                class="photo-arrow prev"
                :class="{ hidden: photoIndex === 0 }"
                :tabindex="photoIndex === 0 ? -1 : 0"
                :aria-hidden="photoIndex === 0"
                aria-label="Предыдущее фото"
                @click="stepPhoto(-1)"
              >
                <LeftOutlined />
              </button>
              <button
                v-if="images.length > 1"
                type="button"
                class="photo-arrow next"
                :class="{ hidden: photoIndex === images.length - 1 }"
                :tabindex="photoIndex === images.length - 1 ? -1 : 0"
                :aria-hidden="photoIndex === images.length - 1"
                aria-label="Следующее фото"
                @click="stepPhoto(1)"
              >
                <RightOutlined />
              </button>
              <span v-if="images.length > 1" class="counter">{{ photoIndex + 1 }} / {{ images.length }}</span>
            </div>
          </div>
        </template>

        <!-- в форме фото уменьшается до компактной плашки -->
        <div v-else class="mini">
          <div class="mini-main">
            <div class="mini-photo">
              <img v-if="images.length" :src="images[0]" :alt="item.title" />
              <PictureOutlined v-else class="placeholder" />
            </div>
            <div class="mini-text">
              <strong>{{ item.title }}</strong>
              <span>{{ item.building }}, {{ item.room }}</span>
            </div>
          </div>
          <!-- в форме контакты — внутри карточки объекта -->
          <ObjectContacts :contact="item.contact" />
        </div>

        <!-- в форме факты не нужны: расположение и контакты уже в мини-карточке (и пустой блок не даёт лишний отступ) -->
        <dl v-if="step === 'info'" class="facts">
          <div v-if="step === 'info'" class="fact">
            <EnvironmentOutlined class="fact-icon" />
            <dt>Местоположение</dt>
            <dd>{{ item.room }}</dd>
          </div>
          <div v-if="step === 'info'" class="fact">
            <ApartmentOutlined class="fact-icon" />
            <dt>Подразделение</dt>
            <dd>{{ item.department }}</dd>
          </div>
        </dl>
        <!-- на шаге ознакомления контакты идут отдельным пунктом под фактами, текст в одну колонку с ними -->
        <ObjectContacts v-if="step === 'info'" class="info-contacts" :contact="item.contact" />
      </aside>

      <!-- Состояние 1: ознакомление -->
      <div v-if="step === 'info'" class="flow">
        <section class="block block-about">
          <h3>Об объекте</h3>
          <p class="description">{{ item.description }}</p>
        </section>

        <section class="block block-time">
          <h3>Свободное время</h3>
          <p v-if="nearest" class="nearest">
            Ближайший слот: {{ nearest.when }}, {{ nearest.time }}
          </p>
          <p v-else class="nearest">Свободных слотов в ближайшие две недели нет</p>

          <div class="week-wrap">
            <button
              type="button"
              class="week-arrow left"
              :class="{ hidden: !weekLeft }"
              :tabindex="weekLeft ? 0 : -1"
              :aria-hidden="!weekLeft"
              aria-label="Прокрутить даты влево"
              @click="scrollWeek(-1)"
            >
              <LeftOutlined />
            </button>
            <button
              type="button"
              class="week-arrow right"
              :class="{ hidden: !weekRight }"
              :tabindex="weekRight ? 0 : -1"
              :aria-hidden="!weekRight"
              aria-label="Прокрутить даты вправо"
              @click="scrollWeek(1)"
            >
              <RightOutlined />
            </button>
          <div
            :ref="setWeek"
            class="week"
            :class="{ 'fade-left': weekLeft, 'fade-right': weekRight }"
            role="group"
            aria-label="Загрузка по дням, листается вбок"
            @scroll="updateWeekArrows"
          >
            <a-popover
              v-for="w in week"
              :key="w.d.format('YYYY-MM-DD')"
              placement="top"
              :mouse-enter-delay="0.15"
              overlay-class-name="day-popover"
              v-bind="isMobile ? { open: false } : {}"
            >
              <template #title>
                {{ w.d.format('dddd, D MMMM') }}
              </template>
              <template #content>
                <div class="pop-slots">
                  <span
                    v-for="s in daySlots(w.d)"
                    :key="s.start"
                    class="pop-slot"
                    :class="{ busy: !s.available }"
                  >{{ s.start }}</span>
                </div>
                <p class="pop-legend"><i class="free" /> свободно <i class="busy" /> занято · слоты по 30 минут</p>
              </template>
              <span class="day-wrap">
                <!-- не кликабельно: только наведение с поповером слотов -->
                <div
                  class="day"
                  :class="w.level"
                  role="group"
                  @click="openSheet(w.d)"
                  :aria-label="`${w.d.format('D MMMM')}: ${w.free ? `свободно слотов ${w.free}` : 'нет свободных слотов'}`"
                >
                  <span class="day-label">{{ w.label }}</span>
                  <span class="day-num">{{ w.d.format('D') }}<small>{{ w.month }}</small></span>
                  <span
                    class="day-bar"
                    :class="{ empty: !w.total }"
                    role="img"
                    :aria-label="`Свободно ${w.percent}%, занято ${100 - w.percent}%`"
                  ><i v-for="n in 10" :key="n" :class="{ on: n <= w.segments }" /></span>
                </div>
              </span>
            </a-popover>
          </div>
          </div>
        </section>

        <section class="block block-docs">
          <h3>Документы</h3>
          <ul class="docs">
            <li v-for="d in item.documents" :key="d.id">
              <div class="doc">
                <span class="doc-title">
                  <a-button type="link" class="doc-link" @click="openDoc(d.id)">{{ d.title }}</a-button>
                </span>
                <a-tag v-if="readDocs.has(d.id)" color="success">Изучено</a-tag>
                <a-tag v-else-if="d.required" color="warning">Необходимо изучить</a-tag>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <!-- Состояние 2: форма бронирования -->
      <div v-else class="flow">
        <section class="block">
          <header class="block-head">
            <h3>Дата и время</h3>
            <span v-if="selectedLabel" class="block-value">{{ selectedLabel }}</span>
          </header>

          <div class="date-row">
            <a-date-picker
              v-model:value="date"
              format="DD.MM.YYYY"
              :allow-clear="false"
              :disabled-date="disabledDate"
            />
            <a-button aria-label="Предыдущий день со слотами" :disabled="!hasPrev" @click="shiftDay(-1)">
              <template #icon><LeftOutlined /></template>
            </a-button>
            <a-button aria-label="Следующий день со слотами" @click="shiftDay(1)">
              <template #icon><RightOutlined /></template>
            </a-button>
          </div>

          <div v-for="g in slotGroups" :key="g.label" class="slot-group">
            <span class="slot-group-label">{{ g.label }}</span>
            <div class="slots" role="group" :aria-label="`Слоты: ${g.label.toLowerCase()}`">
              <a-button
                v-for="{ s, i } in g.items"
                :key="s.start"
                :aria-pressed="isSelected(i)"
                :type="isSelected(i) ? 'primary' : 'default'"
                :disabled="!s.available"
                @click="pickSlot(i)"
              >
                {{ s.start }}-{{ s.end }}
              </a-button>
            </div>
          </div>
          <p v-if="!slots.length" class="empty">На выбранный день слотов нет — попробуйте другой</p>
        </section>

        <section v-if="hasServices" class="block">
          <h3>Услуга <span class="req" aria-hidden="true">*</span><span class="sr-only">(обязательно)</span></h3>
          <a-select
            v-model:value="service"
            aria-required="true"
            placeholder="Выберите услугу"
            :options="item.services.map((s) => ({ value: s, label: s }))"
          />
        </section>

        <section class="block">
          <h3>Цель работы <span class="req" aria-hidden="true">*</span><span class="sr-only">(обязательно)</span></h3>
          <a-textarea
            v-model:value="purpose"
            aria-required="true"
            placeholder="Опишите цель работы"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            :maxlength="500"
            show-count
          />
        </section>

        <!-- документы тоже в форме: обязательные нужно изучить перед отправкой -->
        <section class="block">
          <h3>Документы</h3>
          <ul class="docs">
            <li v-for="d in item.documents" :key="d.id">
              <div class="doc">
                <span class="doc-title">
                  <a-button type="link" class="doc-link" @click="openDoc(d.id)">{{ d.title }}</a-button>
                </span>
                <a-tag v-if="readDocs.has(d.id)" color="success">Изучено</a-tag>
                <a-tag v-else-if="d.required" color="warning">Необходимо изучить</a-tag>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <!-- нижняя шторка со слотами дня (телефон) -->
    <a-drawer
      v-model:open="sheetOpen"
      placement="bottom"
      height="auto"
      :z-index="1100"
      root-class-name="day-sheet"
      :closable="false"
    >
      <!-- ручка и заголовок: свайп вниз по этой зоне закрывает шторку -->
      <template #title>
        <div class="sheet-head" @touchstart.passive="onSheetTouchStart" @touchend.passive="onSheetTouchEnd">
          <span class="sheet-handle" aria-hidden="true" />
          <span>{{ sheetDay.format('dddd, D MMMM') }}</span>
        </div>
      </template>
      <div class="sheet-slots">
        <span
          v-for="s in daySlots(sheetDay)"
          :key="s.start"
          class="pop-slot"
          :class="{ busy: !s.available }"
        >{{ s.start }}</span>
      </div>
      <!-- легенда внизу шторки -->
      <ul class="sheet-legend" aria-label="Обозначения">
        <li><i class="free" /> Свободно</li>
        <li><i class="busy" /> Занято</li>
        <li class="muted">Слоты по 30 минут</li>
      </ul>
    </a-drawer>

    <!-- боковая панель с документом -->
    <a-drawer
      v-model:open="docOpen"
      placement="right"
      width="min(560px, 100vw)"
      :z-index="1100"
      root-class-name="doc-drawer"
      :closable="false"
    >
      <template #title>
        <div v-if="currentDoc" class="doc-head">
          <a-button type="text" aria-label="Закрыть" @click="docOpen = false">
            <template #icon><CloseOutlined /></template>
          </a-button>
          <span class="doc-head-title">{{ currentDoc.title }}</span>
          <a-tag v-if="readDocs.has(currentDoc.id)" color="success">Изучено</a-tag>
          <a-tag v-else-if="currentDoc.required" color="warning">Необходимо изучить</a-tag>
        </div>
      </template>

      <div class="doc-viewer">
        <div class="doc-page">
          <h4>Сценарий бронирования объекта</h4>
          <span class="doc-page-line" />
          <p>Предпросмотр документа «{{ currentDoc?.title }}».</p>
        </div>
      </div>

      <template #footer>
        <div class="doc-foot">
          <a-button aria-label="Предыдущий документ" @click="stepDoc(-1)">
            <template #icon><LeftOutlined /></template>
          </a-button>
          <a-button aria-label="Следующий документ" @click="stepDoc(1)">
            <template #icon><RightOutlined /></template>
          </a-button>
          <span class="spacer" />
          <a-button aria-label="Скачать">
            <template #icon><DownloadOutlined /></template>
          </a-button>
          <a-button
            v-if="currentDoc?.required && !readDocs.has(currentDoc.id)"
            type="primary"
            @click="confirmDoc"
          >Подтвердить ознакомление</a-button>
          <a-button v-else @click="docOpen = false">Закрыть</a-button>
        </div>
      </template>
    </a-drawer>

    <template #footer>
      <div class="footer">
        <template v-if="step === 'info'">
          <span class="spacer" />
          <a-button class="cancel-btn" @click="open = false">Отменить</a-button>
          <a-button type="primary" @click="goForm()">Перейти к бронированию</a-button>
        </template>

        <template v-else>
          <a-button class="back-btn" @click="step = 'info'">Назад</a-button>
          <span class="spacer" />
          <a-tooltip :title="formBlockReason" placement="topRight">
            <span class="btn-wrap">
              <a-button type="primary" :disabled="!canSubmit" @click="submit">Отправить заявку</a-button>
            </span>
          </a-tooltip>
        </template>
      </div>
    </template>
  </a-modal>
</template>

<style>
.object-modal .ant-modal-body {
  max-height: calc(100vh - 220px);
  overflow-x: hidden;
  overflow-y: auto;
}
.object-modal .ant-modal-header {
  margin-bottom: 16px;
}
/* крестик по центру первой строки заголовка: (28px строка − 22px иконка) / 2 = 3px от верха контента */
.object-modal .ant-modal-close {
  top: 23px;
  inset-inline-end: 24px;
}
/* пока экран уже, чем нужно окну (960px + поля по 32px), модал открывается на весь экран:
   телефон и планшет. Шапка и подвал на месте, скроллится только тело */
@media (max-width: 1024px) {
  .object-modal .ant-modal {
    position: fixed;
    inset: 0;
    top: 0;
    vertical-align: top;
    width: 100vw !important;
    max-width: 100vw;
    padding: 0;
    margin: 0;
  }
  .object-modal .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    padding: 16px;
    border-radius: 0;
  }
  .object-modal .ant-modal-body {
    flex: 1;
    min-height: 0;
    max-height: none;
  }
  .object-modal .ant-modal-close {
    top: 19px; /* 16px отступ + 3px до центра первой строки */
    inset-inline-end: 16px;
  }
  /* футер поверх контента: на всю ширину, с разделителем и тенью вверх */
  .object-modal .ant-modal-footer {
    position: relative;
    z-index: 1;
    padding: 12px 16px 16px;
    margin: 0 -16px -16px;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.08);
  }
}
.pop-slots {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  width: 268px;
}
.pop-slot {
  padding: 0 2px;
  font-size: 12px;
  line-height: 20px;
  color: #237804;
  text-align: center;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
}
.pop-slot.busy {
  color: rgba(0, 0, 0, 0.25);
  background: none;
  border: 1px dashed #d9d9d9;
}
.pop-legend {
  margin: 8px 0 0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
.pop-legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 2px 0 6px;
  border-radius: 2px;
}
.pop-legend i:first-child {
  margin-left: 0;
}
.pop-legend .free {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}
.pop-legend .busy {
  background: none;
  border: 1px dashed #d9d9d9;
}
/* нижняя шторка со слотами дня */
.day-sheet .ant-drawer-content-wrapper {
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}
/* без линии под шапкой; вместо крестика — ручка */
.day-sheet .ant-drawer-header {
  padding: 8px 24px 0;
  border-bottom: 0;
}
.day-sheet .ant-drawer-header-title {
  display: block;
}
.doc-drawer .ant-drawer-header-title { min-width: 0; }
.doc-drawer .doc-head { display: flex; align-items: center; gap: 8px; width: 100%; }
.doc-drawer .doc-head-title { flex: 1; min-width: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-drawer .doc-head .ant-tag { margin: 0; }
.doc-drawer .doc-viewer { background: #eee; border-radius: 12px; padding: 20px; min-height: 100%; }
.doc-drawer .doc-page { background: #fff; box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15); aspect-ratio: 1 / 1.414; padding: 12% 8%; }
.doc-drawer .doc-page h4 { font-size: 20px; margin: 0 0 12px; }
.doc-drawer .doc-page-line { display: block; width: 80px; height: 3px; background: #1677ff; margin-bottom: 16px; }
.doc-drawer .doc-foot { display: flex; align-items: center; gap: 8px; }
.doc-drawer .doc-foot .spacer { flex: 1; }
.day-sheet .sheet-head {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  padding-bottom: 4px;
  touch-action: none;
}
.day-sheet .sheet-handle {
  align-self: center;
  width: 40px;
  height: 4px;
  background: #d9d9d9;
  border-radius: 2px;
}
/* легенда внизу шторки: крупные образцы и тёмный текст */
.day-sheet .sheet-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  padding: 0;
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.88);
  list-style: none;
}
.day-sheet .sheet-legend li {
  display: flex;
  gap: 8px;
  align-items: center;
}
.day-sheet .sheet-legend .muted {
  color: rgba(0, 0, 0, 0.45);
}
.day-sheet .sheet-legend i {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
.day-sheet .sheet-legend .free {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}
.day-sheet .sheet-legend .busy {
  background: none;
  border: 1px dashed #bfbfbf;
}
.day-sheet .sheet-slots {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}
.day-sheet .pop-slot {
  padding: 6px 0;
  font-size: 14px;
  line-height: 22px;
}
.day-popover .ant-popover-inner {
  max-width: 300px;
}
.object-modal .modal-title {
  display: -webkit-box;
  margin: 0;
  padding-right: 32px; /* место под крестик */
  overflow: hidden;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: rgba(0, 0, 0, 0.88);
  overflow-wrap: anywhere;
  -webkit-line-clamp: 2; /* максимум две строки, дальше «…» */
  -webkit-box-orient: vertical;
}
</style>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 304px minmax(0, 1fr);
  align-items: stretch;
}

/* --- сведения об объекте --- */
.info {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: start;
  padding-right: 24px;
}
.gallery {
  display: flex;
  gap: 8px;
}
.thumbs {
  position: relative;
  flex: none;
  width: 56px;
}
/* лента миниатюр по высоте главного фото: стрелки сверху и снизу, лишнее листается */
.thumbs > * {
  position: relative;
}
.thumbs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}
.thumbs-arrow {
  position: absolute;
  left: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  background: #fff;
  border: 0;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  transform: translateX(-50%);
  transition: color 0.2s, box-shadow 0.2s;
}
.thumbs-arrow:first-child {
  top: 4px;
}
.thumbs-arrow:last-child {
  bottom: 4px;
}
.thumbs-arrow:hover {
  color: #1677ff;
  box-shadow: 0 2px 10px rgba(22, 119, 255, 0.35);
}
.thumbs-arrow:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
/* нет фото в этом направлении — стрелки не видно */
.thumbs-arrow.hidden {
  visibility: hidden;
}
.thumbs-scroll {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 6px;
  height: 0;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}
/* градиент у края, за которым есть ещё фото */
.thumbs-scroll.fade-top {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 40px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 40px);
}
.thumbs-scroll.fade-bottom {
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 40px), transparent 100%);
  mask-image: linear-gradient(to bottom, #000 calc(100% - 40px), transparent 100%);
}
.thumbs-scroll.fade-top.fade-bottom {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%);
}
.thumbs-scroll::-webkit-scrollbar {
  display: none;
}
.thumb {
  flex: none;
  width: 56px;
  height: 56px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 6px;
  opacity: 0.7;
  transition: opacity 0.2s, border-color 0.2s;
}
.thumb:hover,
.thumb.active {
  opacity: 1;
}
.thumb.active {
  border-color: #1677ff;
}
.thumb:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 1px;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.photo {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 8px;
}
.track {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.track::-webkit-scrollbar {
  display: none;
}
.photo img {
  flex: none;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
.photo-arrow {
  position: absolute;
  top: 50%;
  z-index: 1;
  display: none; /* включается на телефоне */
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  transform: translateY(-50%);
}
.photo-arrow.prev {
  left: 8px;
}
.photo-arrow.next {
  right: 8px;
}
.photo-arrow:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
.photo-arrow.hidden {
  visibility: hidden;
}
.counter {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 0 8px;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 10px;
}
.placeholder {
  font-size: 32px;
  color: rgba(0, 0, 0, 0.25);
}
/* мини-карточка объекта: единый «чип» с фото, названием и расположением */
.mini {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
}
.mini-main {
  display: flex;
  gap: 12px;
  align-items: center;
}
.mini-photo {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  overflow: hidden;
  background: #f0f0f0;
  border-radius: 8px;
}
.mini-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.65);
}
.mini-text strong {
  display: -webkit-box;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.88);
  -webkit-line-clamp: 2; /* длинное название — максимум две строки */
  -webkit-box-orient: vertical;
}
.facts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
}
.fact {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  gap: 0 8px;
}
/* контакты на шаге ознакомления: текст в одну колонку с остальными фактами (16px иконка + 8px зазор) */
.info-contacts {
  padding-left: 24px;
}
.fact-icon {
  grid-row: span 2;
  align-self: start;
  margin-top: 3px;
  color: rgba(0, 0, 0, 0.45);
}
.fact dt {
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.45);
}
.fact dd {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.88);
  overflow-wrap: anywhere;
}

/* --- правая часть --- */
/* вертикальный разделитель между левой и правой частью */
.flow {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  padding-left: 24px;
  border-left: 1px solid #f0f0f0;
}
.block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.block h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}
/* пометка обязательных полей */
.req {
  margin-left: 2px;
  font-weight: 400;
  color: #ff4d4f;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.block-head {
  display: flex;
  gap: 8px;
  align-items: center;
}
.block-value {
  margin-left: auto;
  font-size: 14px;
  font-weight: 600;
  color: #1677ff;
}
.description {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.88);
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.caption {
  margin: 0;
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.45);
}

/* неделя */
.week-wrap {
  position: relative;
}
.week {
  display: flex;
  gap: 6px;
  padding: 2px 0;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}
/* градиент у края, за которым есть ещё дни */
.week.fade-left {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 40px);
  mask-image: linear-gradient(to right, transparent 0, #000 40px);
}
.week.fade-right {
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 40px), transparent 100%);
  mask-image: linear-gradient(to right, #000 calc(100% - 40px), transparent 100%);
}
.week.fade-left.fade-right {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%);
}
.week::-webkit-scrollbar {
  display: none;
}
.day-wrap {
  display: block;
  flex: none;
  width: 84px;
  scroll-snap-align: start;
}
.week-arrow {
  position: absolute;
  top: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  background: #fff;
  border: 0;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  transform: translateY(-50%);
  transition: color 0.2s, box-shadow 0.2s;
}
.week-arrow.left {
  left: 4px;
}
.week-arrow.right {
  right: 4px;
}
.week-arrow:hover {
  color: #1677ff;
  box-shadow: 0 2px 10px rgba(22, 119, 255, 0.35);
}
.week-arrow:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
/* листать некуда — стрелки не видно */
.week-arrow.hidden {
  visibility: hidden;
}
/* текст слева, вертикальная шкала загрузки по правому краю */
.day {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 4px;
  grid-template-rows: auto auto;
  column-gap: 8px;
  align-items: start;
  justify-items: start;
  padding: 8px 8px 8px 10px;
  text-align: left;
  font: inherit;
  cursor: default;
  background: #f5f5f5;
  border: 0;
  border-radius: 8px;
  transition: background-color 0.2s;
}
.day:hover {
  background: #ebebeb;
}
.day.none {
  background: #fafafa;
  opacity: 0.55;
}
.day-label {
  font-size: 12px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.45);
}
.day-num {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.88);
}
.day-num small {
  margin-left: 3px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
}
/* шкала загрузки из 10 скруглённых сегментов, заполняется снизу вверх */
.day-bar {
  display: flex;
  flex-direction: column-reverse;
  grid-column: 2;
  grid-row: 1 / span 2;
  gap: 2px;
  align-self: stretch;
  width: 4px;
}
.day-bar i {
  display: block;
  flex: 1;
  background: #d9d9d9; /* занято */
  border-radius: 2px;
}
.day-bar i.on {
  background: #52c41a; /* свободно */
}
.day-bar.empty i {
  background: #d9d9d9; /* слотов в этот день нет вообще */
}
/* между заголовком раздела и этой строкой — 4px (общий gap блока 8px) */
.nearest {
  margin: -4px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.88);
}

/* форма */
.date-row {
  display: flex;
  gap: 4px;
}
.date-row .ant-picker {
  flex: 1;
  margin-right: 4px;
}
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.inline-link {
  height: auto;
  padding: 0;
}
.empty {
  padding: 16px;
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
  background: #fafafa;
  border-radius: 8px;
}
.slot-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.slot-group-label {
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.65);
}
.slots {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
}
.docs {
  padding: 0;
  margin: 0;
  list-style: none;
}
.docs li + li {
  border-top: 1px solid #f0f0f0;
}
.doc {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 44px;
  padding: 10px 0;
}
.doc-title {
  flex: 1;
  min-width: 0;
}
.doc-link {
  height: auto;
  padding: 0;
  text-align: left;
  white-space: normal;
}

/* --- подвал --- */
.footer {
  display: flex;
  gap: 8px;
  align-items: center;
}
.spacer {
  flex: 1;
}
.btn-wrap {
  display: inline-block;
}

@media (max-width: 760px) {
  /* колонки «растворяются», чтобы блоки можно было переставить: order задаёт порядок на телефоне */
  .layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .info,
  .flow {
    display: contents;
  }
  /* в форме блоки ближе друг к другу */
  .step-form {
    gap: 16px;
  }
  /* шаг «ознакомление»: фото → слоты → место/подразделение/контакты → описание → документы */
  .step-info .gallery {
    order: 1;
  }
  .step-info .block-time {
    order: 2;
  }
  .step-info .facts,
  .step-info .info-contacts {
    order: 3; /* место, подразделение и контакты идут вместе, в порядке разметки */
  }
  .step-info .block-about {
    order: 4;
  }
  .step-info .block-docs {
    order: 5;
  }
  .photo {
    aspect-ratio: 16 / 10;
  }
  /* день на телефоне нажимается: открывает шторку со слотами */
  .day {
    cursor: pointer;
  }
  .day:active {
    background: #e0e0e0;
  }
  /* на телефоне: одно фото, стрелки по бокам и бейдж-счётчик, без ленты миниатюр */
  .thumbs {
    display: none;
  }
  .photo-arrow {
    display: flex;
  }
  .slots {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .thumbs,
  .thumb {
    width: 48px;
  }
  .thumb {
    height: 48px;
  }
  .week {
    gap: 4px;
  }
  /* кнопки друг под другом на всю ширину; главная сверху */
  .footer {
    flex-direction: column;
    align-items: stretch;
  }
  /* главная кнопка сверху, «Назад» под ней */
  .footer .btn-wrap {
    order: 1;
  }
  .footer .back-btn {
    order: 2;
  }
  .footer .spacer {
    display: none;
  }
  /* на телефоне закрыть можно крестиком, отдельная «Отменить» не нужна */
  .footer .cancel-btn {
    display: none;
  }
  .footer .btn-wrap {
    display: block;
  }
  .footer :deep(.ant-btn) {
    width: 100%;
    height: 44px;
    margin: 0 !important; /* Ant добавляет соседней кнопке отступ слева */
  }
}
</style>
