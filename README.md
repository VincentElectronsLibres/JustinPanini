# ⚽ Mon Album Panini — Coupe du Monde FIFA 2026

Application web simple (HTML/CSS/JS, aucune dépendance, aucun serveur) pour aider à compléter
l'album Panini de la Coupe du Monde 2026 : rechercher une référence, marquer les cartes collées,
gérer les doubles à échanger, et garder une sauvegarde.

## 📦 Contenu du dossier

- `index.html` — la page de l'application
- `style.css` — le style (thème "terrain de foot")
- `app.js` — toute la logique (recherche, album, échanges, sauvegarde)
- `data.js` — la base des **980 autocollants** (48 équipes × 20 + 20 cartes spéciales)

## 🚀 Mettre en ligne sur GitHub Pages (gratuit)

1. Crée un nouveau repository sur GitHub (public ou privé), par exemple `mon-album-panini`.
2. Mets ces 4 fichiers (`index.html`, `style.css`, `app.js`, `data.js`) à la racine du repo
   (drag & drop sur la page GitHub, ou `git add` / `git commit` / `git push`).
3. Va dans **Settings → Pages**.
4. Dans "Branch", choisis `main` (ou `master`) et le dossier `/ (root)`, puis **Save**.
5. Après 1-2 minutes, ton site sera disponible à une adresse du type :
   `https://ton-pseudo.github.io/mon-album-panini/`

C'est ce lien que ton fils utilisera, sur PC, tablette ou téléphone, via son navigateur.

## 🔑 Changer le mot de passe

Le mot de passe est défini tout en haut du fichier `app.js` :

```js
const APP_PASSWORD = "messi2026";
```

Remplace `"messi2026"` par le mot de passe de ton choix avant de mettre le site en ligne.

⚠️ **Important** : sur un site statique GitHub Pages, ce mot de passe est visible dans le code
source par quiconque saurait où regarder. C'est suffisant pour dissuader un visiteur de passage,
mais ce n'est pas un vrai système de sécurité. Ne mets rien de confidentiel derrière.

## 💾 Comment fonctionne la sauvegarde

- La progression est enregistrée automatiquement dans le navigateur (localStorage), donc elle
  reste d'une visite à l'autre **sur le même appareil et le même navigateur**.
- Si ton fils utilise plusieurs appareils (ex : tablette ET PC), utilise les boutons
  **Exporter / Importer** dans l'onglet Réglages pour transférer sa collection d'un appareil
  à l'autre (cela télécharge un petit fichier `.json` à réimporter sur l'autre appareil).
- Pense à faire un export de temps en temps pour avoir une sauvegarde de secours.

## 🃏 Fonctionnalités

- **🔍 Chercher** : tape une référence (ex. `MEX5`, `FWC3`, `ARG17`, `00`) → l'appli dit
  immédiatement si la carte est possédée, manquante, ou en double. Boutons rapides pour
  marquer/retirer. Bouton **Annuler** pour revenir en arrière après une erreur.
- **📖 Album** : toutes les cartes organisées par équipe (+ une section "cartes spéciales"),
  avec une mini-barre de progression par équipe. Un tap sur une vignette fait défiler les états
  : manquante → possédée → double → manquante.
- **🔁 Échanges** : liste des doubles (à donner/échanger) et liste des manquantes (à chercher),
  chacune copiable en un clic pour l'envoyer à un copain ou l'emmener au kiosque.
- **⚙️ Réglages** : statistiques globales, export/import de sauvegarde, réinitialisation complète.

## ⚠️ À propos de la liste des 980 autocollants

Cette liste a été reconstituée à partir de checklists disponibles en ligne (sites spécialisés en
cartes à collectionner). Panini peut faire de petits ajustements (joueur blessé, changement de
sélection, etc.) avant la sortie définitive de l'album. Si tu repères une référence ou un nom
qui ne correspond pas à l'album physique de ton fils, ouvre `data.js` : chaque carte y est une
ligne simple du type :

```json
{"code":"MEX5","name":"Cesar Montes","team":"Mexico","teamCode":"MEX","num":5,"special":false,"foil":false}
```

Tu peux corriger directement le nom ou ajouter une carte sans casser le reste de l'application.

## 🛠️ Personnalisation rapide

- **Titre / couleurs** : modifiables dans `index.html` (titre) et `style.css` (variables `:root`
  en haut du fichier, ex. `--pitch`, `--gold`).
- **Mot de passe** : voir section "Changer le mot de passe" ci-dessus.
