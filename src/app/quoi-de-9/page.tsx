import Link from "next/link";
import { Brand } from "@/games/quoi-de-9/components/brand";
import { ButtonLink } from "@/games/quoi-de-9/components/ui";
import { ResumeGameCard } from "@/games/quoi-de-9/components/resume-game-card";
import { ThemeSelector } from "@/games/quoi-de-9/components/theme-selector";
import { GameHomeNav } from "@/components/game-home-nav";

export default function HomePage() {
  return (
    <main className="home-shell safe-shell mx-auto flex w-full max-w-[520px] flex-col rounded-[2rem] sm:my-4 sm:border sm:border-white/10">
      <header className="flex items-center justify-between">
        <Brand />
        <GameHomeNav rulesHref="/quoi-de-9/regles" />
      </header>

      <section className="home-hero flex flex-1 flex-col justify-center py-[clamp(1.5rem,6vh,2.5rem)]">
        <div className="mb-[clamp(1rem,3vh,1.75rem)] flex items-center gap-3">
          <span className="h-px w-10 bg-[var(--lime)]" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-text)]">
            1 téléphone · 2 équipes · 9 réponses
          </p>
        </div>
        <h1 className="display-face balance max-w-[460px] text-[clamp(3.4rem,16vw,5rem)] leading-[0.82]">
          Trouvez-les
          <span className="block text-[var(--accent-text)]">toutes.</span>
        </h1>
        <p className="balance mt-[clamp(1.25rem,4vh,2rem)] max-w-sm text-lg font-medium leading-relaxed text-white/62">
          Le quiz qui transforme neuf bonnes réponses en une soirée mémorable.
        </p>
      </section>

      <section className="grid gap-3 pb-2">
        <ThemeSelector />
        <ResumeGameCard />
        <ButtonLink href="/quoi-de-9/creer">
          Nouvelle partie <span aria-hidden="true">↗</span>
        </ButtonLink>
        <Link
          href="/installer"
          className="min-h-11 py-3 text-center text-xs font-semibold text-white/58 underline decoration-white/25 underline-offset-4"
        >
          Installer sur ce téléphone
        </Link>
      </section>
    </main>
  );
}
