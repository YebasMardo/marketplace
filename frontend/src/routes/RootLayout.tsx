import { Outlet, ScrollRestoration } from 'react-router-dom';

/**
 * Route racine, montée sous toutes les autres (Layout comme écrans d'auth).
 *
 * En SPA le navigateur ne réinitialise pas le défilement : sans ça, cliquer sur
 * un lien depuis le bas d'une page ouvre la suivante déjà scrollée (souvent
 * directement sur le footer). `ScrollRestoration` remet en haut sur une
 * navigation avant et restaure la position d'origine sur retour/suivant.
 */
export function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
