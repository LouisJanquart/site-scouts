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

let io: IntersectionObserver | null = null
onMounted(() => {
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
onBeforeUnmount(() => io?.disconnect())
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
    scroll-snap-type: y proximity;
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
    scroll-snap-align: start;

    & + & {
      margin-block-start: $gouttiere-console;
    }
  }
}
</style>
