function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
}

export const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration', 'continuous deployment'],
  'mvp': ['minimum viable product', 'm.v.p.'],
  'roi': ['return on investment', 'r.o.i.'],
  'api': ['a.p.i.', 'application programming interface'],
  'devops': ['dev ops', 'dev-ops'],
  'sla': ['service level agreement', 's.l.a.'],
  'a/b test': ['a b test', 'ab test', 'split test'],
  'scrum master': ['scrummaster'],
  'product owner': ['po '],
  'definition of done': ['dod'],
  'user story': ['user stories'],
  'story points': ['story point', 'sp '],
  'pull request': ['pr ', 'pull req'],
  'kubernetes': ['k8s'],
  'infrastructure': ['infra'],
  'authentication': ['auth'],
  'authorization': ['authz'],
};

export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const normalized = normalizeText(transcript);
  const detected: string[] = [];

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue;

    const nw = normalizeText(word);
    const matched = nw.includes(' ')
      ? normalized.includes(nw)
      : new RegExp(`\\b${escapeRegex(nw)}\\b`, 'i').test(normalized);

    if (matched) detected.push(word);
  }

  return detected;
}

export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const detected = detectWords(transcript, cardWords, alreadyFilled);
  const normalized = normalizeText(transcript);

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue;
    if (detected.includes(word)) continue;

    const aliases = WORD_ALIASES[word.toLowerCase()];
    if (!aliases) continue;

    for (const alias of aliases) {
      if (normalized.includes(alias)) {
        detected.push(word);
        break;
      }
    }
  }

  return detected;
}
