import { PageShell } from "@/games/quoi-de-9/components/page-shell";
import { ButtonLink } from "@/games/quoi-de-9/components/ui";

export default function InstallPage() {
  return (
    <PageShell>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-text)]">
        Plein écran
      </p>
      <h1 className="display-face balance mt-3 text-6xl leading-[0.86]">Installe le jeu.</h1>
      <div className="mt-8 grid gap-4">
        <section className="glass-panel rounded-3xl p-6">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">
            iPhone · Safari
          </p>
          <h2 className="mt-2 text-xl font-black">Partager, puis écran d’accueil</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/58">
            Ouvre le menu Partager de Safari, choisis « Sur l’écran d’accueil », puis « Ajouter ».
          </p>
        </section>
        <section className="glass-panel rounded-3xl p-6">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">
            Android · Chrome
          </p>
          <h2 className="mt-2 text-xl font-black">Installer l’application</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/58">
            Ouvre le menu ⋮ de Chrome et touche « Installer l’application » ou « Ajouter à l’écran
            d’accueil ».
          </p>
        </section>
      </div>
      <p className="mt-5 text-center text-xs leading-relaxed text-white/38">
        La partie reste sur cet appareil, sans compte. Les écrans déjà chargés restent disponibles
        si le réseau disparaît.
      </p>
      <div className="mt-auto pt-8">
        <ButtonLink href="/quoi-de-9">Retour au jeu</ButtonLink>
      </div>
    </PageShell>
  );
}
