import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { AuthSlide } from '../../pages/public/authShowcase';
import { COMMUNITY_AVATARS } from '../../pages/public/authShowcase';

/* Classes partagées par les champs des deux formulaires d'auth. Les inputs
   sont sombres ici (contrairement au reste de l'app) : c'est le parti pris du
   panneau d'authentification, sur fond clair et dégradé. */
export const authLabelClass =
  'block text-[13px] font-medium text-ink-soft mb-1.5';

export const authInputClass =
  'w-full rounded-xl bg-ink px-4 py-3 text-[15px] text-paper placeholder:text-ink-faint ' +
  'border border-transparent transition-[border-color,box-shadow] duration-150 ' +
  'focus:outline-none focus:border-clay focus:ring-2 focus:ring-clay/30';

export const authErrorClass = 'text-[13px] text-clay-dark mt-1.5';

export const authSubmitClass =
  'w-full rounded-xl bg-gradient-to-r from-clay to-[#d9744a] py-3 font-semibold text-paper ' +
  'shadow-[0_10px_24px_-10px_rgba(184,80,46,0.75)] hover:from-clay-dark hover:to-clay ' +
  'disabled:opacity-60 disabled:cursor-not-allowed ' +
  'transition-[background-image,transform,opacity] duration-150 ease-out active:scale-[0.985] motion-reduce:active:scale-100';

/* Dégradé « mesh » chaud dérivé de la palette clay, en remplacement du
   violet/rose du modèle d'origine. */
const MESH_BACKDROP = {
  backgroundImage: [
    'radial-gradient(60% 55% at 12% 8%, #f2d9c6 0%, transparent 62%)',
    'radial-gradient(55% 50% at 88% 12%, #e7c2ab 0%, transparent 58%)',
    'radial-gradient(65% 60% at 78% 92%, #d8b9a4 0%, transparent 60%)',
    'radial-gradient(70% 60% at 30% 95%, #efe1d6 0%, transparent 62%)',
    'linear-gradient(135deg, #f6ece4 0%, #e9d3c2 100%)',
  ].join(', '),
};

/* Rangée de connexions sociales de la maquette. Le backend n'expose aucun
   flux OAuth pour l'instant : les boutons sont donc rendus mais réellement
   `disabled`, plutôt que cliquables et sans effet. Retirer `disabled` et
   brancher un `onClick` le jour où les providers existent. */
const SOCIAL_PROVIDERS = [
  {
    name: 'Google',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
        <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21 7.6 23.5 12 23.5Z" />
        <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z" />
        <path fill="#EA4335" d="M12 5.1c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.6 15.1.5 12 .5 7.6.5 3.7 3 1.8 6.8l3.8 3c.9-2.7 3.4-4.7 6.4-4.7Z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
        <path d="M23.5 12a11.5 11.5 0 1 0-13.3 11.4v-8h-2.9V12h2.9V9.5c0-2.9 1.7-4.5 4.3-4.5 1.3 0 2.6.2 2.6.2v2.8h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.2l-.5 3.4h-2.7v8A11.5 11.5 0 0 0 23.5 12Z" />
      </svg>
    ),
  },
];

export function AuthSocialRow() {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line-strong/70" />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">ou</span>
        <span className="h-px flex-1 bg-line-strong/70" />
      </div>
      <div className="mt-5 flex items-center justify-center gap-3.5">
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider.name}
            type="button"
            disabled
            title={`Connexion ${provider.name} — bientôt disponible`}
            aria-label={`Connexion ${provider.name} — bientôt disponible`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-raised text-ink opacity-55 shadow-sm disabled:cursor-not-allowed"
          >
            {provider.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

type AuthLayoutProps = {
  /** Titre principal du formulaire, ex. « Bon retour ». */
  title: string;
  subtitle: string;
  /** Titre du panneau vitrine, sur deux lignes comme dans la maquette. */
  showcaseTitle: ReactNode;
  slides: AuthSlide[];
  callout: { title: string; body: string };
  /** Le formulaire lui-même. */
  children: ReactNode;
  /** Ligne de bas de formulaire (« Pas de compte ? … »). */
  footer: ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  showcaseTitle,
  slides,
  callout,
  children,
  footer,
}: AuthLayoutProps) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const go = (step: number) =>
    setIndex((current) => (current + step + slides.length) % slides.length);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10"
      style={MESH_BACKDROP}
    >
      <div className="w-full max-w-6xl rounded-[32px] border border-paper-raised/50 bg-paper-raised/25 p-4 sm:p-6 lg:p-8 shadow-[0_40px_90px_-40px_rgba(60,30,18,0.45)] backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* ---------- Colonne formulaire ---------- */}
          <div className="flex flex-col justify-center px-2 sm:px-6 lg:px-8 py-6 lg:py-10">
            <Link
              to="/"
              aria-label="Retour à l'accueil"
              className="mb-10 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-90 motion-reduce:transform-none"
            >
              <svg width="19" height="19" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M16 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <path
                  d="M13.5 20h21l-1.6 16.2a3 3 0 0 1-3 2.8H18.1a3 3 0 0 1-3-2.8L13.5 20Z"
                  fill="currentColor"
                />
              </svg>
            </Link>

            <h1 className="text-[32px] leading-tight text-ink">{title}</h1>
            <p className="mt-2 text-[15px] text-ink-soft">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-7 text-center text-sm text-ink-soft">{footer}</div>
          </div>

          {/* ---------- Colonne vitrine ---------- */}
          <div className="relative hidden lg:block pb-10">
            <div className="relative h-full min-h-[540px] overflow-hidden rounded-[26px] bg-ink">
              {/* Photos empilées, fondu enchaîné au changement de témoignage. */}
              {slides.map((item, i) => (
                <img
                  key={item.image}
                  src={item.image}
                  alt={i === index ? item.alt : ''}
                  aria-hidden={i !== index}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                    i === index ? 'opacity-70' : 'opacity-0'
                  }`}
                />
              ))}
              {/* Voile sombre : garde le texte lisible en haut à gauche et
                  laisse la photo respirer en bas à droite. Volontairement léger —
                  juste assez pour le contraste du texte. */}
              <div className="absolute inset-0 bg-gradient-to-br from-ink/88 via-ink/70 to-ink/10" />

              <div className="relative flex h-full flex-col p-9">
                <h2 className="text-[34px] leading-[1.15] text-paper">{showcaseTitle}</h2>

                <svg
                  className="mt-8 text-paper/70"
                  width="30"
                  height="22"
                  viewBox="0 0 30 22"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M0 22V11.6C0 5.2 3.9.9 10.6 0l.9 3.4C7.6 4.3 5.4 6.7 5.4 9.8h4.9V22H0Zm18.8 0V11.6c0-6.4 3.9-10.7 10.6-11.6l.9 3.4c-3.9.9-6.1 3.3-6.1 6.4H29V22H18.8Z" />
                </svg>

                <figure className="mt-5">
                  <blockquote className="max-w-md text-[15px] leading-relaxed text-paper/90">
                    {slide.quote}
                  </blockquote>
                  <figcaption className="mt-6">
                    <p className="font-semibold text-paper">{slide.author}</p>
                    <p className="text-sm text-paper/60">{slide.role}</p>
                  </figcaption>
                </figure>

                <div className="mt-auto flex items-center gap-3 pt-8">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Témoignage précédent"
                    className="flex h-11 w-14 items-center justify-center rounded-xl bg-clay-soft text-clay-dark transition-[background-color,transform] duration-150 ease-out hover:bg-paper active:scale-95 motion-reduce:transform-none"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Témoignage suivant"
                    className="flex h-11 w-14 items-center justify-center rounded-xl border border-paper/25 text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-paper/10 active:scale-95 motion-reduce:transform-none"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Carte flottante, débordant sur le bas du panneau sombre. */}
            <div className="absolute -bottom-1 left-12 right-2 rounded-2xl bg-paper-raised p-6 shadow-[0_24px_50px_-24px_rgba(60,30,18,0.55)]">
              <h3 className="text-[17px] leading-snug text-ink">{callout.title}</h3>
              <div className="mt-3 flex items-end justify-between gap-4">
                <p className="max-w-[62%] text-[13px] leading-relaxed text-ink-soft">
                  {callout.body}
                </p>
                <div className="flex items-center -space-x-2.5 shrink-0">
                  {COMMUNITY_AVATARS.map((avatar) => (
                    <img
                      key={avatar.src}
                      src={avatar.src}
                      alt={avatar.alt}
                      aria-hidden="true"
                      loading="lazy"
                      className="h-9 w-9 rounded-full border-2 border-paper-raised object-cover bg-paper-sunken"
                    />
                  ))}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-paper-raised bg-ink text-[11px] font-semibold text-paper">
                    +2
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
