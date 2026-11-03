# Carte commune

Carte OpenStreetMap d'une ville. Le public voit les lieux. Les éditeurs connectés accèdent à un panneau de modification : liste des lieux, ajout, modification, déplacement des marqueurs. Tout est visible en direct par tout le monde.

## Démarrage
1. Crée un projet gratuit sur supabase.com, puis exécute dans l'éditeur SQL `supabase/schema.sql`, puis `supabase/auth.sql`.
2. Copie `.env.example` en `.env` et colle l'URL et la clé publique du projet (Project Settings > API Keys).
3. `npm install` puis `npm run dev`.

La ville se change dans `src/config.js`.

## Donner accès à quelqu'un
Le token ne sert qu'à créer le compte. Dans l'éditeur SQL de Supabase :

    insert into public.invites (note) values ('Marie') returning token;

Donne-lui le token (ou le lien `https://TON-SITE/?cle=<token>`). Dans « Connexion > Créer un compte », elle saisit son e-mail, un mot de passe et la clé. Ensuite elle se connecte simplement avec e-mail et mot de passe, et le panneau de modification s'affiche. La clé fonctionne une seule fois et expire au bout de 7 jours.

## Un compte existant sans accès au panneau ?
Un compte créé hors de ce circuit (par exemple depuis le tableau de bord Supabase) n'a pas les droits d'édition. Pour lui en donner :

    insert into public.editors (user_id)
    select id from auth.users where email = 'adresse@exemple.fr';
