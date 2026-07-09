# maline — Facturation (avec synchro Supabase)

Application de facturation (factures, devis, commandes, avoirs) pour Maline Productions.
Cette version est un vrai projet web (pas un artifact Claude) : elle stocke ses données
dans Supabase, ce qui permet à vos 2 iPad et votre téléphone de voir **les mêmes données,
en temps réel**.

## 1. Créer la table dans Supabase

Dans votre projet Supabase existant → **SQL Editor** → nouvelle requête → collez ceci → **Run** :

```sql
create table if not exists app_storage (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table app_storage enable row level security;

-- Politique simple : tout le monde avec la clé "anon" peut lire/écrire.
-- Suffisant pour un usage interne à 3 appareils de confiance.
create policy "allow all on app_storage"
  on app_storage for all
  using (true)
  with check (true);
```

Ensuite activez le "Realtime" sur la table :
**Database → Replication → activez la réplication pour `app_storage`**
(ou `alter publication supabase_realtime add table app_storage;` dans le SQL Editor).

## 2. Récupérer vos clés Supabase

Dans **Project Settings → API** :
- `Project URL` → à mettre dans `VITE_SUPABASE_URL`
- `anon public` key → à mettre dans `VITE_SUPABASE_ANON_KEY`

## 3. Déployer sur Netlify

Même procédure que pour AGTIMMO :

1. Poussez ce dossier sur un dépôt GitHub (ou glissez-déposez le dossier `dist` après
   `npm run build` si vous préférez un déploiement manuel sans Git).
2. Sur Netlify : **Add new site → Import an existing project** → connectez le dépôt.
3. Build command : `npm run build` — Publish directory : `dist` (déjà pré-rempli via
   `netlify.toml`).
4. Dans **Site configuration → Environment variables**, ajoutez :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Déployez. Netlify vous donne une URL (ex. `maline-factu.netlify.app`).

## 4. Installer sur les 2 iPad + le téléphone

Ouvrez l'URL Netlify dans Safari sur chaque appareil, puis
**Partager → Sur l'écran d'accueil**. L'appli s'ouvre alors en plein écran comme une
vraie app, et pointe vers la même base Supabase : toute facture créée sur un appareil
apparaît automatiquement sur les autres (aucune action manuelle nécessaire).

## Tester en local avant de déployer

```bash
npm install
cp .env.example .env   # puis renseignez vos vraies clés dans .env
npm run dev
```

## Notes

- La sécurité est volontairement simple (pas de login) : la clé `anon` de Supabase suffit
  à lire/écrire. C'est adapté à un usage interne entre appareils de confiance. Si vous
  voulez restreindre l'accès plus tard (mot de passe, comptes séparés), on peut ajouter
  l'authentification Supabase par-dessus sans tout refaire.
- Le logo et les coordonnées de l'entreprise restent modifiables dans **Paramètres**.
