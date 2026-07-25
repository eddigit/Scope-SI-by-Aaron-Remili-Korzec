# InfoScope production readiness

## Etat actif

- Frontend public : Vercel/GitHub uniquement.
- API et PostgreSQL : pod VPS2 isole, sans port public publie.
- Donnees eleves : pas de migration automatique, import localStorage uniquement via endpoint interne avec `optIn: true`.
- Auth enseignants : invitation par token a usage unique, token stocke uniquement sous forme de hash.
- Eleves : pseudonyme + classe, sans email.

## Contenu versionne

Le contenu pedagogique reste versionne dans `src/data/modules.ts`.

Regles avant modification :

- une PR/commit par lot pedagogique coherent ;
- conserver des IDs stables pour modules, fiches, activites et questions ;
- ne jamais reutiliser un ID supprime pour un contenu different ;
- valider `npm run build` apres changement de contenu.

Un CMS n'est pas necessaire tant que l'equipe pilote est reduite. Le besoin CMS doit etre reetudie seulement si plusieurs redacteurs non techniques doivent publier sans Git.

## Donnees mineurs et retention

Donnees minimales autorisees :

- pseudo libre ;
- code classe ;
- progression pedagogique par module ;
- session appareil ou session enseignant sous forme de hash ;
- aucun email eleve.

Defaut conservateur recommande :

- sessions eleves : 90 jours apres derniere activite ;
- progression eleve : annee scolaire en cours + 90 jours ;
- invitations enseignants : 7 jours par defaut, maximum 30 jours ;
- journaux techniques : 30 jours si possible.

Export/suppression a prevoir avant pilote large :

- export classe agrege pour enseignant ;
- suppression d'un eleve par identifiant interne ;
- purge d'une classe en fin d'annee ;
- purge des sessions expirees.

## Sauvegarde et restauration

Sauvegarde PostgreSQL VPS2 deja prevue par l'infrastructure `pod-infoscope`.

Validation minimale mensuelle :

- confirmer qu'une archive recente existe ;
- restaurer l'archive sur une base temporaire isolee ;
- verifier `schema_migrations`, `organizations`, `schools`, `classes`, `users`, `progress`.

Restauration production :

1. suspendre les ecritures API ;
2. sauvegarder l'etat courant ;
3. restaurer l'archive choisie sur PostgreSQL Infoscope ;
4. relancer migrations `npm run migrate:up` ;
5. verifier `/api/health` depuis le conteneur API ;
6. reouvrir les ecritures.

## Securite

Garde-fous actifs :

- API protegee par cle interne hors depot ;
- CORS limite a `https://app.infosscope.com` ;
- rate limiting configurable ;
- PostgreSQL sans exposition publique ;
- tokens invitation/session hashes en base ;
- analytics uniquement agreges.

Avant exposition API publique controlee :

- placer l'API derriere TLS ;
- ne publier que la route proxy/API necessaire ;
- journaliser sans secrets ni donnees eleves identifiantes ;
- verifier que Vercel garde les secrets cote serveur uniquement.

## Observabilite

Indicateurs minimum :

- disponibilite `/api/health` ;
- statut Docker healthcheck ;
- nombre de migrations appliquees ;
- erreurs 4xx/5xx API agregees ;
- age derniere sauvegarde ;
- espace disque volume PostgreSQL.

## PWA et performance

Le service worker est opportuniste :

- aucune fonctionnalite critique ne depend de lui ;
- reseau d'abord, cache seulement en secours ;
- pas de collecte ou sync automatique en arriere-plan.

Objectifs mobiles :

- build statique rapide ;
- assets limites ;
- pas de dependance lourde d'animation ou analytics.

## Accessibilite

Minimum avant pilote :

- parcours clavier sur les ecrans principaux ;
- contrastes boutons/texte verifies ;
- libelles explicites sur formulaires ;
- pas d'information uniquement par couleur ;
- respect de la langue `fr`.

## Support pilote

Canal pilote recommande :

- un contact enseignant referent ;
- une fiche incident simple : classe, heure, URL, action tentee, message observe ;
- tri hebdomadaire des retours en bugs, contenu, ergonomie, demande produit.

Critere de passage pilote large :

- restauration testee ;
- suppression/export operationnels ;
- auth enseignant finalisee via fournisseur email ou invitation manuelle securisee ;
- exposition API documentee et verifiee en HTTPS.
