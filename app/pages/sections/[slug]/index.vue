<script setup lang="ts">
// La page d'une section, refaite le 14/10/2026 d'après le prototype Figma
// (« Refonte 13/10 · prototype », proposition B).
//
// Une suite de rubriques qui prennent chacune toute la hauteur de l'écran :
// l'accueil de la section, le staff, l'agenda, les actus, la galerie, les
// ressources. Si une rubrique manque de place en hauteur, elle ne se tasse
// pas : son contenu défile à l'horizontale.
//
// Sur grand écran, la page défile à l'intérieur de la scène (la coque ne
// défile jamais) et une pagination fixée au bord droit dit où l'on est. Sur
// téléphone, les rubriques s'empilent simplement.
const { section } = useSectionCourante()

const rubriques = [
  { id: 'accueil', nom: 'Accueil' },
  { id: 'le-staff', nom: 'Le staff' },
  { id: 'l-agenda', nom: 'L’agenda' },
  { id: 'les-actus', nom: 'Les actus' },
  { id: 'la-galerie', nom: 'La galerie' },
  { id: 'les-ressources', nom: 'Les ressources' },
]
const numero = (id: string) => String(rubriques.findIndex((r) => r.id === id)).padStart(2, '0')

const defilement = ref<HTMLElement | null>(null)
const active = ref('accueil')

function aller(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
}

// La molette : un cran fait passer à la rubrique suivante ou précédente.
// Le calage CSS seul (scroll-snap) ramenait la page en arrière sur un petit
// cran de molette, et laissait un pavé tactile s'arrêter entre deux.
let verrou = false
let cumul = 0
let remise: ReturnType<typeof setTimeout> | null = null
let relache: ReturnType<typeof setTimeout> | null = null
function molette(e: WheelEvent) {
  const el = defilement.value
  if (!el || el.scrollHeight <= el.clientHeight + 4) return // pile sur téléphone
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return // piste horizontale, zoom
  // Une rubrique plus haute que l'écran se lit d'abord jusqu'au bout.
  const rubs = [...el.querySelectorAll<HTMLElement>('.rubrique')]
  const haut = el.scrollTop
  const idx = rubs.findIndex((r) => r.offsetTop - el.offsetTop + r.offsetHeight > haut + 2)
  const courante = rubs[idx]
  if (courante) {
    const debut = courante.offsetTop - el.offsetTop
    const fin = debut + courante.offsetHeight - el.clientHeight
    if (fin > debut + 4 && ((e.deltaY > 0 && haut < fin - 2) || (e.deltaY < 0 && haut > debut + 2))) return
  }
  e.preventDefault()
  // Un pavé tactile continue d'envoyer des événements sur sa lancée : on ne
  // relâche qu'une fois la molette au repos, pour ne pas sauter une rubrique.
  if (verrou) {
    if (relache) clearTimeout(relache)
    relache = setTimeout(() => (verrou = false), 250)
    return
  }
  cumul += e.deltaY
  if (remise) clearTimeout(remise)
  remise = setTimeout(() => (cumul = 0), 200)
  if (Math.abs(cumul) < 30) return
  const cible = rubs[Math.min(rubs.length - 1, Math.max(0, idx + (cumul > 0 ? 1 : -1)))]
  cumul = 0
  if (!cible || cible === courante) return
  verrou = true
  aller(cible.id)
  if (relache) clearTimeout(relache)
  relache = setTimeout(() => (verrou = false), 700)
}

let io: IntersectionObserver | null = null
onMounted(() => {
  defilement.value?.addEventListener('wheel', molette, { passive: false })
  // Le défilement se fait dans la page sur grand écran, dans la fenêtre sur
  // téléphone : on observe les deux en prenant la racine qui défile vraiment.
  const racine =
    defilement.value && defilement.value.scrollHeight > defilement.value.clientHeight + 4
      ? defilement.value
      : null
  io = new IntersectionObserver(
    (entrees) => {
      const visible = entrees.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) active.value = visible.target.id
    },
    { root: racine, threshold: [0.35, 0.6, 0.9] },
  )
  for (const r of rubriques) {
    const el = document.getElementById(r.id)
    if (el) io.observe(el)
  }
  // Arrivée par un lien vers une rubrique (#l-agenda) : on y va.
  const ancre = location.hash.slice(1)
  if (ancre && rubriques.some((r) => r.id === ancre)) {
    requestAnimationFrame(() => document.getElementById(ancre)?.scrollIntoView({ block: 'start' }))
  }
})
onBeforeUnmount(() => {
  io?.disconnect()
  defilement.value?.removeEventListener('wheel', molette)
})
</script>

<template>
  <div v-if="section" ref="defilement" class="rubriques">
    <section id="accueil" class="rubrique rubrique--accueil" :aria-label="section.nom">
      <SectionAccueil :section="section" :rubriques="rubriques" />
    </section>
    <section id="le-staff" class="rubrique" aria-label="Le staff">
      <SectionStaff :section="section" :numero="numero('le-staff')" />
    </section>
    <section id="l-agenda" class="rubrique" aria-label="L’agenda">
      <SectionAgenda :section="section" :numero="numero('l-agenda')" />
    </section>
    <section id="les-actus" class="rubrique" aria-label="Les actus">
      <SectionActus :section="section" :numero="numero('les-actus')" />
    </section>
    <section id="la-galerie" class="rubrique" aria-label="La galerie">
      <SectionGalerie :section="section" :numero="numero('la-galerie')" />
    </section>
    <section id="les-ressources" class="rubrique" aria-label="Les ressources">
      <SectionRessources :section="section" :numero="numero('les-ressources')" />
    </section>

    <SectionPagination :rubriques="rubriques" :active="active" @aller="aller" />
  </div>
</template>

<style lang="scss" scoped>
.rubriques {
  display: flex;
  flex-direction: column;
  gap: $esp-6;

  @include console {
    display: block;
    block-size: 100%;
    overflow-y: auto;
    // « mandatory » : la page se cale toujours sur une rubrique. Avec
    // « proximity », elle restait parfois à cheval entre deux.
    scroll-snap-type: y mandatory;
    overscroll-behavior-y: contain;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.rubrique {
  scroll-margin-block-start: $esp-3;

  @include console {
    block-size: 100%;
    min-block-size: 38rem;
    scroll-margin-block-start: 0;
    scroll-snap-align: start;
    // Un coup de molette = une rubrique, même lancé fort.
    scroll-snap-stop: always;

    & + & {
      margin-block-start: $gouttiere-console;
    }
  }
}
</style>
