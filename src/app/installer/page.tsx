import Link from "next/link";

export default function InstallPage() {
  return (
    <main className="launcher-shell install-shell">
      <Link href="/" className="launcher-back">
        ← Tous les jeux
      </Link>
      <p className="launcher-eyebrow">Toujours à portée de main</p>
      <h1>Installez AntaVerse.</h1>
      <p>Vos trois jeux s’ouvrent alors en plein écran, comme une application mobile.</p>
      <div className="install-grid">
        <section>
          <span>iPhone · Safari</span>
          <h2>Partager, puis « Sur l’écran d’accueil »</h2>
          <p>Ouvrez le menu Partager, choisissez « Sur l’écran d’accueil », puis « Ajouter ».</p>
        </section>
        <section>
          <span>Android · Chrome</span>
          <h2>Installer l’application</h2>
          <p>Ouvrez le menu ⋮, puis touchez « Installer l’application ».</p>
        </section>
      </div>
    </main>
  );
}
