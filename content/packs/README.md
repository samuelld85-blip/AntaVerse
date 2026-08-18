# Packs éditoriaux compacts

Chaque fichier `.mjs` exporte un tableau `questions`. Les packs ne sont jamais chargés par le jeu.
Ils servent uniquement à produire les fiches JSON riches après validation avec :

```bash
npm run content:packs
npm run content:packs -- --write
```

Une entrée doit fournir un identifiant stable, un thème, un sous-thème existant, un niveau numérique,
une question naturelle, exactement neuf réponses, une règle de qualification, une explication et au
moins une source fiable. Le générateur ajoute les métadonnées répétitives, normalise les réponses et
calcule l’empreinte du jeu de réponses.
