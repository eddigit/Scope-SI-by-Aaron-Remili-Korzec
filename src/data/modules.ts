export interface Fiche {
  id: string;
  title: string;
  content: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  type: "choice" | "classify";
  category?: string;
}

export interface Activite {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "defi" | "classement";
  questions?: QuizQuestion[];
  defiDescription?: string;
  items?: { id: string; label: string; correctRank: number }[];
}

export interface Module {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  colorLight: string;
  fiches: Fiche[];
  activites: Activite[];
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
}

export const VALID_CLASS_CODES = [
  "FREINET-6A", "FREINET-6B", "FREINET-5A", "FREINET-5B",
  "FREINET-4A", "FREINET-4B", "FREINET-3A", "FREINET-3B",
  "DEMO-2026",
];

export const TEACHER_CODES: Record<string, string> = {
  "PROF-6A": "FREINET-6A", "PROF-6B": "FREINET-6B",
  "PROF-5A": "FREINET-5A", "PROF-5B": "FREINET-5B",
  "PROF-4A": "FREINET-4A", "PROF-4B": "FREINET-4B",
  "PROF-3A": "FREINET-3A", "PROF-3B": "FREINET-3B",
  "PROF-DEMO": "DEMO-2026",
};

export const modules: Module[] = [
  {
    id: "opinion-vs-fait",
    title: "Fait ou Opinion",
    shortTitle: "Module 1",
    description: "C'est vrai ça ?",
    icon: "🔍",
    color: "#EF4444",
    colorLight: "#FEE2E2",
    badgeId: "detecteur-de-faits",
    badgeName: "Détecteur de faits",
    badgeIcon: "🎯",
    fiches: [
      {
        id: "quest-ce-quun-fait",
        title: "Qu'est-ce qu'un fait ?",
        content: `<h2>Un fait, c'est quoi ?</h2>
<p>Un <strong>fait</strong> est une information <strong>vérifiable</strong>. On peut prouver que c'est vrai (ou faux) avec des preuves concrètes.</p>
<div class="info-card blue">
<h3>💡 Exemples de faits</h3>
<ul>
<li>🌡️ « Il fait 22°C à Paris aujourd'hui. » → Vérifiable avec un thermomètre.</li>
<li>⚽ « La France a gagné la Coupe du Monde en 2018. » → C'est dans les archives.</li>
<li>📅 « La Révolution française a commencé en 1789. » → Date historique documentée.</li>
</ul>
</div>
<h3>Les caractéristiques d'un fait :</h3>
<ul>
<li><strong>Vérifiable</strong> — on peut le prouver avec des données, des mesures, des documents</li>
<li><strong>Objectif</strong> — il ne dépend pas de ce que tu penses ou ressens</li>
<li><strong>Partagé</strong> — tout le monde peut arriver à la même conclusion avec les mêmes preuves</li>
</ul>
<div class="info-card green">
<p>💡 <strong>Astuce :</strong> Quand tu lis une info, demande-toi : « Est-ce que je peux vérifier ça avec des preuves ? » Si oui, c'est probablement un fait !</p>
</div>`,
      },
      {
        id: "quest-ce-quune-opinion",
        title: "Qu'est-ce qu'une opinion ?",
        content: `<h2>Une opinion, c'est quoi ?</h2>
<p>Une <strong>opinion</strong> est un <strong>point de vue personnel</strong>. Elle reflète ce que quelqu'un pense, ressent ou croit. On ne peut pas la prouver de manière définitive.</p>
<div class="info-card orange">
<h3>💬 Exemples d'opinions</h3>
<ul>
<li>🎬 « Ce film est nul. » → Jugement personnel.</li>
<li>🍫 « Le chocolat, c'est le meilleur dessert. » → Question de goût !</li>
<li>📱 « TikTok c'est mieux qu'Instagram. » → Ça dépend de chacun.</li>
</ul>
</div>
<h3>Les caractéristiques d'une opinion :</h3>
<ul>
<li><strong>Subjective</strong> — elle dépend de la personne qui la donne</li>
<li><strong>Non vérifiable</strong> — on ne peut pas la prouver de façon absolue</li>
<li><strong>Variable</strong> — deux personnes peuvent avoir des opinions opposées sans qu'aucune ait « tort »</li>
</ul>
<div class="info-card green">
<p>💡 <strong>Attention :</strong> Avoir une opinion c'est normal et important ! Le problème, c'est quand on confond une opinion avec un fait.</p>
</div>`,
      },
      {
        id: "zones-grises",
        title: "Les zones grises",
        content: `<h2>Quand ça se complique...</h2>
<p>Parfois, la frontière entre fait et opinion n'est pas nette. C'est ce qu'on appelle les <strong>zones grises</strong>.</p>
<div class="info-card red">
<h3>Cas n°1 : Un fait présenté comme une opinion</h3>
<p>« <em>Certains pensent que</em> le réchauffement climatique est causé par l'activité humaine. »</p>
<p>→ En réalité, c'est un <strong>fait scientifique</strong> validé par 97% des climatologues. Le formuler avec « certains pensent » le fait passer pour une simple opinion.</p>
</div>
<div class="info-card red">
<h3>Cas n°2 : Une opinion présentée comme un fait</h3>
<p>« <em>Il est évident que</em> les jeux vidéo rendent violent. »</p>
<p>→ C'est présenté comme une évidence, mais les études ne sont pas unanimes. C'est une <strong>opinion</strong> déguisée en fait.</p>
</div>
<div class="info-card red">
<h3>Cas n°3 : Faits + interprétation</h3>
<p>« Le taux de chômage a baissé de 0.3%, <em>ce qui prouve que la politique du gouvernement fonctionne</em>. »</p>
<p>→ La baisse de 0.3% est un fait. L'explication est une interprétation = opinion.</p>
</div>
<div class="info-card green">
<p>💡 <strong>Conseil :</strong> Quand une phrase mélange chiffres et jugements, sépare mentalement le fait de l'interprétation.</p>
</div>`,
      },
      {
        id: "marqueurs-linguistiques",
        title: "Les marqueurs linguistiques",
        content: `<h2>Les mots qui trahissent</h2>
<p>Certains mots sont des <strong>indices</strong> pour savoir si on lit un fait ou une opinion.</p>
<div class="info-card green">
<h3>🟢 Marqueurs de fait</h3>
<ul>
<li>« Selon l'étude publiée par... »</li>
<li>« Les données montrent que... »</li>
<li>« D'après les chiffres officiels... »</li>
<li>« Il a été mesuré / observé / enregistré... »</li>
</ul>
</div>
<div class="info-card orange">
<h3>🟠 Marqueurs d'opinion</h3>
<ul>
<li>« Je pense que... » / « À mon avis... »</li>
<li>« C'est le meilleur / le pire... »</li>
<li>« Il est évident que... » (attention, faux ami !)</li>
<li>« Tout le monde sait que... » (souvent une opinion déguisée)</li>
</ul>
</div>
<div class="info-card red">
<h3>🔴 Marqueurs trompeurs</h3>
<ul>
<li>« On dit que... » → Qui dit ? Source floue = méfiance</li>
<li>« Des études prouvent que... » → Quelles études ?</li>
<li>« Les experts affirment... » → Quels experts ? En quoi ?</li>
</ul>
</div>
<div class="info-card blue">
<p>💡 <strong>Réflexe :</strong> Quand tu lis « tout le monde sait que » ou « il est évident que », allume ton radar !</p>
</div>`,
      },
    ],
    activites: [
      {
        id: "quiz-fait-ou-opinion",
        title: "Fait ou Opinion ?",
        description: "10 phrases à classer : fait ou opinion ? Attention aux pièges !",
        type: "quiz",
        questions: [
          { id: "q1", question: "« La Tour Eiffel mesure 330 mètres de haut. »", type: "classify", correctAnswer: "fait", category: "fait", explanation: "C'est un fait vérifiable. On peut mesurer la Tour Eiffel !" },
          { id: "q2", question: "« Le rap, c'est la meilleure musique. »", type: "classify", correctAnswer: "opinion", category: "opinion", explanation: "C'est une opinion subjective. La « meilleure musique » dépend des goûts." },
          { id: "q3", question: "« L'eau bout à 100°C au niveau de la mer. »", type: "classify", correctAnswer: "fait", category: "fait", explanation: "C'est un fait scientifique vérifiable et mesurable." },
          { id: "q4", question: "« Les maths, c'est trop dur. »", type: "classify", correctAnswer: "opinion", category: "opinion", explanation: "C'est une opinion. La difficulté est subjective." },
          { id: "q5", question: "« Il est évident que les réseaux sociaux sont dangereux pour les jeunes. »", type: "classify", correctAnswer: "opinion", category: "opinion", explanation: "Malgré « il est évident que », c'est une opinion. Le sujet fait débat. C'est un marqueur trompeur !" },
          { id: "q6", question: "« La France compte environ 67 millions d'habitants. »", type: "classify", correctAnswer: "fait", category: "fait", explanation: "C'est un fait démographique vérifiable via l'INSEE." },
          { id: "q7", question: "« Mbappé est le meilleur joueur du monde. »", type: "classify", correctAnswer: "opinion", category: "opinion", explanation: "C'est une opinion. « Le meilleur » est un jugement subjectif." },
          { id: "q8", question: "« Selon l'OMS, la pollution de l'air cause 7 millions de décès par an. »", type: "classify", correctAnswer: "fait", category: "fait", explanation: "C'est un fait sourcé (OMS), vérifiable dans les rapports officiels." },
          { id: "q9", question: "« Tout le monde sait que les jeux vidéo rendent violent. »", type: "classify", correctAnswer: "opinion", category: "opinion", explanation: "« Tout le monde sait que » est un marqueur trompeur. Les études ne confirment pas ce lien." },
          { id: "q10", question: "« Le Soleil est une étoile. »", type: "classify", correctAnswer: "fait", category: "fait", explanation: "C'est un fait astronomique vérifié." },
        ],
      },
      {
        id: "defi-opinions-deguisees",
        title: "Opinions déguisées",
        description: "Lis cet article et trouve les 3 opinions déguisées en faits !",
        type: "defi",
        defiDescription: `Lis attentivement ce texte et identifie les **3 opinions déguisées en faits** :

---

**« Les jeunes et les écrans : une génération en danger ? »**

Selon une étude de l'INSERM, les adolescents français passent en moyenne 4h30 par jour devant les écrans. *Ce chiffre alarmant prouve que les jeunes sont devenus totalement dépendants.* Les réseaux sociaux les plus utilisés par les 12-17 ans sont TikTok, Instagram et Snapchat. *Il est clair que ces applications sont conçues pour rendre accro.* Le temps passé sur les écrans a augmenté de 30% depuis 2019. *Tout le monde s'accorde à dire que cette génération est la moins cultivée de l'histoire.*

---

**Les 3 opinions déguisées :**
1. « Ce chiffre alarmant prouve que les jeunes sont devenus totalement dépendants. » → « Totalement dépendants » est un jugement excessif.
2. « Il est clair que ces applications sont conçues pour rendre accro. » → « Il est clair que » est un marqueur trompeur.
3. « Tout le monde s'accorde à dire que cette génération est la moins cultivée de l'histoire. » → Opinion non fondée.`,
      },
    ],
  },
  {
    id: "les-sources",
    title: "Fiabilité des Sources",
    shortTitle: "Module 2",
    description: "Qui a dit ça ?",
    icon: "📚",
    color: "#10B981",
    colorLight: "#D1FAE5",
    badgeId: "chasseur-de-sources",
    badgeName: "Chasseur de sources",
    badgeIcon: "📡",
    fiches: [
      {
        id: "quest-ce-quune-source",
        title: "Qu'est-ce qu'une source ?",
        content: `<h2>Les types de sources</h2>
<p>Une <strong>source</strong>, c'est l'origine d'une information. D'où vient ce que tu lis ?</p>
<div class="info-card blue">
<h3>🥇 Source primaire</h3>
<p>Le document ou la personne qui a produit l'information en premier.</p>
<ul><li>Un rapport scientifique original</li><li>Le témoignage direct d'un témoin</li><li>Les données brutes d'une étude</li></ul>
</div>
<div class="info-card orange">
<h3>🥈 Source secondaire</h3>
<p>Analyse, commente ou résume une source primaire.</p>
<ul><li>Un article de journal qui rapporte une étude</li><li>Un livre d'histoire qui analyse des documents d'époque</li></ul>
</div>
<div class="info-card purple">
<h3>🥉 Source tertiaire</h3>
<p>Compile et organise des sources secondaires.</p>
<ul><li>Wikipédia</li><li>Une encyclopédie</li><li>Un manuel scolaire</li></ul>
</div>
<div class="info-card green">
<p>💡 <strong>Règle d'or :</strong> Plus tu te rapproches de la source primaire, plus l'info est fiable.</p>
</div>`,
      },
      {
        id: "evaluer-une-source",
        title: "Comment évaluer une source ?",
        content: `<h2>Les 5 critères : ADOPC</h2>
<p>Avant de croire une information, passe-la au crible !</p>
<div class="info-card blue">
<h3>1. 👤 Auteur</h3>
<p>Qui a écrit ? Est-ce un expert ? A-t-il des raisons d'être partial ?</p>
</div>
<div class="info-card green">
<h3>2. 📅 Date</h3>
<p>C'est récent ou ancien ? L'info est-elle encore valable aujourd'hui ?</p>
</div>
<div class="info-card orange">
<h3>3. 🎯 Objectif</h3>
<p>Pourquoi c'est publié ? Pour informer ? Convaincre ? Vendre ?</p>
</div>
<div class="info-card red">
<h3>4. 📊 Preuves</h3>
<p>Y a-t-il des chiffres, des études, des références citées ?</p>
</div>
<div class="info-card purple">
<h3>5. ✅ Corroboration</h3>
<p>D'autres sources fiables disent-elles la même chose ?</p>
</div>
<div class="info-card green">
<p>💡 <strong>Mémo :</strong> ADOPC — Auteur, Date, Objectif, Preuves, Corroboration !</p>
</div>`,
      },
      {
        id: "hierarchie-sources",
        title: "La hiérarchie des sources",
        content: `<h2>Toutes les sources ne se valent pas</h2>
<div class="info-card green">
<h3>🟢 Très fiable</h3>
<ul><li>Publications scientifiques peer-reviewed</li><li>Rapports OMS, ONU, INSEE</li><li>Données officielles d'État</li></ul>
</div>
<div class="info-card orange">
<h3>🟡 Fiable avec réserves</h3>
<ul><li>Grands médias (Le Monde, France Info, BBC)</li><li>Wikipédia (vérifier les sources citées)</li><li>Documentaires et livres d'experts</li></ul>
</div>
<div class="info-card red">
<h3>🟠 À vérifier</h3>
<ul><li>Blogs et sites personnels</li><li>Vidéos YouTube / TikTok</li><li>Articles sans auteur identifié</li></ul>
</div>
<div class="info-card red">
<h3>🔴 Peu fiable</h3>
<ul><li>Posts réseaux sociaux sans source</li><li>Messages WhatsApp transférés</li><li>Sites avec noms trompeurs</li></ul>
</div>
<div class="info-card blue">
<p>💡 <strong>Le cas Wikipédia :</strong> Le vrai trésor, ce sont les <strong>références en bas de page</strong> !</p>
</div>`,
      },
      {
        id: "sources-internet",
        title: "Les sources sur Internet",
        content: `<h2>Naviguer dans la jungle du web</h2>
<div class="info-card blue">
<h3>📰 Site de presse</h3>
<p>lemonde.fr, franceinfo.fr — Journalistes pro, charte éthique.</p>
<p>⚠️ Peut avoir une ligne éditoriale.</p>
</div>
<div class="info-card green">
<h3>🏛️ Site institutionnel</h3>
<p>education.gouv.fr, who.int — Données officielles, souvent très fiables.</p>
<p>⚠️ Peut présenter les choses sous un angle favorable.</p>
</div>
<div class="info-card orange">
<h3>✍️ Blog / site personnel</h3>
<p>Point de vue d'une personne, pas de vérification externe.</p>
<p>⚠️ Toujours vérifier qui écrit et ses qualifications.</p>
</div>
<div class="info-card red">
<h3>📱 Réseau social</h3>
<p>TikTok, Instagram, X — N'importe qui peut publier n'importe quoi.</p>
<p>⚠️ TOUJOURS vérifier avec d'autres sources.</p>
</div>
<div class="info-card green">
<p>💡 <strong>Réflexe :</strong> Regarde l'URL ! Un site en .gouv.fr est officiel. Un site avec un nom bizarre doit activer ton radar.</p>
</div>`,
      },
    ],
    activites: [
      {
        id: "classement-sources",
        title: "Classe les sources",
        description: "Classe ces sources de la plus fiable à la moins fiable !",
        type: "classement",
        items: [
          { id: "s1", label: "Rapport officiel de l'OMS", correctRank: 1 },
          { id: "s2", label: "Article du journal Le Monde", correctRank: 2 },
          { id: "s3", label: "Page Wikipédia sur le sujet", correctRank: 3 },
          { id: "s4", label: "Vidéo YouTube d'un passionné", correctRank: 4 },
          { id: "s5", label: "Post Instagram sans source", correctRank: 5 },
          { id: "s6", label: "Message WhatsApp transféré 10 fois", correctRank: 6 },
        ],
      },
      {
        id: "defi-verification",
        title: "Remonte à la source !",
        description: "Une info virale circule. Ton défi : remonter à la source originale.",
        type: "defi",
        defiDescription: `**L'affirmation virale :**
« Une étude prouve que les gens qui boivent du café vivent 10 ans de plus ! ☕ »

**Étapes à suivre :**
1. **Cherche l'étude originale** — Qui l'a faite ? Quelle université ?
2. **Vérifie les chiffres** — Est-ce vraiment « 10 ans de plus » ?
3. **Regarde la méthode** — Combien de personnes ? Combien de temps ?
4. **Cherche d'autres sources** — Les médias fiables en parlent-ils ?

**La vérité :**
Plusieurs études montrent une légère corrélation entre café et longévité, mais :
- L'effet est de quelques mois, PAS 10 ans
- Corrélation ≠ causalité
- Le message viral a grossièrement exagéré

**Leçon :** Quand un chiffre semble trop beau, remonte toujours à l'étude originale !`,
      },
    ],
  },
  {
    id: "biais-cognitifs",
    title: "Biais Cognitifs",
    shortTitle: "Module 3",
    description: "Pièges du cerveau ?",
    icon: "🧠",
    color: "#F59E0B",
    colorLight: "#FEF3C7",
    badgeId: "chasseur-de-biais",
    badgeName: "Chasseur de biais",
    badgeIcon: "🧩",
    fiches: [
      {
        id: "quest-ce-quun-biais",
        title: "Qu'est-ce qu'un biais cognitif ?",
        content: `<h2>Ton cerveau te joue des tours !</h2>
<p>Un <strong>biais cognitif</strong>, c'est un raccourci que ton cerveau prend pour traiter l'info plus vite. Le problème ? Ces raccourcis peuvent te faire <strong>tirer de mauvaises conclusions</strong>.</p>
<p>Ce n'est pas un défaut d'intelligence — tout le monde en a !</p>
<div class="info-card orange">
<h3>Pourquoi les biais existent ?</h3>
<ul>
<li>Notre cerveau reçoit des <strong>millions d'informations</strong> chaque seconde</li>
<li>Pour ne pas surcharger, il prend des <strong>raccourcis</strong></li>
<li>Parfois utiles (réagir vite face au danger), parfois trompeurs</li>
</ul>
</div>
<div class="info-card blue">
<h3>Exemple du quotidien</h3>
<p>Tu vois un titre : « Les ados passent trop de temps sur leur téléphone ». Tu penses : « C'est vrai, tout le monde autour de moi est sur son tel. »</p>
<p>→ C'est le <strong>biais de disponibilité</strong> : tu juges un phénomène courant parce que des exemples te viennent facilement en tête.</p>
</div>
<div class="info-card green">
<p>💡 <strong>Bonne nouvelle :</strong> Connaître les biais, c'est déjà les combattre !</p>
</div>`,
      },
      {
        id: "biais-de-confirmation",
        title: "Le biais de confirmation",
        content: `<h2>On croit ce qu'on veut croire</h2>
<p>Le <strong>biais de confirmation</strong> est le plus puissant. C'est la tendance à chercher les infos qui <strong>confirment ce qu'on pense déjà</strong>.</p>
<div class="info-card red">
<h3>Comment ça marche ?</h3>
<ul>
<li>Tu as une opinion → Tu remarques surtout les infos qui vont dans ton sens</li>
<li>Tu ignores les infos qui contredisent ton opinion</li>
<li>Résultat : tu es de plus en plus convaincu d'avoir raison</li>
</ul>
</div>
<div class="info-card orange">
<h3>Exemple concret</h3>
<p>Tu penses que « les chats sont plus intelligents que les chiens ».</p>
<ul>
<li>✅ Tu partages la vidéo d'un chat qui ouvre une porte</li>
<li>❌ Tu ignores l'article sur un chien sauveteur</li>
</ul>
</div>
<div class="info-card purple">
<h3>Sur les réseaux sociaux</h3>
<p>Les algorithmes amplifient le biais de confirmation ! Ils te montrent du contenu similaire à ce que tu aimes déjà → <strong>bulle de filtre</strong>.</p>
</div>
<div class="info-card green">
<p>💡 <strong>Comment lutter :</strong> Cherche ACTIVEMENT des arguments contraires. C'est le signe que tu penses de manière critique !</p>
</div>`,
      },
      {
        id: "effet-de-halo",
        title: "L'effet de halo",
        content: `<h2>Si c'est une star, ça doit être vrai ?</h2>
<p>L'<strong>effet de halo</strong>, c'est quand on accorde plus de crédibilité à quelqu'un à cause de sa popularité, même si ce n'est pas un expert du sujet.</p>
<div class="info-card orange">
<h3>Exemples</h3>
<ul>
<li>Un footballeur qui recommande un régime → Est-il nutritionniste ?</li>
<li>Un influenceur dit « faites-moi confiance » → A-t-il testé sérieusement ?</li>
<li>Un acteur donne son avis politique → Est-il politologue ?</li>
</ul>
</div>
<div class="info-card blue">
<h3>En publicité</h3>
<p>C'est pour ça que les marques utilisent des célébrités ! Quand ton influenceur préféré recommande un produit, ton cerveau pense « ça doit être bien ».</p>
</div>
<div class="info-card green">
<p>💡 <strong>La question magique :</strong> « Est-ce que cette personne est qualifiée pour parler de CE sujet précis ? » Être célèbre ≠ être expert.</p>
</div>`,
      },
      {
        id: "autres-biais",
        title: "D'autres biais à connaître",
        content: `<h2>3 biais bonus</h2>
<div class="info-card blue">
<h3>⚓ Le biais d'ancrage</h3>
<p>La première info qu'on reçoit influence tout le reste.</p>
<p><strong>Exemple :</strong> Prix barré « 200€ » → prix actuel « 49€ ». Tu penses faire une super affaire, même si le produit vaut 30€.</p>
</div>
<div class="info-card red">
<h3>🔥 Le biais de disponibilité</h3>
<p>On surestime ce dont on entend beaucoup parler.</p>
<p><strong>Exemple :</strong> Tu vois des articles sur des attaques de requins → tu penses que c'est fréquent. En réalité, la foudre est plus dangereuse !</p>
</div>
<div class="info-card purple">
<h3>👥 L'effet de groupe</h3>
<p>On pense comme la majorité, même si on n'est pas d'accord.</p>
<p><strong>Exemple :</strong> Tout le monde dit qu'un film est génial. Même si tu l'as trouvé moyen, tu hésites à le dire.</p>
</div>
<div class="info-card green">
<p>💡 <strong>L'astuce :</strong> Quand « tout le monde pense pareil », demande-toi : est-ce que JE pense vraiment ça ?</p>
</div>`,
      },
    ],
    activites: [
      {
        id: "quiz-biais",
        title: "Piégé par ton cerveau !",
        description: "Quiz avec pièges volontaires pour expérimenter les biais !",
        type: "quiz",
        questions: [
          { id: "b1", question: "Un YouTubeur avec 10 millions d'abonnés dit que la Terre est plate. Beaucoup le croient. Quel biais ?", options: ["Biais de confirmation", "Effet de halo", "Biais d'ancrage", "Biais de disponibilité"], type: "choice", correctAnswer: 1, explanation: "C'est l'effet de halo ! On fait confiance parce qu'il est populaire, pas parce qu'il est scientifique." },
          { id: "b2", question: "Tu es convaincu que les chiens sont dangereux. Tu partages un article sur une morsure mais ignores un article sur les chiens de thérapie. Quel biais ?", options: ["Biais de confirmation", "Effet de halo", "Effet de groupe", "Biais d'ancrage"], type: "choice", correctAnswer: 0, explanation: "Biais de confirmation ! Tu retiens ce qui confirme ton opinion." },
          { id: "b3", question: "Une pub annonce : « Prix normal 150€, AUJOURD'HUI 39€ ! » Tu penses que c'est une super affaire. Quel biais ?", options: ["Biais de disponibilité", "Effet de groupe", "Biais d'ancrage", "Biais de confirmation"], type: "choice", correctAnswer: 2, explanation: "Biais d'ancrage ! Le « 150€ » sert d'ancre pour te faire croire que 39€ est une bonne affaire." },
          { id: "b4", question: "Après 5 vidéos sur des accidents d'avion, tu as peur de prendre l'avion. Pourtant c'est le transport le plus sûr. Quel biais ?", options: ["Biais de confirmation", "Biais de disponibilité", "Effet de halo", "Effet de groupe"], type: "choice", correctAnswer: 1, explanation: "Biais de disponibilité ! Les images d'accidents te viennent facilement en tête." },
          { id: "b5", question: "Toute ta classe dit que le contrôle était facile. Toi tu l'as trouvé difficile, mais tu n'oses pas le dire. Quel biais ?", options: ["Biais d'ancrage", "Biais de confirmation", "Biais de disponibilité", "Effet de groupe"], type: "choice", correctAnswer: 3, explanation: "Effet de groupe ! La pression du groupe te fait douter de ta propre expérience." },
        ],
      },
      {
        id: "defi-biais-pub",
        title: "Biais dans la pub",
        description: "Identifie les biais cognitifs dans ces situations réelles !",
        type: "defi",
        defiDescription: `**Situation 1 :**
Léna Situations dit : « J'adore cette marque, c'est la meilleure qualité ! »
→ **Effet de halo** — on fait confiance à son jugement parce qu'on l'aime bien.

**Situation 2 :**
Un site affiche : « 🔥 Plus que 2 en stock ! Prix barré 89€ → 24,99€ ! 327 personnes regardent ! »
→ **Biais d'ancrage** (89€ → 24,99€) + **Effet de groupe** (327 personnes) + **Biais de rareté** (plus que 2)

**Situation 3 :**
TikTok, 2M vues : « Les profs ne veulent pas que vous sachiez ça... » Commentaires : « tellement vrai ! »
→ **Effet de groupe** + **Biais de disponibilité** + titre conspirationniste

**À ton tour !** Trouve une pub ou post et identifie les biais !`,
      },
    ],
  },
  {
    id: "desinformation",
    title: "Fake News",
    shortTitle: "Module 4",
    description: "Repère les mensonges !",
    icon: "🛡️",
    color: "#EF4444",
    colorLight: "#FEE2E2",
    badgeId: "bouclier-anti-fake",
    badgeName: "Bouclier anti-fake",
    badgeIcon: "🛡️",
    fiches: [
      {
        id: "quest-ce-que-la-desinfo",
        title: "Qu'est-ce que la désinformation ?",
        content: `<h2>Trois mots à ne pas confondre</h2>
<div class="info-card orange">
<h3>😵 Mésinformation</h3>
<p>Info <strong>fausse</strong> partagée <strong>sans mauvaise intention</strong>.</p>
<p>Ex : Ta tante partage sur WhatsApp que « boire de l'eau chaude guérit le rhume ». Elle y croit, mais c'est faux.</p>
</div>
<div class="info-card red">
<h3>😈 Désinformation</h3>
<p>Info <strong>fausse</strong> créée <strong>volontairement</strong> pour tromper.</p>
<p>Ex : Un site publie un faux article sur un vaccin contenant des micropuces, sachant que c'est faux.</p>
</div>
<div class="info-card purple">
<h3>🎯 Malinformation</h3>
<p>Info <strong>vraie</strong> utilisée <strong>hors contexte</strong> pour manipuler.</p>
<p>Ex : Publier une vieille photo d'inondation en disant que c'est arrivé hier.</p>
</div>
<div class="info-card blue">
<p>💡 <strong>Résumé :</strong> Mésinformation = faux + pas exprès · Désinformation = faux + fait exprès · Malinformation = vrai + sorti du contexte</p>
</div>`,
      },
      {
        id: "techniques-manipulation",
        title: "Techniques de manipulation",
        content: `<h2>Comment on essaie de te manipuler</h2>
<div class="info-card red">
<h3>📰 Titres pièges (clickbait)</h3>
<ul>
<li>« INCROYABLE : Ce que les médecins vous cachent ! »</li>
<li>« Tu ne vas JAMAIS croire ce qui s'est passé ! »</li>
<li>« SCANDALE : La vérité qu'ON ne veut pas que tu saches »</li>
</ul>
<p>→ Titre très émotionnel et vague = méfiance.</p>
</div>
<div class="info-card orange">
<h3>📸 Images hors contexte</h3>
<ul>
<li>Photo de manifestation d'un pays utilisée pour un autre pays</li>
<li>Photo ancienne présentée comme récente</li>
<li>Photo recadrée pour cacher le contexte</li>
</ul>
<p>→ Utilise la recherche d'image inversée pour vérifier !</p>
</div>
<div class="info-card purple">
<h3>👔 Faux experts</h3>
<ul>
<li>« Le Dr Martin affirme que... » → Spécialiste du sujet ?</li>
<li>« Un professeur de Harvard dit que... » → Professeur en quoi ?</li>
</ul>
</div>
<div class="info-card green">
<p>💡 <strong>Règle d'or :</strong> Plus un contenu joue sur tes émotions, plus tu dois activer ton esprit critique.</p>
</div>`,
      },
      {
        id: "bulles-de-filtre",
        title: "Bulles de filtre",
        content: `<h2>Pourquoi ton fil te montre toujours la même chose</h2>
<div class="info-card blue">
<h3>🫧 La bulle de filtre</h3>
<p>Les algorithmes analysent ce que tu regardes et te montrent du contenu similaire. Tu ne vois que des infos qui correspondent à tes goûts et opinions.</p>
<ul>
<li>Tu aimes des vidéos de foot → tu ne vois plus que du foot</li>
<li>Tu cliques sur un article complotiste → l'algo t'en propose d'autres</li>
</ul>
</div>
<div class="info-card orange">
<h3>🔊 La chambre d'écho</h3>
<p>Un groupe où tout le monde pense pareil. Chaque opinion est amplifiée et renforcée.</p>
<ul>
<li>Groupe WhatsApp partisan</li>
<li>Fil Twitter unilatéral</li>
</ul>
</div>
<div class="info-card green">
<h3>💡 Comment en sortir ?</h3>
<ul>
<li>Suis des comptes avec des opinions différentes</li>
<li>Cherche activement des points de vue opposés</li>
<li>Utilise le mode incognito pour des recherches neutres</li>
<li>Discute avec des gens qui ne pensent pas comme toi</li>
</ul>
</div>`,
      },
      {
        id: "methode-verification",
        title: "La méthode de vérification",
        content: `<h2>Check-list en 5 étapes</h2>
<div class="info-card red">
<h3>Étape 1 : 🛑 STOP</h3>
<p>Ne partage pas tout de suite ! Si l'info te fait ressentir une émotion forte, c'est le moment de vérifier.</p>
</div>
<div class="info-card blue">
<h3>Étape 2 : 👤 QUI ?</h3>
<p>Qui a publié ? Média reconnu, blog, compte anonyme ? L'auteur est-il qualifié ?</p>
</div>
<div class="info-card orange">
<h3>Étape 3 : 📅 QUAND ?</h3>
<p>Quand c'est publié ? Vieille info qui ressort ? Le contexte a-t-il changé ?</p>
</div>
<div class="info-card purple">
<h3>Étape 4 : 🔍 VÉRIFICATION CROISÉE</h3>
<p>Tape les mots-clés dans un moteur de recherche. Si aucun média sérieux ne relaie l'info, gros doute !</p>
</div>
<div class="info-card green">
<h3>Étape 5 : 🖼️ VÉRIFIE LES IMAGES</h3>
<p>Clic droit → « Rechercher cette image ». L'image correspond-elle vraiment au contexte ?</p>
</div>
<div class="info-card blue">
<p>💡 <strong>Sites utiles :</strong> AFP Factuel · Les Décodeurs du Monde · HoaxBuster · Google Images</p>
</div>`,
      },
    ],
    activites: [
      {
        id: "quiz-fake-or-real",
        title: "Fake or Real ?",
        description: "Analyse ces titres : vrais ou faux ? Justifie ta réponse !",
        type: "quiz",
        questions: [
          { id: "f1", question: "« URGENT : Un astéroïde géant va frôler la Terre cette nuit ! Les scientifiques sont inquiets ! »", options: ["Crédible", "Faux / Exagéré", "Impossible à dire"], type: "choice", correctAnswer: 1, explanation: "Clickbait ! Les mots « URGENT », « géant », « inquiets » sont des marqueurs émotionnels. Les vrais passages d'astéroïdes sont suivis calmement par la NASA." },
          { id: "f2", question: "« Selon l'INSEE, le taux de chômage en France est de 7.3% au T3 2025. »", options: ["Crédible", "Faux / Exagéré", "Impossible à dire"], type: "choice", correctAnswer: 0, explanation: "Factuel et bien sourcé (INSEE). Chiffre précis avec une période. Titre de média sérieux." },
          { id: "f3", question: "« Ce remède naturel que Big Pharma ne veut pas que vous connaissiez guérit TOUT ! »", options: ["Crédible", "Faux / Exagéré", "Impossible à dire"], type: "choice", correctAnswer: 1, explanation: "Tous les signaux d'alerte : « Big Pharma » (complotisme), « guérit TOUT » (impossible), langage sensationnaliste." },
          { id: "f4", question: "Des dauphins dans les canaux de Venise pendant le confinement. « La nature reprend ses droits ! »", options: ["Crédible", "Faux / Exagéré", "Impossible à dire"], type: "choice", correctAnswer: 1, explanation: "Cas célèbre de malinformation ! La vidéo était réelle mais filmée en Sardaigne, PAS à Venise." },
          { id: "f5", question: "« D'après Cambridge/Nature, l'exercice régulier réduit les risques cardiovasculaires de 30%. »", options: ["Crédible", "Faux / Exagéré", "Impossible à dire"], type: "choice", correctAnswer: 0, explanation: "Source précise, revue scientifique reconnue, chiffre raisonnable. Vérifiable." },
        ],
      },
      {
        id: "defi-deconstruire-fake",
        title: "Déconstruis la fake news",
        description: "Utilise la méthode de vérification en 5 étapes sur une fake news célèbre.",
        type: "defi",
        defiDescription: `**La fake news :** « Les téléphones 5G propagent le coronavirus ! »

**Étape 1 — STOP ⏸️** : Cette info provoque de la peur. Ne partage PAS.

**Étape 2 — QUI ? 👤** : Messages anonymes WhatsApp/Facebook. Pas de source scientifique. 🚩

**Étape 3 — QUAND ? 📅** : Mars-avril 2020, période de peur. La 5G existait avant le Covid (2019 en Corée du Sud).

**Étape 4 — VÉRIFICATION 🔍** : L'OMS dément. Aucune étude ne fait ce lien. Des pays sans 5G ont aussi eu le Covid. 🚩

**Étape 5 — LOGIQUE 🧠** : Un virus est biologique, les ondes sont électromagnétiques. Corrélation temporelle ≠ causalité.

**Conclusion :** Désinformation qui joue sur la peur + méfiance technologique.

**À ton tour !** Choisis une rumeur et applique les 5 étapes !`,
      },
    ],
  },
];

export const allBadges = modules.map((m) => ({
  id: m.badgeId,
  name: m.badgeName,
  icon: m.badgeIcon,
  moduleId: m.id,
  moduleTitle: m.title,
  color: m.color,
}));
