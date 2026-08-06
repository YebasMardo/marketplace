// Contenu du panneau vitrine des pages d'authentification.
//
// Les photos sont servies par Unsplash (hotlink). Pour passer à des fichiers
// locaux plus tard : déposer les images dans `public/auth/` et remplacer les
// appels `photo(...)` par '/auth/nom-du-fichier.jpg'. Rien d'autre à changer —
// le composant ne connaît que le champ `image`.

const photo = (id: string, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

const face = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=facearea&facepad=3.2&w=96&h=96&q=70`;

export type AuthSlide = {
  image: string;
  alt: string;
  quote: string;
  author: string;
  role: string;
};

/** Témoignages côté acheteurs — page de connexion. */
export const BUYER_SLIDES: AuthSlide[] = [
  {
    image: photo('1483985988355-763728e1935b'),
    alt: 'Une cliente tenant plusieurs sacs de shopping en papier',
    quote:
      "Je retrouve ici des objets que je ne vois nulle part ailleurs — et je sais exactement qui les a faits.",
    author: 'Amina Diallo',
    role: 'Acheteuse depuis 2024',
  },
  {
    image: photo('1483181957632-8bda974cbc91'),
    alt: 'Une personne marchant avec ses achats en pleine journée',
    quote:
      "Prix clairs, livraison annoncée dès la fiche produit. Aucune mauvaise surprise à la caisse.",
    author: 'Julien Meyer',
    role: 'Acheteur',
  },
  {
    image: photo('1513094735237-8f2714d57c13'),
    alt: 'Une cliente tenant un sac en papier dans la rue',
    quote:
      "Commander à un vendeur indépendant est devenu aussi simple que sur les grandes plateformes.",
    author: 'Clara Nguyen',
    role: 'Acheteuse',
  },
];

/** Témoignages côté vendeurs — page d'inscription. */
export const SELLER_SLIDES: AuthSlide[] = [
  {
    image: photo('1521566652839-697aa473761a'),
    alt: 'Une commerçante dans son magasin',
    quote:
      "Boutique ouverte le matin, première commande le soir. Je n'ai eu à remplir qu'un formulaire.",
    author: 'Sofia Marchetti',
    role: 'Céramiste, 180 ventes',
  },
  {
    image: photo('1573855619003-97b4799dcd8b'),
    alt: 'Une personne transportant des sacs après ses achats',
    quote:
      "Physique ou numérique, je publie tout au même endroit et je suis mes ventes depuis un seul tableau de bord.",
    author: 'Karim Benali',
    role: 'Illustrateur',
  },
  {
    image: photo('1574634534894-89d7576c8259'),
    alt: 'Une vendeuse tenant un sac devant sa boutique',
    quote:
      "Pas de commission cachée, pas d'entrepôt. Mes clients savent qu'ils achètent directement chez moi.",
    author: 'Léa Fontaine',
    role: 'Créatrice textile',
  },
];

/** Avatars de la carte flottante. */
export const COMMUNITY_AVATARS = [
  { src: face('1483985988355-763728e1935b'), alt: '' },
  { src: face('1525562723836-dca67a71d5f1'), alt: '' },
  { src: face('1513094735237-8f2714d57c13'), alt: '' },
];
