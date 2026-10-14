<script setup lang="ts">
// Une carte à jouer par membre du staff.
//
// Elle flotte doucement, s'incline vers la souris, et un reflet holographique
// et un éclat suivent le pointeur. Au doigt, ça marche en glissant dessus.
//
// Pour un visiteur, le staff n'est pas public (voir useRole : voitLeStaff) :
// la carte montre son dos, aux couleurs de la section.
const props = withDefaults(
  defineProps<{
    nom?: string
    prenom?: string
    role?: string
    note?: string | null
    icone: string
    /** Le dos de la carte : pour les visiteurs. */
    dos?: boolean
    inclinaison?: number
  }>(),
  { dos: false, inclinaison: 0 },
)

const carte = ref<HTMLElement | null>(null)
const actif = ref(false)
const calme = ref(false)

const initiales = computed(() => {
  const n = (props.nom ?? '').trim()
  const mots = n.split(/[\s-]+/).filter(Boolean)
  return (mots.length > 1 ? mots[0]![0]! + mots[1]![0]! : n.slice(0, 2)).toUpperCase()
})
const rang = computed(() => (props.nom ?? '?').charAt(0).toUpperCase())

function bouge(e: PointerEvent) {
  const el = carte.value
  if (!el) return
  const b = el.getBoundingClientRect()
  const x = (e.clientX - b.left) / b.width
  const y = (e.clientY - b.top) / b.height
  el.style.setProperty('--mx', `${x * 100}%`)
  el.style.setProperty('--my', `${y * 100}%`)
  if (!calme.value) {
    el.style.setProperty('--ry', `${(x - 0.5) * 22}deg`)
    el.style.setProperty('--rx', `${(0.5 - y) * 22}deg`)
  }
}
function entre(e: PointerEvent) {
  actif.value = true
  bouge(e)
}
function sort() {
  actif.value = false
  carte.value?.style.setProperty('--rx', '0deg')
  carte.value?.style.setProperty('--ry', '0deg')
}

onMounted(() => {
  calme.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>

<template>
  <li class="emplacement" :style="{ '--r': `${inclinaison}deg` }">
    <div
      ref="carte"
      class="jeu"
      :class="{ 'jeu--active': actif, 'jeu--dos': dos }"
      :tabindex="dos ? -1 : 0"
      @pointerenter="entre"
      @pointermove="bouge"
      @pointerleave="sort"
      @focus="actif = true"
      @blur="sort"
    >
      <template v-if="!dos">
        <span class="jeu__filet" aria-hidden="true" />
        <span class="jeu__coin" aria-hidden="true">
          {{ rang }}<UiIcone :nom="icone" :taille="14" />
        </span>
        <span class="jeu__coin jeu__coin--bas" aria-hidden="true">
          {{ rang }}<UiIcone :nom="icone" :taille="14" />
        </span>
        <span class="jeu__portrait" aria-hidden="true">{{ initiales }}</span>
        <span class="jeu__nom">{{ nom }}</span>
        <span class="jeu__role">{{ role }}</span>
        <span class="jeu__trait" aria-hidden="true" />
        <span class="jeu__stats mono">
          <span v-if="prenom && prenom !== nom">{{ prenom }}</span>
          <em v-if="note">{{ note }}</em>
        </span>
      </template>
      <template v-else>
        <span class="jeu__filet" aria-hidden="true" />
        <span class="jeu__motif" aria-hidden="true">
          <UiIcone v-for="i in 12" :key="i" :nom="icone" :taille="22" />
        </span>
        <span class="jeu__blason" aria-hidden="true"><UiIcone nom="lys" :taille="44" /></span>
      </template>
      <span class="jeu__holo" aria-hidden="true" />
      <span class="jeu__eclat" aria-hidden="true" />
    </div>
  </li>
</template>

<style lang="scss" scoped>
.emplacement {
  perspective: 900px;
  animation: flotte 6s ease-in-out infinite;

  &:nth-child(2n) {
    animation-delay: -2s;
  }
  &:nth-child(3n) {
    animation-delay: -4s;
  }
}

@keyframes flotte {
  0%,
  100% {
    transform: translateY(0) rotate(var(--r, 0deg));
  }
  50% {
    transform: translateY(-10px) rotate(var(--r, 0deg));
  }
}

.jeu {
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 50%;
  --holo: 0.22;
  position: relative;
  display: block;
  inline-size: 15rem;
  block-size: 21rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, $ardoise, $bloc);
  box-shadow: 0 16px 32px rgba(#000, 0.45);
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transition:
    transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.4s;
  -webkit-box-reflect: below 14px linear-gradient(transparent 60%, rgba(#fff, 0.14));
  outline: none;

  // Le liseré dégradé, rose vers cyan.
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    background: linear-gradient(135deg, var(--section-teinte), $cyan 50%, rgba(#fff, 0.7));
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  &--active {
    --holo: 0.85;
    transition:
      transform 0.08s linear,
      box-shadow 0.4s;
    box-shadow:
      0 24px 60px color-mix(in srgb, var(--section-teinte) 45%, transparent),
      0 12px 24px rgba(#000, 0.5);
  }

  &:focus-visible {
    outline: 2px solid $cyan;
    outline-offset: 4px;
  }

  &__filet {
    position: absolute;
    inset: 10px;
    border-radius: 0.75rem;
    border: 1px solid rgba(#fff, 0.1);
  }

  &__coin {
    position: absolute;
    inset-block-start: 0.75rem;
    inset-inline-start: 1.1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    font-family: $police-titre;
    font-weight: 800;
    font-variation-settings: 'wdth' 118;
    font-size: 1.35rem;
    line-height: 1;
    color: var(--section-teinte);

    &--bas {
      inset-block: auto 0.75rem;
      inset-inline: auto 1.1rem;
      transform: rotate(180deg);
    }
  }

  &__portrait {
    position: absolute;
    inset-inline: 1.5rem;
    inset-block-start: 2.9rem;
    block-size: 9.4rem;
    display: grid;
    place-items: center;
    border-radius: 6rem 6rem 0.9rem 0.9rem;
    background: linear-gradient(135deg, var(--section-teinte), #d492f2);
    font-family: $police-titre;
    font-weight: 800;
    font-variation-settings: 'wdth' 118;
    font-size: 3.75rem;
    color: rgba(#fff, 0.92);
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inline-size: 7.5rem;
      block-size: 3.75rem;
      inset-inline-start: 1.5rem;
      inset-block-start: 0.9rem;
      border-radius: 50%;
      background: radial-gradient(rgba(#fff, 0.35), transparent 70%);
      transform: rotate(18deg);
    }
  }

  &__nom,
  &__role,
  &__stats {
    position: absolute;
    inset-inline: 1.25rem;
    text-align: center;
  }

  &__nom {
    inset-block-start: 13rem;
    font-family: $police-titre;
    font-weight: 800;
    font-variation-settings: 'wdth' 118;
    font-size: 1.35rem;
    line-height: 1.1;
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__role {
    inset-block-start: 14.9rem;
    font-size: 0.8rem;
    color: rgba(#fff, 0.65);
  }

  &__trait {
    position: absolute;
    inset-inline: 3.75rem;
    inset-block-start: 16.7rem;
    block-size: 1px;
    background: rgba(#fff, 0.12);
  }

  &__stats {
    inset-block-start: 17.3rem;
    inset-inline: 2.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(#fff, 0.6);

    em {
      font-style: normal;
      color: var(--section-teinte);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // Le dos, pour les visiteurs.
  &__motif {
    position: absolute;
    inset: 1.6rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    place-items: center;
    color: color-mix(in srgb, var(--section-teinte) 45%, transparent);
  }

  &__blason {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    display: grid;
    place-items: center;
    inline-size: 5.5rem;
    block-size: 5.5rem;
    border-radius: 50%;
    background: var(--section-teinte);
    color: $noir-profond;
    transform: translate(-50%, -50%);
  }

  &__holo,
  &__eclat {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }

  &__holo {
    mix-blend-mode: color-dodge;
    opacity: var(--holo);
    transition: opacity 0.4s;
    background: linear-gradient(
      115deg,
      transparent 0%,
      rgba(77, 203, 243, 0.5) 30%,
      rgba(255, 227, 140, 0.5) 46%,
      rgba(212, 146, 242, 0.5) 62%,
      rgba(245, 138, 181, 0.5) 78%,
      transparent 100%
    );
    background-size: 220% 220%;
    background-position: var(--mx) var(--my);
  }

  &__eclat {
    mix-blend-mode: overlay;
    opacity: 0;
    transition: opacity 0.3s;
    background: radial-gradient(
      circle at var(--mx) var(--my),
      rgba(#fff, 0.9),
      rgba(#fff, 0.25) 25%,
      transparent 55%
    );
  }

  &--active &__eclat {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .emplacement {
    animation: none;
  }
  .jeu,
  .jeu--active {
    transition: none;
    transform: none;
  }
}
</style>
