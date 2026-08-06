import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * État partagé des menus déroulants de l'en-tête : fermeture au clic
 * extérieur, à la touche Échap et à chaque changement d'URL (sinon le menu
 * reste ouvert par-dessus la page qu'on vient d'atteindre).
 *
 * Le ref se pose sur l'élément qui englobe *à la fois* le bouton et le
 * panneau, faute de quoi le clic sur le bouton compte comme extérieur.
 */
export function useDropdown<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);
  const { pathname, search } = useLocation();

  // Ajustement pendant le rendu (et non dans un effet) : c'est le motif
  // recommandé pour recalculer un état à partir d'une valeur qui change,
  // et ça évite le rendu en cascade d'un setState dans useEffect.
  const location = pathname + search;
  const [lastLocation, setLastLocation] = useState(location);
  if (location !== lastLocation) {
    setLastLocation(location);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return { open, setOpen, ref };
}
