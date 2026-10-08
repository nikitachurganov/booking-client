<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

defineProps<{ contact: { name: string; email: string; phone: string } }>()

/* «почта · телефон» в одну строку; если не помещается — телефон уходит на вторую строку,
   а точка-разделитель скрывается (visibility, чтобы ширина не менялась и не было мерцания) */
const line = ref<HTMLElement>()
const email = ref<HTMLElement>()
const phone = ref<HTMLElement>()
const wrapped = ref(false)

const measure = () => {
  const e = email.value
  const p = phone.value
  if (e && p) wrapped.value = p.offsetTop > e.offsetTop + 2
}

let observer: ResizeObserver | undefined
watch(line, (el) => {
  observer?.disconnect()
  if (!el) return
  observer = new ResizeObserver(measure)
  observer.observe(el)
  nextTick(measure)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <dl class="contacts">
    <dt>Контакты</dt>
    <dd>
      <span class="name">{{ contact.name }}</span>
      <span ref="line" class="line" :class="{ wrapped }">
        <span ref="email" class="nw">{{ contact.email }}</span><span class="sep" aria-hidden="true">&nbsp;·{{ ' ' }}</span><span ref="phone" class="nw">{{ contact.phone }}</span>
      </span>
    </dd>
  </dl>
</template>

<style scoped>
.contacts {
  margin: 0;
}
.contacts dt {
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.45);
}
.contacts dd {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  overflow-wrap: anywhere;
}
.name {
  display: block;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}
.line {
  display: block;
  color: rgba(0, 0, 0, 0.65);
}
.nw {
  white-space: nowrap;
}
.line.wrapped .sep {
  visibility: hidden;
}
</style>
