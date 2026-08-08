import { MailIcon } from './icons';

// Bandeau décoratif — UI SEULEMENT. Il n'existe aucune route backend
// d'inscription newsletter : le formulaire ne soumet rien (`preventDefault`)
// et ne doit pas laisser croire à l'utilisateur qu'il est inscrit. À câbler
// le jour où un endpoint /newsletter existe.
const BACKGROUND_URL =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=60';

export function Newsletter() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#124f49] px-6 py-10 sm:px-12 sm:py-12">
      {/* Photo de fond très atténuée : elle donne de la matière au bandeau sans
          jamais concurrencer le texte (contraste AA sur le vert). */}
      <img
        src={BACKGROUND_URL}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#124f49] via-[#124f49]/85 to-[#124f49]/40"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="max-w-md text-3xl font-semibold uppercase leading-tight tracking-tight text-white sm:text-4xl">
          Restez informé de nos dernières offres
        </h2>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full space-y-3 lg:w-80 lg:shrink-0"
        >
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="email"
              placeholder="Entrez votre adresse e-mail"
              aria-label="Adresse e-mail"
              className="w-full rounded-full bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-white py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-sunken"
          >
            S'inscrire à la newsletter
          </button>
        </form>
      </div>
    </section>
  );
}
