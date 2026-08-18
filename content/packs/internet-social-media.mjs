const source = (id, title, publisher, url, isPrimarySource = true) => ({
  id,
  title,
  publisher,
  url,
  isPrimarySource,
});
const RFC_HTTP = source(
  "rfc-http-status-pack",
  "HTTP Semantics — Status Codes",
  "Internet Engineering Task Force",
  "https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes",
);
const IANA_TLD = source(
  "iana-root-zone-pack",
  "Root Zone Database",
  "Internet Assigned Numbers Authority",
  "https://www.iana.org/domains/root/db",
  true,
);
const IANA_DNS = source(
  "iana-dns-parameters-pack",
  "Domain Name System Parameters",
  "Internet Assigned Numbers Authority",
  "https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml",
  true,
);
const IANA_URI = source(
  "iana-uri-schemes-pack",
  "Uniform Resource Identifier Schemes",
  "Internet Assigned Numbers Authority",
  "https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml",
  true,
);
const WIKIMEDIA = source(
  "wikimedia-projects-pack",
  "Our projects",
  "Wikimedia Foundation",
  "https://wikimediafoundation.org/our-work/wikimedia-projects/",
  true,
);
const WIKIPEDIA_LANG = source(
  "wikimedia-language-history-pack",
  "History of Wikipedia",
  "Meta-Wiki",
  "https://meta.wikimedia.org/wiki/History_of_Wikipedia",
  true,
);
const STACK = source(
  "stackexchange-sites-pack",
  "All Sites",
  "Stack Exchange",
  "https://stackexchange.com/sites",
  true,
);
const DATAREPORTAL = source(
  "datareportal-social-history-pack",
  "The history of social media",
  "DataReportal",
  "https://datareportal.com/reports/digital-2024-deep-dive-the-history-of-social-media",
  false,
);
const ICANN = source(
  "icann-new-tlds-2000-pack",
  "New TLD Program — 2000 round",
  "ICANN",
  "https://www.icann.org/resources/pages/tlds-2012-02-25-en",
  true,
);
const RFC_IPV4 = source(
  "iana-ipv4-special-pack",
  "IPv4 Special-Purpose Address Space",
  "Internet Assigned Numbers Authority",
  "https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml",
  true,
);
const RFC_MAIL = source(
  "rfc-mail-headers-pack",
  "Internet Message Format",
  "Internet Engineering Task Force",
  "https://www.rfc-editor.org/rfc/rfc5322.html",
  true,
);
const W3C = source(
  "w3c-web-history-pack",
  "A Little History of the World Wide Web",
  "World Wide Web Consortium",
  "https://www.w3.org/History.html",
  true,
);
const ARPANET = source(
  "internet-society-arpanet-pack",
  "A Brief History of the Internet",
  "Internet Society",
  "https://www.internetsociety.org/internet/history-internet/brief-history-internet/",
  false,
);
const IANA_MEDIA = source(
  "iana-media-types-pack",
  "Media Types",
  "Internet Assigned Numbers Authority",
  "https://www.iana.org/assignments/media-types/media-types.xhtml",
  true,
);
const RFC_DAYS = source(
  "rfc850-weekdays-pack",
  "Standard for Interchange of USENET Messages",
  "Internet Engineering Task Force",
  "https://www.rfc-editor.org/rfc/rfc850.html",
  true,
);

const q = (spec) => ({
  themeId: "internet-social-media",
  qualificationRule:
    spec.qualificationRule ??
    "Sont retenues les neuf entrées correspondant exactement aux bornes explicites de la question.",
  explanation: spec.explanation ?? "La liste est tirée du registre ou de l’historique cité.",
  ...spec,
});

export const questions = [
  q({
    id: "easy-http-200-a-208",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 1,
    shortTitle: "Succès HTTP",
    questionText: "Quels sont les intitulés des neuf codes HTTP de 200 à 208 ?",
    answers: [
      "OK",
      "Created",
      "Accepted",
      "Non-Authoritative Information",
      "No Content",
      "Reset Content",
      "Partial Content",
      "Multi-Status",
      "Already Reported",
    ],
    sources: [RFC_HTTP],
  }),
  q({
    id: "easy-http-400-a-408",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 1,
    shortTitle: "Erreurs HTTP",
    questionText: "Quels sont les intitulés des neuf codes HTTP de 400 à 408 ?",
    answers: [
      "Bad Request",
      "Unauthorized",
      "Payment Required",
      "Forbidden",
      "Not Found",
      "Method Not Allowed",
      "Not Acceptable",
      "Proxy Authentication Required",
      "Request Timeout",
    ],
    sources: [RFC_HTTP],
  }),
  q({
    id: "easy-neuf-projets-wikimedia",
    subthemeId: "internet-social-media:online-communities",
    difficultyLevel: 1,
    shortTitle: "Projets Wikimedia",
    questionText:
      "Quels sont ces neuf grands projets collaboratifs de contenu de Wikimedia, de Wikipédia à Wikiversité ?",
    answers: [
      "Wikipédia",
      "Wiktionnaire",
      "Wikiquote",
      "Wikilivres",
      "Wikisource",
      "Wikimedia Commons",
      "Wikinews",
      "Wikiversité",
      "Wikivoyage",
    ],
    sources: [WIKIMEDIA],
    qualificationRule:
      "Sont retenus les neuf projets de contenu explicitement nommés, sans Meta-Wiki ni les projets techniques.",
  }),
  q({
    id: "easy-neuf-reseaux-2003-2011",
    subthemeId: "internet-social-media:social-networks",
    difficultyLevel: 1,
    shortTitle: "Réseaux emblématiques",
    questionText:
      "Quels sont ces neuf services sociaux lancés entre 2003 et 2011 : un par entrée de la sélection historique ?",
    answers: [
      "LinkedIn",
      "Facebook",
      "YouTube",
      "Twitter",
      "Tumblr",
      "WhatsApp",
      "Instagram",
      "Pinterest",
      "Snapchat",
    ],
    sources: [DATAREPORTAL],
    qualificationRule:
      "Sont retenues les neuf plateformes nommées dans la sélection, toutes lancées entre 2003 et 2011.",
  }),
  q({
    id: "easy-neuf-sites-stackexchange",
    subthemeId: "internet-social-media:online-communities",
    difficultyLevel: 1,
    shortTitle: "Communautés Stack Exchange",
    questionText:
      "Quels sont ces neuf sites historiques du réseau Stack Exchange consacrés à la programmation, aux systèmes ou aux loisirs ?",
    answers: [
      "Stack Overflow",
      "Server Fault",
      "Super User",
      "Ask Ubuntu",
      "Web Applications",
      "Arqade",
      "Webmasters",
      "Seasoned Advice",
      "Game Development",
    ],
    sources: [STACK],
    qualificationRule:
      "Sont retenus les neuf sites explicitement cadrés par la question et présents dans l’annuaire Stack Exchange.",
  }),
  q({
    id: "easy-neuf-tld-classiques",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 1,
    shortTitle: "Domaines classiques",
    questionText:
      "Quels sont ces neuf domaines de premier niveau historiques ou précoces : .com, .org et sept autres de la sélection ?",
    answers: [".com", ".org", ".net", ".edu", ".gov", ".mil", ".int", ".arpa", ".info"],
    sources: [IANA_TLD],
    qualificationRule:
      "Sont retenues les neuf chaînes de la sélection explicite, toutes présentes dans la base racine de l’IANA.",
  }),
  q({
    id: "easy-neuf-schemas-uri",
    subthemeId: "internet-social-media:platforms",
    difficultyLevel: 1,
    shortTitle: "Adresses du web",
    questionText: "Quels sont ces neuf schémas d’URI très répandus enregistrés par l’IANA ?",
    answers: ["http", "https", "ftp", "mailto", "file", "data", "tel", "sms", "irc"],
    sources: [IANA_URI],
    qualificationRule:
      "Sont retenus les neuf schémas nommés dans la question et enregistrés par l’IANA.",
  }),

  q({
    id: "medium-http-300-a-308",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 2,
    shortTitle: "Redirections HTTP",
    questionText: "Quels sont les intitulés des neuf codes HTTP de 300 à 308 ?",
    answers: [
      "Multiple Choices",
      "Moved Permanently",
      "Found",
      "See Other",
      "Not Modified",
      "Use Proxy",
      "Switch Proxy",
      "Temporary Redirect",
      "Permanent Redirect",
    ],
    sources: [RFC_HTTP],
    exclusionNotes: "Le code 306 est réservé et son ancien intitulé Switch Proxy est demandé ici.",
  }),
  q({
    id: "medium-neuf-tld-sponsorises",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 2,
    shortTitle: "Domaines sponsorisés",
    questionText: "Quels sont ces neuf domaines de premier niveau sponsorisés du registre IANA ?",
    answers: [".aero", ".asia", ".cat", ".coop", ".edu", ".gov", ".int", ".mil", ".museum"],
    sources: [IANA_TLD],
    qualificationRule:
      "Sont retenus les neuf domaines sponsorisés explicitement sélectionnés et documentés dans la base racine.",
  }),
  q({
    id: "medium-neuf-types-dns",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 2,
    shortTitle: "Enregistrements DNS",
    questionText:
      "Quels sont les neuf types d’enregistrements DNS associés aux codes 1, 2, 5, 6, 12, 15, 16, 28 et 33 ?",
    answers: ["A", "NS", "CNAME", "SOA", "PTR", "MX", "TXT", "AAAA", "SRV"],
    sources: [IANA_DNS],
    qualificationRule:
      "Sont retenus les mnémoniques IANA correspondant aux neuf codes numériques indiqués.",
  }),
  q({
    id: "medium-neuf-blocs-ipv4-speciaux",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 2,
    shortTitle: "IPv4 spéciale",
    questionText: "Quels sont ces neuf blocs IPv4 à usage spécial enregistrés par l’IANA ?",
    answers: [
      "0.0.0.0/8",
      "10.0.0.0/8",
      "100.64.0.0/10",
      "127.0.0.0/8",
      "169.254.0.0/16",
      "172.16.0.0/12",
      "192.0.0.0/24",
      "192.168.0.0/16",
      "224.0.0.0/4",
    ],
    sources: [RFC_IPV4],
    qualificationRule:
      "Sont retenus les neuf préfixes explicitement sélectionnés dans le registre des adresses spéciales.",
  }),
  q({
    id: "medium-neuf-champs-email",
    subthemeId: "internet-social-media:platforms",
    difficultyLevel: 2,
    shortTitle: "En-têtes de courriel",
    questionText: "Quels sont ces neuf champs d’en-tête standard d’un courriel Internet ?",
    answers: ["Date", "From", "Sender", "Reply-To", "To", "Cc", "Bcc", "Message-ID", "Subject"],
    sources: [RFC_MAIL],
  }),
  q({
    id: "medium-neuf-langues-wikipedia",
    subthemeId: "internet-social-media:online-communities",
    difficultyLevel: 2,
    shortTitle: "Premières Wikipédia",
    questionText:
      "Dans quelles neuf langues les premières éditions de Wikipédia ont-elles été lancées en 2001 dans cette sélection historique ?",
    answers: [
      "Anglais",
      "Allemand",
      "Catalan",
      "Espagnol",
      "Français",
      "Italien",
      "Japonais",
      "Portugais",
      "Russe",
    ],
    sources: [WIKIPEDIA_LANG],
    qualificationRule:
      "Sont retenues les neuf éditions linguistiques nommées dans la sélection historique de 2001.",
  }),
  q({
    id: "medium-neuf-tld-2000-2001",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 2,
    shortTitle: "Extension du DNS",
    questionText:
      "Quels sont les sept nouveaux TLD approuvés par l’ICANN en 2000, auxquels s’ajoutent .com et .org dans cette sélection de neuf ?",
    answers: [".aero", ".biz", ".coop", ".info", ".museum", ".name", ".pro", ".com", ".org"],
    sources: [ICANN],
    qualificationRule:
      "Sont retenus les sept TLD du cycle ICANN 2000 et les deux TLD classiques explicitement ajoutés par la question.",
  }),

  q({
    id: "hard-http-500-a-508",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 3,
    shortTitle: "Erreurs serveur HTTP",
    questionText: "Quels sont les intitulés des neuf codes HTTP de 500 à 508 ?",
    answers: [
      "Internal Server Error",
      "Not Implemented",
      "Bad Gateway",
      "Service Unavailable",
      "Gateway Timeout",
      "HTTP Version Not Supported",
      "Variant Also Negotiates",
      "Insufficient Storage",
      "Loop Detected",
    ],
    sources: [RFC_HTTP],
  }),
  q({
    id: "hard-neuf-types-media-iana",
    subthemeId: "internet-social-media:platforms",
    difficultyLevel: 3,
    shortTitle: "Types MIME",
    questionText:
      "Quels sont les neuf types de médias de premier niveau de cette sélection IANA, d’application à video ?",
    answers: [
      "application",
      "audio",
      "font",
      "image",
      "message",
      "model",
      "multipart",
      "text",
      "video",
    ],
    sources: [IANA_MEDIA],
    qualificationRule:
      "Sont retenues les neuf catégories de premier niveau explicitement listées, hors catégories provisoires.",
  }),
  q({
    id: "hard-neuf-schemas-uri-a",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 3,
    shortTitle: "Registre URI",
    questionText:
      "Quels sont ces neuf schémas d’URI commençant par la lettre A dans le registre IANA, de aaa à afp ?",
    answers: ["aaa", "aaas", "about", "acap", "acct", "acd", "acr", "adiumxtra", "afp"],
    sources: [IANA_URI],
    qualificationRule:
      "Sont retenues les neuf entrées explicitement bornées de aaa à afp dans la sélection alphabétique.",
  }),
  q({
    id: "hard-neuf-jalons-web",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 3,
    shortTitle: "Jalons du Web",
    questionText:
      "Quels sont ces neuf jalons ou technologies cités dans la chronologie historique du Web du W3C ?",
    answers: [
      "Enquire",
      "WorldWideWeb",
      "CERN httpd",
      "HTML",
      "HTTP",
      "ViolaWWW",
      "Mosaic",
      "W3C",
      "CSS",
    ],
    sources: [W3C],
    qualificationRule:
      "Sont retenus les neuf noms explicitement sélectionnés dans la chronologie du W3C.",
  }),
  q({
    id: "hard-neuf-sites-arpanet",
    subthemeId: "internet-social-media:web-history",
    difficultyLevel: 3,
    shortTitle: "ARPANET pionnier",
    questionText:
      "Quels sont ces neuf centres universitaires ou de recherche raccordés parmi les premiers à ARPANET ?",
    answers: [
      "UCLA",
      "SRI",
      "UC Santa Barbara",
      "University of Utah",
      "BBN",
      "MIT",
      "RAND",
      "System Development Corporation",
      "Harvard",
    ],
    sources: [ARPANET],
    qualificationRule:
      "Sont retenus les neuf sites pionniers explicitement nommés dans la sélection historique.",
  }),
  q({
    id: "hard-neuf-entetes-usenet-rfc850",
    subthemeId: "internet-social-media:online-communities",
    difficultyLevel: 3,
    shortTitle: "Usenet historique",
    questionText:
      "Quels sont ces neuf champs d’en-tête définis pour les messages Usenet par la RFC 850 ?",
    answers: [
      "Relay-Version",
      "Posting-Version",
      "From",
      "Date",
      "Newsgroups",
      "Subject",
      "Message-ID",
      "Path",
      "Organization",
    ],
    sources: [RFC_DAYS],
    qualificationRule:
      "Sont retenus les neuf champs obligatoires ou courants explicitement sélectionnés dans la RFC 850.",
  }),
];
