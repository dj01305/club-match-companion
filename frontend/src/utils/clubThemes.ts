export interface ClubTheme {
  primary: string;   // main accent color
  secondary: string; // used for gradients / secondary accents
  name: string;      // canonical display name
}

interface ClubEntry {
  theme: ClubTheme;
  aliases: string[]; // all recognised names / nicknames (lowercase)
}

const clubs: ClubEntry[] = [
  // ── Premier League ──────────────────────────────────────────────
  {
    theme: { primary: '#EF0107', secondary: '#9C0000', name: 'Arsenal' },
    aliases: ['arsenal', 'the gunners', 'gunners', 'afc', 'arsenal fc'],
  },
  {
    theme: { primary: '#6CABDD', secondary: '#1C3F6E', name: 'Manchester City' },
    aliases: ['manchester city', 'man city', 'man c', 'mcfc', 'city', 'the citizens', 'citizens'],
  },
  {
    theme: { primary: '#DA291C', secondary: '#FBE122', name: 'Manchester United' },
    aliases: ['manchester united', 'man united', 'man utd', 'mufc', 'united', 'the red devils', 'red devils'],
  },
  {
    theme: { primary: '#C8102E', secondary: '#00B2A9', name: 'Liverpool' },
    aliases: ['liverpool', 'liverpool fc', 'lfc', 'the reds', 'pool', 'the kop'],
  },
  {
    theme: { primary: '#034694', secondary: '#DBA111', name: 'Chelsea' },
    aliases: ['chelsea', 'chelsea fc', 'cfc', 'the blues', 'the pensioners'],
  },
  {
    theme: { primary: '#132257', secondary: '#FFFFFF', name: 'Tottenham Hotspur' },
    aliases: ['tottenham', 'tottenham hotspur', 'spurs', 'thfc', 'the lilywhites', 'lilywhites'],
  },
  {
    theme: { primary: '#670E36', secondary: '#99D6EA', name: 'Aston Villa' },
    aliases: ['aston villa', 'villa', 'avfc', 'the villans', 'villans'],
  },
  {
    theme: { primary: '#D71920', secondary: '#001C58', name: 'Everton' },
    aliases: ['everton', 'everton fc', 'efc', 'the toffees', 'toffees'],
  },
  {
    theme: { primary: '#FDB913', secondary: '#231F20', name: 'Wolverhampton Wanderers' },
    aliases: ['wolverhampton', 'wolves', 'wolverhampton wanderers', 'wwfc', 'the wolves'],
  },
  {
    theme: { primary: '#E30613', secondary: '#FFFFFF', name: 'Nottingham Forest' },
    aliases: ['nottingham forest', 'forest', 'nffc', 'the reds', 'notts forest'],
  },
  {
    theme: { primary: '#0057B8', secondary: '#FFD700', name: 'Newcastle United' },
    aliases: ['newcastle', 'newcastle united', 'nufc', 'the magpies', 'magpies', 'toon', 'the toon'],
  },
  {
    theme: { primary: '#E62333', secondary: '#FFFFFF', name: 'West Ham United' },
    aliases: ['west ham', 'west ham united', 'whufc', 'the hammers', 'hammers', 'irons'],
  },
  {
    theme: { primary: '#FFA500', secondary: '#0C1B33', name: 'Fulham' },
    aliases: ['fulham', 'fulham fc', 'ffc', 'the cottagers', 'cottagers'],
  },
  {
    theme: { primary: '#1B458F', secondary: '#A7A5A6', name: 'Brighton & Hove Albion' },
    aliases: ['brighton', 'brighton & hove albion', 'brighton and hove albion', 'bhafc', 'the seagulls', 'seagulls'],
  },
  {
    theme: { primary: '#E03A3E', secondary: '#FFFFFF', name: 'Brentford' },
    aliases: ['brentford', 'brentford fc', 'bfc', 'the bees', 'bees'],
  },
  {
    theme: { primary: '#241F20', secondary: '#E62333', name: 'Bournemouth' },
    aliases: ['bournemouth', 'afc bournemouth', 'afcb', 'the cherries', 'cherries'],
  },
  {
    theme: { primary: '#FBEE23', secondary: '#1A1A1A', name: 'Watford' },
    aliases: ['watford', 'watford fc', 'wfc', 'the hornets', 'hornets'],
  },
  {
    theme: { primary: '#005BAC', secondary: '#FFFFFF', name: 'Crystal Palace' },
    aliases: ['crystal palace', 'palace', 'cpfc', 'the eagles', 'eagles'],
  },
  {
    theme: { primary: '#FFCD00', secondary: '#1C4F9C', name: 'Leeds United' },
    aliases: ['leeds', 'leeds united', 'lufc', 'the whites', 'whites', 'marching on together'],
  },
  {
    theme: { primary: '#EF3340', secondary: '#FFFFFF', name: 'Southampton' },
    aliases: ['southampton', 'saints', 'soton', 'the saints', 'scfc'],
  },
  {
    theme: { primary: '#7A263A', secondary: '#FCB514', name: 'Burnley' },
    aliases: ['burnley', 'burnley fc', 'bfc', 'the clarets', 'clarets'],
  },
  {
    theme: { primary: '#003090', secondary: '#FFFFFF', name: 'Leicester City' },
    aliases: ['leicester', 'leicester city', 'lcfc', 'the foxes', 'foxes'],
  },
  {
    theme: { primary: '#FFBE00', secondary: '#1A1A1A', name: 'Norwich City' },
    aliases: ['norwich', 'norwich city', 'ncfc', 'the canaries', 'canaries'],
  },
  {
    theme: { primary: '#EE2737', secondary: '#FFFFFF', name: 'Sheffield United' },
    aliases: ['sheffield united', 'sheff utd', 'sufc', 'the blades', 'blades'],
  },
  {
    theme: { primary: '#003399', secondary: '#FFFFFF', name: 'Ipswich Town' },
    aliases: ['ipswich', 'ipswich town', 'itfc', 'the tractor boys', 'tractor boys', 'blues'],
  },

  // ── La Liga ─────────────────────────────────────────────────────
  {
    theme: { primary: '#FEBE10', secondary: '#00529F', name: 'Real Madrid' },
    aliases: ['real madrid', 'madrid', 'rmcf', 'los blancos', 'the whites', 'los merengues', 'merengues'],
  },
  {
    theme: { primary: '#A50044', secondary: '#004D98', name: 'Barcelona' },
    aliases: ['barcelona', 'barca', 'fcb', 'fc barcelona', 'blaugrana', 'the blaugrana'],
  },
  {
    theme: { primary: '#CE3524', secondary: '#FFFFFF', name: 'Atletico Madrid' },
    aliases: ['atletico madrid', 'atletico', 'atleti', 'atm', 'los rojiblancos', 'rojiblancos', 'colchoneros'],
  },
  {
    theme: { primary: '#CF142B', secondary: '#FFFFFF', name: 'Sevilla' },
    aliases: ['sevilla', 'sevilla fc', 'sfc', 'los nervionenses'],
  },
  {
    theme: { primary: '#1D4F91', secondary: '#FFFFFF', name: 'Real Sociedad' },
    aliases: ['real sociedad', 'la real', 'rsssb'],
  },
  {
    theme: { primary: '#FF6B00', secondary: '#000000', name: 'Valencia' },
    aliases: ['valencia', 'valencia cf', 'vcf', 'los che', 'che', 'los murciélagos'],
  },
  {
    theme: { primary: '#007A33', secondary: '#FFFFFF', name: 'Real Betis' },
    aliases: ['real betis', 'betis', 'rbd', 'los verdiblancos', 'verdiblancos'],
  },
  {
    theme: { primary: '#EE1C25', secondary: '#FFFF00', name: 'Villarreal' },
    aliases: ['villarreal', 'villarreal cf', 'the yellow submarine', 'yellow submarine', 'submarino amarillo'],
  },

  // ── Bundesliga ──────────────────────────────────────────────────
  {
    theme: { primary: '#DC052D', secondary: '#0066B2', name: 'Bayern Munich' },
    aliases: ['bayern munich', 'bayern', 'fcb', 'fc bayern', 'the bavarians', 'bavarians', 'die roten'],
  },
  {
    theme: { primary: '#FDE100', secondary: '#000000', name: 'Borussia Dortmund' },
    aliases: ['borussia dortmund', 'dortmund', 'bvb', 'bvb 09', 'die borussen', 'die schwarzgelben', 'bumblebees'],
  },
  {
    theme: { primary: '#E32221', secondary: '#FFFFFF', name: 'Bayer Leverkusen' },
    aliases: ['bayer leverkusen', 'leverkusen', 'b04', 'die werkself', 'werkself', 'neverkusen'],
  },
  {
    theme: { primary: '#E32221', secondary: '#FFFFFF', name: 'RB Leipzig' },
    aliases: ['rb leipzig', 'leipzig', 'rbl', 'die roten bullen', 'red bulls'],
  },
  {
    theme: { primary: '#005CA9', secondary: '#FFFFFF', name: 'Schalke 04' },
    aliases: ['schalke', 'schalke 04', 's04', 'die knappen', 'royal blues'],
  },
  {
    theme: { primary: '#005CA9', secondary: '#FFFFFF', name: 'Eintracht Frankfurt' },
    aliases: ['eintracht frankfurt', 'frankfurt', 'sge', 'die adler', 'eagles'],
  },
  {
    theme: { primary: '#005CA9', secondary: '#FFFFFF', name: 'Borussia Mönchengladbach' },
    aliases: ['borussia monchengladbach', 'borussia mönchengladbach', 'gladbach', 'bmg', 'die fohlen', 'the foals'],
  },

  // ── Serie A ─────────────────────────────────────────────────────
  {
    theme: { primary: '#000000', secondary: '#FFFFFF', name: 'Juventus' },
    aliases: ['juventus', 'juve', 'la vecchia signora', 'the old lady', 'bianconeri'],
  },
  {
    theme: { primary: '#0068A8', secondary: '#000000', name: 'Inter Milan' },
    aliases: ['inter milan', 'inter', 'internazionale', 'fcim', 'nerazzurri', 'the nerazzurri', 'il biscione'],
  },
  {
    theme: { primary: '#FB090B', secondary: '#000000', name: 'AC Milan' },
    aliases: ['ac milan', 'milan', 'acm', 'rossoneri', 'the rossoneri', 'il diavolo'],
  },
  {
    theme: { primary: '#8B0000', secondary: '#FFD700', name: 'AS Roma' },
    aliases: ['as roma', 'roma', 'asr', 'i giallorossi', 'giallorossi', 'la lupa'],
  },
  {
    theme: { primary: '#87CEEB', secondary: '#FFFFFF', name: 'Lazio' },
    aliases: ['lazio', 'ss lazio', 'laz', 'le aquile', 'biancocelesti'],
  },
  {
    theme: { primary: '#003DA5', secondary: '#FFFFFF', name: 'Napoli' },
    aliases: ['napoli', 'ssc napoli', 'gli azzurri', 'partenopei', 'i ciucciarelli'],
  },
  {
    theme: { primary: '#562B8E', secondary: '#FFFFFF', name: 'Fiorentina' },
    aliases: ['fiorentina', 'acf fiorentina', 'la viola', 'viola', 'gigliati'],
  },
  {
    theme: { primary: '#003DA5', secondary: '#FFFFFF', name: 'Atalanta' },
    aliases: ['atalanta', 'atalanta bc', 'la dea', 'nerazzurri'],
  },

  // ── Ligue 1 ─────────────────────────────────────────────────────
  {
    theme: { primary: '#004170', secondary: '#DA291C', name: 'Paris Saint-Germain' },
    aliases: ['paris saint-germain', 'psg', 'paris sg', 'les parisiens', 'the parisians', 'paris'],
  },
  {
    theme: { primary: '#009AC7', secondary: '#FFFFFF', name: 'Marseille' },
    aliases: ['marseille', 'olympique marseille', 'om', 'les phocéens', 'les phoceens', 'l\'om'],
  },
  {
    theme: { primary: '#DA291C', secondary: '#FFFFFF', name: 'Monaco' },
    aliases: ['monaco', 'as monaco', 'asm', 'les rouges et blancs'],
  },
  {
    theme: { primary: '#DA291C', secondary: '#FFFFFF', name: 'Lyon' },
    aliases: ['lyon', 'olympique lyonnais', 'ol', 'les gones', 'gones'],
  },
  {
    theme: { primary: '#DA291C', secondary: '#FFFFFF', name: 'Lille' },
    aliases: ['lille', 'losc', 'losc lille', 'les dogues', 'dogues'],
  },

  // ── Other notable clubs ─────────────────────────────────────────
  {
    theme: { primary: '#CC0000', secondary: '#FFFFFF', name: 'Ajax' },
    aliases: ['ajax', 'afc ajax', 'de godenzonen', 'the godchildren', 'lancers'],
  },
  {
    theme: { primary: '#CC0000', secondary: '#FFFFFF', name: 'Benfica' },
    aliases: ['benfica', 'sl benfica', 'slb', 'as águias', 'the eagles', 'encarnados'],
  },
  {
    theme: { primary: '#003DA5', secondary: '#FFFFFF', name: 'Porto' },
    aliases: ['porto', 'fc porto', 'fcp', 'os dragões', 'the dragons', 'portistas'],
  },
  {
    theme: { primary: '#CC0000', secondary: '#FFFFFF', name: 'Celtic' },
    aliases: ['celtic', 'celtic fc', 'cfc', 'the bhoys', 'bhoys', 'hoops'],
  },
  {
    theme: { primary: '#003DA5', secondary: '#CC0000', name: 'Rangers' },
    aliases: ['rangers', 'rangers fc', 'rfc', 'the gers', 'gers', 'the blues'],
  },
];

const DEFAULT_THEME: ClubTheme = {
  primary: '#22c55e',
  secondary: '#16a34a',
  name: '',
};

/**
 * Given whatever the user typed as their favourite club,
 * returns the matching ClubTheme (or a default green theme if not found).
 */
export function getClubTheme(input: string): ClubTheme {
  if (!input) return DEFAULT_THEME;
  const normalised = input.trim().toLowerCase();
  for (const club of clubs) {
    if (club.aliases.some(alias => alias === normalised)) {
      return club.theme;
    }
  }
  // Partial match fallback — if the user typed "man" it won't match,
  // but "man city" will. For truly unknown clubs, return default.
  return DEFAULT_THEME;
}

/**
 * Returns up to `limit` canonical club names whose name or aliases
 * contain the query string (case-insensitive).
 */
export function searchClubs(query: string, limit = 6): string[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();
  const results: string[] = [];
  for (const club of clubs) {
    if (
      club.theme.name.toLowerCase().startsWith(q) ||
      club.aliases.some(a => a.toLowerCase().startsWith(q))
    ) {
      results.push(club.theme.name);
      if (results.length >= limit) break;
    }
  }
  return results;
}
