# Donnees mineurs et migration localStorage

## Objectif Phase 0

Ce document cadre le passage futur de Scope SI vers une progression serveur sans activer de collecte, de migration ou d'authentification nouvelle.

## Etat actuel

L'application stocke localement, dans le navigateur :

- `infoscope_progress` : code classe, pseudo, progression par module, scores et badges.
- `infoscope_class_<code>` : aggregation locale par pseudo pour la vue enseignant sur le meme appareil.

Ces donnees ne sont pas synchronisees avec l'API PostgreSQL a ce stade.

## Principes donnees mineurs

- Ne pas demander d'email eleve en V1.
- Utiliser un pseudo eleve non nominatif.
- Lier l'eleve a une classe par code ou invitation controlee.
- Minimiser les donnees : progression pedagogique, pas de donnees sensibles.
- Separer les roles `student`, `teacher`, `admin`.
- Journaliser les actions admin/enseignant futures sans exposer les contenus personnels dans les logs.
- Prevoir suppression/export par classe et par utilisateur pseudonyme.
- Definir une duree de conservation par etablissement ou pilote avant toute collecte serveur.

## Mapping localStorage vers DB V1

### `infoscope_progress`

Source :

```json
{
  "classCode": "FREINET-6B",
  "pseudo": "Explorateur",
  "modules": {
    "opinion-vs-fait": {
      "fichesRead": ["quest-ce-quun-fait"],
      "activitesCompleted": ["quiz-fait-ou-opinion"],
      "scores": { "quiz-fait-ou-opinion": 80 }
    }
  },
  "badges": ["detecteur-de-faits"]
}
```

Cible DB existante :

- `classes.code` <- `classCode`
- `users.pseudo` <- `pseudo`
- `users.class_code` <- `classCode`
- `users.role` <- `student`
- `progress.user_id` <- utilisateur cree ou retrouve
- `progress.module_id` <- cle de `modules`
- `progress.fiches_read` <- `fichesRead`
- `progress.activites_completed` <- `activitesCompleted`
- `progress.scores` <- `scores`

Manque DB a prevoir :

- stockage des badges ou recalcul fiable depuis la progression ;
- identifiant stable d'appareil/session pour eviter les doublons ;
- rattachement classe a un etablissement/tenant ;
- horodatage de consentement ou cadre pilote.

### `infoscope_class_<code>`

Source :

```json
{
  "Explorateur": {
    "modules": {},
    "badges": []
  }
}
```

Usage futur :

- Ne pas migrer directement comme source de verite.
- Reconstituer la vue enseignant depuis `users` + `progress`.
- Utiliser seulement comme aide de reconciliation si un pilote local doit etre repris.

## Strategie de migration future

1. Lire localStorage cote navigateur apres authentification/session minimale.
2. Afficher un resume local a l'utilisateur ou a l'enseignant pilote.
3. Creer ou retrouver l'utilisateur pseudonyme dans la classe.
4. Envoyer chaque progression module par module.
5. Verifier la relecture serveur.
6. Marquer localement `serverSyncedAt` uniquement apres succes.
7. Garder une option export JSON avant suppression locale.

## Risques

- Appareils partages : plusieurs pseudos peuvent etre melanges.
- Pseudos identiques dans une classe : necessite identifiant serveur distinct.
- Donnees professeur localStorage incompletes : ne pas les traiter comme preuve.
- Perte offline : ne pas supprimer localStorage avant confirmation serveur.

## Critere de GO avant collecte serveur

- Modele donnees V1 valide.
- Politique de conservation validee.
- Auth enseignant et session eleve definies.
- Endpoint API expose de facon controlee.
- Tests migration dry-run et rollback disponibles.
