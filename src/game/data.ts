import type { Club, League, Nation, Player, Pos, Visual } from "@/game/types";

export const LEAGUES: League[] = [
  { id: "epl", name: "Premier League", region: "England", nation: "ENG" },
  { id: "cha", name: "Championship", region: "England", nation: "ENG" },
  { id: "laliga", name: "La Liga", region: "Spain", nation: "ESP" },
  { id: "seg", name: "Segunda División", region: "Spain", nation: "ESP" },
  { id: "bund", name: "Bundesliga", region: "Germany", nation: "GER" },
  { id: "b2", name: "2. Bundesliga", region: "Germany", nation: "GER" },
  { id: "seriea", name: "Serie A", region: "Italy", nation: "ITA" },
  { id: "serieb", name: "Serie B", region: "Italy", nation: "ITA" },
  { id: "ligue1", name: "Ligue 1", region: "France", nation: "FRA" },
  { id: "ligue2", name: "Ligue 2", region: "France", nation: "FRA" },
  { id: "prim", name: "Primeira Liga", region: "Portugal", nation: "POR" },
  { id: "bra", name: "Brasileirão Série A", region: "Brazil", nation: "BRA" },
  { id: "brb", name: "Brasileirão Série B", region: "Brazil", nation: "BRA" },
  { id: "ere", name: "Eredivisie", region: "Netherlands", nation: "NED" },
  { id: "bel", name: "Belgian Pro League", region: "Belgium", nation: "BEL" },
  { id: "sco", name: "Scottish Premiership", region: "Scotland", nation: "SCO" },
  { id: "tur", name: "Süper Lig", region: "Turkey", nation: "TUR" },
  { id: "spl", name: "Saudi Pro League", region: "Saudi Arabia", nation: "KSA" },
  { id: "mls", name: "Major League Soccer", region: "United States", nation: "USA" },
];

type Seed = {
  id: string;
  name: string;
  short: string;
  league: string;
  city: string;
  kit: [string, string, string];
  stadium: string;
  rep: number;
};

function club(
  id: string,
  name: string,
  short: string,
  league: string,
  city: string,
  a: string,
  b: string,
  c: string,
  stadium: string,
  rep: number,
): Seed {
  return { id, name, short, league, city, kit: [a, b, c], stadium, rep };
}

const SEEDS: Seed[] = [
  club("mci", "Manchester City", "MCI", "epl", "Manchester", "#6CABDD", "#1C2C5B", "#FFD200", "Etihad Stadium", 88),
  club("mun", "Manchester United", "MUN", "epl", "Manchester", "#DA291C", "#FBE122", "#111111", "Old Trafford", 84),
  club("liv", "Liverpool", "LIV", "epl", "Liverpool", "#C8102E", "#00B2A9", "#F6EB61", "Anfield", 87),
  club("ars", "Arsenal", "ARS", "epl", "London", "#EF0107", "#FFFFFF", "#063672", "Emirates Stadium", 86),
  club("che", "Chelsea", "CHE", "epl", "London", "#034694", "#DBA111", "#FFFFFF", "Stamford Bridge", 83),
  club("tot", "Tottenham", "TOT", "epl", "London", "#132257", "#FFFFFF", "#FFFFFF", "Tottenham Hotspur Stadium", 81),
  club("new", "Newcastle United", "NEW", "epl", "Newcastle", "#241F20", "#FFFFFF", "#00B4F0", "St James' Park", 82),
  club("avl", "Aston Villa", "AVL", "epl", "Birmingham", "#95BFE5", "#670E36", "#670E36", "Villa Park", 81),
  club("bha", "Brighton", "BHA", "epl", "Brighton", "#0057B8", "#FFFFFF", "#FFCD00", "Amex Stadium", 79),
  club("whu", "West Ham", "WHU", "epl", "London", "#7A263A", "#1BB1E7", "#F3D459", "London Stadium", 77),
  club("wol", "Wolves", "WOL", "epl", "Wolverhampton", "#FDB913", "#231F20", "#231F20", "Molineux", 76),
  club("eve", "Everton", "EVE", "epl", "Liverpool", "#003399", "#FFFFFF", "#FFFFFF", "Hill Dickinson Stadium", 76),
  club("ful", "Fulham", "FUL", "epl", "London", "#FFFFFF", "#111111", "#CC0000", "Craven Cottage", 76),
  club("cry", "Crystal Palace", "CRY", "epl", "London", "#1B458F", "#C4122E", "#FFFFFF", "Selhurst Park", 78),
  club("lee", "Leeds United", "LEE", "cha", "Leeds", "#FFCD00", "#1D428A", "#FFFFFF", "Elland Road", 77),
  club("lei", "Leicester City", "LEI", "cha", "Leicester", "#003090", "#FDBE11", "#FFFFFF", "King Power Stadium", 76),
  club("sou", "Southampton", "SOU", "cha", "Southampton", "#D71920", "#FFFFFF", "#FFC20E", "St Mary's Stadium", 75),
  club("mid", "Middlesbrough", "MID", "cha", "Middlesbrough", "#E21A23", "#FFFFFF", "#111111", "Riverside Stadium", 73),
  club("shu", "Sheffield United", "SHU", "cha", "Sheffield", "#EE2737", "#111111", "#FFFFFF", "Bramall Lane", 73),
  club("bur", "Burnley", "BUR", "cha", "Burnley", "#6C1D45", "#99D6EA", "#FFFFFF", "Turf Moor", 74),
  club("rma", "Real Madrid", "RMA", "laliga", "Madrid", "#FFFFFF", "#FEBE10", "#00529F", "Santiago Bernabéu", 90),
  club("bar", "Barcelona", "BAR", "laliga", "Barcelona", "#A50044", "#004D98", "#EDBB00", "Spotify Camp Nou", 88),
  club("atm", "Atlético Madrid", "ATM", "laliga", "Madrid", "#CB3524", "#FFFFFF", "#272E61", "Riyadh Air Metropolitano", 84),
  club("ath", "Athletic Club", "ATH", "laliga", "Bilbao", "#EE2523", "#FFFFFF", "#111111", "San Mamés", 80),
  club("rso", "Real Sociedad", "RSO", "laliga", "San Sebastián", "#0067B1", "#FFFFFF", "#FFFFFF", "Reale Arena", 79),
  club("vil", "Villarreal", "VIL", "laliga", "Villarreal", "#FFE667", "#005187", "#005187", "Estadio de la Cerámica", 80),
  club("bet", "Real Betis", "BET", "laliga", "Seville", "#00954C", "#FFFFFF", "#00954C", "Benito Villamarín", 78),
  club("sev", "Sevilla", "SEV", "laliga", "Seville", "#D70F21", "#FFFFFF", "#FFFFFF", "Ramón Sánchez-Pizjuán", 77),
  club("val", "Valencia", "VAL", "laliga", "Valencia", "#EE3524", "#111111", "#FFFFFF", "Mestalla", 76),
  club("gir", "Girona", "GIR", "laliga", "Girona", "#E03A3E", "#FFFFFF", "#FFFFFF", "Montilivi", 76),
  club("ovi", "Real Oviedo", "OVI", "seg", "Oviedo", "#0033A0", "#FFFFFF", "#FFD200", "Carlos Tartiere", 72),
  club("zar", "Zaragoza", "ZAR", "seg", "Zaragoza", "#FFFFFF", "#0033A0", "#0033A0", "La Romareda", 71),
  club("spg", "Sporting Gijón", "SPG", "seg", "Gijón", "#EE1C25", "#FFFFFF", "#00205B", "El Molinón", 70),
  club("eib", "Eibar", "EIB", "seg", "Eibar", "#1B3C8C", "#B01E2C", "#FFFFFF", "Ipurua", 69),
  club("bay", "Bayern Munich", "BAY", "bund", "Munich", "#DC052D", "#FFFFFF", "#0066B2", "Allianz Arena", 89),
  club("bvb", "Borussia Dortmund", "BVB", "bund", "Dortmund", "#FDE100", "#111111", "#111111", "Signal Iduna Park", 84),
  club("rbl", "RB Leipzig", "RBL", "bund", "Leipzig", "#DD0741", "#FFFFFF", "#001F47", "Red Bull Arena", 82),
  club("b04", "Bayer Leverkusen", "B04", "bund", "Leverkusen", "#E32221", "#111111", "#E32221", "BayArena", 83),
  club("sge", "Eintracht Frankfurt", "SGE", "bund", "Frankfurt", "#E1000F", "#111111", "#FFFFFF", "Deutsche Bank Park", 80),
  club("vfb", "VfB Stuttgart", "VFB", "bund", "Stuttgart", "#FFFFFF", "#E32219", "#E32219", "MHPArena", 80),
  club("wob", "Wolfsburg", "WOB", "bund", "Wolfsburg", "#65B32E", "#FFFFFF", "#111111", "Volkswagen Arena", 76),
  club("bmg", "Borussia M'gladbach", "BMG", "bund", "Mönchengladbach", "#111111", "#FFFFFF", "#FFFFFF", "Borussia-Park", 77),
  club("koe", "1. FC Köln", "KOE", "b2", "Cologne", "#ED1C24", "#FFFFFF", "#ED1C24", "RheinEnergieStadion", 74),
  club("pad", "Paderborn", "PAD", "b2", "Paderborn", "#005CA9", "#111111", "#FFFFFF", "Home Deluxe Arena", 70),
  club("h96", "Hannover 96", "H96", "b2", "Hannover", "#009639", "#111111", "#FFFFFF", "Heinz von Heiden Arena", 71),
  club("f95", "Fortuna Düsseldorf", "F95", "b2", "Düsseldorf", "#ED1C24", "#FFFFFF", "#111111", "Merkur Spiel-Arena", 71),
  club("int", "Inter", "INT", "seriea", "Milan", "#011E9B", "#111111", "#FFD200", "San Siro", 87),
  club("mil", "AC Milan", "MIL", "seriea", "Milan", "#FB090B", "#111111", "#FFFFFF", "San Siro", 84),
  club("juv", "Juventus", "JUV", "seriea", "Turin", "#111111", "#FFFFFF", "#FFFFFF", "Allianz Stadium", 84),
  club("nap", "Napoli", "NAP", "seriea", "Naples", "#12A0D7", "#FFFFFF", "#003875", "Diego Armando Maradona", 82),
  club("rom", "Roma", "ROM", "seriea", "Rome", "#8E1F2F", "#F0BC42", "#FFFFFF", "Stadio Olimpico", 81),
  club("laz", "Lazio", "LAZ", "seriea", "Rome", "#87D8F7", "#FFFFFF", "#111111", "Stadio Olimpico", 80),
  club("ata", "Atalanta", "ATA", "seriea", "Bergamo", "#1E71B8", "#111111", "#FFFFFF", "Gewiss Stadium", 82),
  club("fio", "Fiorentina", "FIO", "seriea", "Florence", "#482E92", "#FFFFFF", "#FFFFFF", "Stadio Franchi", 78),
  club("par", "Parma", "PAR", "serieb", "Parma", "#FFED00", "#1B3F8B", "#FFFFFF", "Ennio Tardini", 74),
  club("pac", "Palermo", "PAC", "serieb", "Palermo", "#EE2E24", "#111111", "#FFD200", "Renzo Barbera", 72),
  club("ven", "Venezia", "VEN", "serieb", "Venice", "#FF6A00", "#111111", "#7EC8E3", "Penzo", 73),
  club("bri", "Bari", "BRI", "serieb", "Bari", "#FFFFFF", "#C8102E", "#C8102E", "San Nicola", 71),
  club("psg", "Paris Saint-Germain", "PSG", "ligue1", "Paris", "#004170", "#DA1834", "#FFFFFF", "Parc des Princes", 88),
  club("om", "Marseille", "OM", "ligue1", "Marseille", "#2FAEE0", "#FFFFFF", "#2FAEE0", "Orange Vélodrome", 80),
  club("asm", "Monaco", "ASM", "ligue1", "Monaco", "#E31E24", "#FFFFFF", "#E31E24", "Stade Louis II", 79),
  club("ol", "Lyon", "OL", "ligue1", "Lyon", "#FFFFFF", "#0033A0", "#E11B22", "Groupama Stadium", 78),
  club("losc", "Lille", "LOSC", "ligue1", "Lille", "#E01E13", "#FFFFFF", "#003366", "Stade Pierre-Mauroy", 78),
  club("nic", "Nice", "NIC", "ligue1", "Nice", "#111111", "#FFFFFF", "#C8102E", "Allianz Riviera", 77),
  club("fcn", "Nantes", "FCN", "ligue2", "Nantes", "#F9D100", "#006B3F", "#FFFFFF", "Stade de la Beaujoire", 74),
  club("sb29", "Brest", "BRE", "ligue2", "Brest", "#E2001A", "#FFFFFF", "#111111", "Stade Francis-Le Blé", 74),
  club("hac", "Le Havre", "HAC", "ligue2", "Le Havre", "#78B4E2", "#FFFFFF", "#003366", "Stade Océane", 72),
  club("amy", "Amiens", "AMY", "ligue2", "Amiens", "#FFFFFF", "#111111", "#111111", "Stade de la Licorne", 70),
  club("slb", "Benfica", "SLB", "prim", "Lisbon", "#E03030", "#FFFFFF", "#FFD200", "Estádio da Luz", 84),
  club("fcp", "FC Porto", "FCP", "prim", "Porto", "#003399", "#FFFFFF", "#003399", "Estádio do Dragão", 83),
  club("scp", "Sporting CP", "SCP", "prim", "Lisbon", "#008057", "#FFFFFF", "#FFD200", "Estádio José Alvalade", 83),
  club("brg", "Braga", "BRG", "prim", "Braga", "#E10600", "#FFFFFF", "#FFD200", "Estádio Municipal", 78),
  club("vim", "Vitória Guimarães", "VIM", "prim", "Guimarães", "#FFFFFF", "#111111", "#FFFFFF", "Dom Afonso Henriques", 75),
  club("gil", "Gil Vicente", "GIL", "prim", "Barcelos", "#E31E24", "#FFFFFF", "#111111", "Cidade de Barcelos", 72),
  club("fla", "Flamengo", "FLA", "bra", "Rio de Janeiro", "#C52626", "#111111", "#FFFFFF", "Maracanã", 85),
  club("pam", "Palmeiras", "PAL", "bra", "São Paulo", "#006437", "#FFFFFF", "#006437", "Allianz Parque", 85),
  club("cor", "Corinthians", "COR", "bra", "São Paulo", "#111111", "#FFFFFF", "#111111", "Neo Química Arena", 82),
  club("sao", "São Paulo", "SAO", "bra", "São Paulo", "#FF0000", "#111111", "#FFFFFF", "Morumbi", 81),
  club("san", "Santos", "SAN", "bra", "Santos", "#FFFFFF", "#111111", "#FFFFFF", "Vila Belmiro", 78),
  club("bot", "Botafogo", "BOT", "bra", "Rio de Janeiro", "#111111", "#FFFFFF", "#FFFFFF", "Nilton Santos", 82),
  club("flu", "Fluminense", "FLU", "bra", "Rio de Janeiro", "#7A1538", "#006B3F", "#FFFFFF", "Maracanã", 80),
  club("gre", "Grêmio", "GRE", "bra", "Porto Alegre", "#0D80BF", "#111111", "#FFFFFF", "Arena do Grêmio", 79),
  club("inp", "Internacional", "INT", "bra", "Porto Alegre", "#E30613", "#FFFFFF", "#E30613", "Beira-Rio", 80),
  club("cam", "Atlético Mineiro", "CAM", "bra", "Belo Horizonte", "#111111", "#FFFFFF", "#111111", "Arena MRV", 81),
  club("vas", "Vasco da Gama", "VAS", "brb", "Rio de Janeiro", "#111111", "#FFFFFF", "#FFFFFF", "São Januário", 76),
  club("bah", "Bahia", "BAH", "brb", "Salvador", "#0033A0", "#E10600", "#FFFFFF", "Arena Fonte Nova", 77),
  club("cea", "Ceará", "CEA", "brb", "Fortaleza", "#111111", "#FFFFFF", "#FFFFFF", "Castelão", 73),
  club("goi", "Goiás", "GOI", "brb", "Goiânia", "#006B3F", "#FFFFFF", "#FFFFFF", "Hailé Pinheiro", 71),
  club("aja", "Ajax", "AJA", "ere", "Amsterdam", "#D2122E", "#FFFFFF", "#D2122E", "Johan Cruyff Arena", 81),
  club("psv", "PSV", "PSV", "ere", "Eindhoven", "#ED1C24", "#FFFFFF", "#FFFFFF", "Philips Stadion", 83),
  club("fey", "Feyenoord", "FEY", "ere", "Rotterdam", "#E30613", "#FFFFFF", "#FFFFFF", "De Kuip", 80),
  club("az", "AZ", "AZ", "ere", "Alkmaar", "#E30613", "#FFFFFF", "#111111", "AFAS Stadion", 77),
  club("twe", "Twente", "TWE", "ere", "Enschede", "#E30613", "#FFFFFF", "#FFFFFF", "De Grolsch Veste", 75),
  club("utr", "Utrecht", "UTR", "ere", "Utrecht", "#E30613", "#FFFFFF", "#111111", "Galgenwaard", 74),
  club("bru", "Club Brugge", "CLU", "bel", "Bruges", "#0072CE", "#111111", "#FFFFFF", "Jan Breydelstadion", 79),
  club("and", "Anderlecht", "AND", "bel", "Brussels", "#5C068C", "#FFFFFF", "#FFFFFF", "Lotto Park", 77),
  club("gnk", "Genk", "GNK", "bel", "Genk", "#0033A0", "#FFFFFF", "#FFFFFF", "Cegeka Arena", 76),
  club("ant", "Antwerp", "ANT", "bel", "Antwerp", "#E30613", "#FFFFFF", "#FFFFFF", "Bosuil", 75),
  club("cel", "Celtic", "CEL", "sco", "Glasgow", "#018749", "#FFFFFF", "#FFFFFF", "Celtic Park", 80),
  club("ran", "Rangers", "RAN", "sco", "Glasgow", "#1B458F", "#FFFFFF", "#E30613", "Ibrox", 79),
  club("abe", "Aberdeen", "ABE", "sco", "Aberdeen", "#E30613", "#FFFFFF", "#FFFFFF", "Pittodrie", 73),
  club("hea", "Hearts", "HEA", "sco", "Edinburgh", "#7A1538", "#FFFFFF", "#FFFFFF", "Tynecastle", 73),
  club("gal", "Galatasaray", "GAL", "tur", "Istanbul", "#A32638", "#F5A300", "#FFFFFF", "RAMS Park", 82),
  club("fen", "Fenerbahçe", "FEN", "tur", "Istanbul", "#FFED00", "#002266", "#FFFFFF", "Şükrü Saracoğlu", 80),
  club("bjk", "Beşiktaş", "BJK", "tur", "Istanbul", "#111111", "#FFFFFF", "#111111", "Tüpraş Stadyumu", 78),
  club("ts", "Trabzonspor", "TS", "tur", "Trabzon", "#6C1D3C", "#7EC8E3", "#FFFFFF", "Papara Park", 76),
  club("hil", "Al Hilal", "HIL", "spl", "Riyadh", "#0033A0", "#FFFFFF", "#FFFFFF", "Kingdom Arena", 84),
  club("nsr", "Al Nassr", "NSR", "spl", "Riyadh", "#FFD200", "#0033A0", "#FFFFFF", "Al-Awwal Park", 83),
  club("ahl", "Al Ahli", "AHL", "spl", "Jeddah", "#007A33", "#FFFFFF", "#FFFFFF", "Alinma Stadium", 78),
  club("ith", "Al Ittihad", "ITT", "spl", "Jeddah", "#FFD200", "#111111", "#FFFFFF", "King Abdullah Sports City", 79),
  club("mia", "Inter Miami", "MIA", "mls", "Miami", "#F7B5CD", "#111111", "#FFFFFF", "Miami Freedom Park", 80),
  club("lafc", "LAFC", "LAFC", "mls", "Los Angeles", "#111111", "#C39E6D", "#FFFFFF", "BMO Stadium", 79),
  club("nyc", "New York City", "NYC", "mls", "New York", "#6CACE4", "#F15523", "#FFFFFF", "Yankee Stadium", 76),
  club("lag", "LA Galaxy", "LAG", "mls", "Los Angeles", "#00245D", "#FFD200", "#FFFFFF", "Dignity Health Sports Park", 75),
];

export const NATIONS: Nation[] = [
  { id: "BRA", name: "Brazil", confed: "CONMEBOL", kit: ["#FFDF00", "#00843D", "#002776"] },
  { id: "ARG", name: "Argentina", confed: "CONMEBOL", kit: ["#75AADB", "#FFFFFF", "#75AADB"] },
  { id: "ENG", name: "England", confed: "UEFA", kit: ["#FFFFFF", "#C8102E", "#012169"] },
  { id: "FRA", name: "France", confed: "UEFA", kit: ["#002395", "#ED2939", "#FFFFFF"] },
  { id: "ESP", name: "Spain", confed: "UEFA", kit: ["#C60B1E", "#F1BF00", "#C60B1E"] },
  { id: "GER", name: "Germany", confed: "UEFA", kit: ["#FFFFFF", "#111111", "#DD0000"] },
  { id: "POR", name: "Portugal", confed: "UEFA", kit: ["#006600", "#FF0000", "#FFD200"] },
  { id: "NOR", name: "Norway", confed: "UEFA", kit: ["#BA0C2F", "#FFFFFF", "#00205B"] },
  { id: "NED", name: "Netherlands", confed: "UEFA", kit: ["#F36C21", "#FFFFFF", "#21468B"] },
  { id: "ITA", name: "Italy", confed: "UEFA", kit: ["#0066B3", "#FFFFFF", "#0066B3"] },
  { id: "URU", name: "Uruguay", confed: "CONMEBOL", kit: ["#7BAFD4", "#111111", "#FFFFFF"] },
  { id: "COL", name: "Colombia", confed: "CONMEBOL", kit: ["#FCD116", "#003893", "#CE1126"] },
  { id: "JPN", name: "Japan", confed: "AFC", kit: ["#FFFFFF", "#BC002D", "#FFFFFF"] },
  { id: "KOR", name: "South Korea", confed: "AFC", kit: ["#C60C30", "#FFFFFF", "#003478"] },
  { id: "USA", name: "United States", confed: "CONCACAF", kit: ["#FFFFFF", "#002868", "#BF0A30"] },
  { id: "MEX", name: "Mexico", confed: "CONCACAF", kit: ["#006847", "#FFFFFF", "#CE1126"] },
  { id: "MAR", name: "Morocco", confed: "CAF", kit: ["#C1272D", "#006233", "#C1272D"] },
  { id: "SEN", name: "Senegal", confed: "CAF", kit: ["#FFFFFF", "#00853F", "#FFD100"] },
  { id: "CRO", name: "Croatia", confed: "UEFA", kit: ["#FF0000", "#FFFFFF", "#171796"] },
  { id: "BEL", name: "Belgium", confed: "UEFA", kit: ["#FDDA24", "#111111", "#EF3340"] },
  { id: "NGA", name: "Nigeria", confed: "CAF", kit: ["#008751", "#FFFFFF", "#008751"] },
  { id: "DEN", name: "Denmark", confed: "UEFA", kit: ["#C60C30", "#FFFFFF", "#C60C30"] },
  { id: "SUI", name: "Switzerland", confed: "UEFA", kit: ["#FF0000", "#FFFFFF", "#FF0000"] },
  { id: "WAL", name: "Wales", confed: "UEFA", kit: ["#C8102E", "#FFFFFF", "#00AB39"] },
];

type Star = {
  club: string;
  name: string;
  pos: Pos;
  ovr: number;
  nat: string;
  num: number;
  foot?: "L" | "R";
  height?: number;
  age?: number;
  visual?: Partial<Visual>;
  tendencies?: string[];
};

const STARS: Star[] = [
  { club: "mci", name: "Erling Haaland", pos: "ST", ovr: 91, nat: "NOR", num: 9, foot: "L", height: 195, age: 25, visual: { skin: 0, hair: 3, hairStyle: 1, bulk: 1.16 }, tendencies: ["Penalty-box finisher", "Aggressive runs in behind", "Powerful striker"] },
  { club: "mci", name: "Kevin De Bruyne", pos: "CAM", ovr: 90, nat: "BEL", num: 17, foot: "R", height: 181, age: 34, visual: { skin: 0, hair: 3, hairStyle: 1, bulk: 1.02 }, tendencies: ["Line-breaking passes", "Long-range distribution", "Vision"] },
  { club: "mci", name: "Rodri", pos: "CDM", ovr: 91, nat: "ESP", num: 16, height: 191, age: 29, visual: { skin: 1, hair: 0, hairStyle: 1, bulk: 1.08 }, tendencies: ["Tempo control", "Press-resistant"] },
  { club: "mci", name: "Phil Foden", pos: "LW", ovr: 88, nat: "ENG", num: 47, height: 171, age: 25, visual: { skin: 0, hair: 3, hairStyle: 2, bulk: 0.92 }, tendencies: ["Inside forward", "Tight-space dribbler"] },
  { club: "mci", name: "Jérémy Doku", pos: "RW", ovr: 84, nat: "BEL", num: 11, height: 173, age: 23, visual: { skin: 3, hair: 0, hairStyle: 2, bulk: 0.9 }, tendencies: ["1v1 take-on", "Wide isolations"] },
  { club: "mci", name: "Rúben Dias", pos: "CB", ovr: 88, nat: "POR", num: 3, height: 187, age: 28, visual: { skin: 1, hair: 0, hairStyle: 1, bulk: 1.08 }, tendencies: ["Front-foot defender"] },
  { club: "mci", name: "Ederson", pos: "GK", ovr: 88, nat: "BRA", num: 31, height: 188, age: 32, visual: { skin: 1, hair: 0, hairStyle: 1, bulk: 1.02 }, tendencies: ["Sweeper keeper", "Long distribution"] },
  { club: "mci", name: "Bernardo Silva", pos: "CM", ovr: 87, nat: "POR", num: 20, height: 173, age: 31, visual: { skin: 1, hair: 0, hairStyle: 1, bulk: 0.9 }, tendencies: ["Press resistant", "Combination play"] },
  { club: "mci", name: "Joško Gvardiol", pos: "LB", ovr: 86, nat: "CRO", num: 24, height: 185, age: 23, tendencies: ["Ball-playing defender"] },
  { club: "liv", name: "Mohamed Salah", pos: "RW", ovr: 89, nat: "EGY", num: 11, foot: "L", height: 175, age: 33, visual: { skin: 3, hair: 0, hairStyle: 1, bulk: 0.94 }, tendencies: ["Inside cuts", "Composed finisher"] },
  { club: "liv", name: "Virgil van Dijk", pos: "CB", ovr: 89, nat: "NED", num: 4, height: 193, age: 34, visual: { skin: 3, hair: 0, hairStyle: 1, bulk: 1.12 }, tendencies: ["Dominant aerially", "Organiser"] },
  { club: "liv", name: "Alisson", pos: "GK", ovr: 89, nat: "BRA", num: 1, height: 191, age: 33, visual: { skin: 2, hair: 0, hairStyle: 1, bulk: 1.05 }, tendencies: ["Shot stopper", "Claims crosses"] },
  { club: "liv", name: "Alexis Mac Allister", pos: "CM", ovr: 86, nat: "ARG", num: 10, height: 176, age: 26, tendencies: ["Progressive passer"] },
  { club: "liv", name: "Luis Díaz", pos: "LW", ovr: 85, nat: "COL", num: 7, height: 178, age: 28, visual: { skin: 2, hair: 0, hairStyle: 2, bulk: 0.94 }, tendencies: ["Direct dribbler"] },
  { club: "liv", name: "Ryan Gravenberch", pos: "CDM", ovr: 84, nat: "NED", num: 38, height: 190, age: 23, tendencies: ["Carries through midfield"] },
  { club: "ars", name: "Bukayo Saka", pos: "RW", ovr: 88, nat: "ENG", num: 7, foot: "L", height: 178, age: 24, visual: { skin: 3, hair: 0, hairStyle: 1, bulk: 0.95 }, tendencies: ["End product", "1v1"] },
  { club: "ars", name: "Martin Ødegaard", pos: "CAM", ovr: 88, nat: "NOR", num: 8, foot: "L", height: 178, age: 26, visual: { skin: 0, hair: 3, hairStyle: 1, bulk: 0.92 }, tendencies: ["Tempo", "Through balls"] },
  { club: "ars", name: "William Saliba", pos: "CB", ovr: 87, nat: "FRA", num: 2, height: 192, age: 24, visual: { skin: 3, hair: 0, hairStyle: 1, bulk: 1.08 }, tendencies: ["Recovery pace"] },
  { club: "ars", name: "Declan Rice", pos: "CDM", ovr: 88, nat: "ENG", num: 41, height: 188, age: 26, tendencies: ["Box-to-box shield"] },
  { club: "ars", name: "David Raya", pos: "GK", ovr: 86, nat: "ESP", num: 22, height: 183, age: 30, tendencies: ["Distribution"] },
  { club: "ars", name: "Gabriel Magalhães", pos: "CB", ovr: 86, nat: "BRA", num: 6, height: 190, age: 27, tendencies: ["Aggressive defender"] },
  { club: "mun", name: "Bruno Fernandes", pos: "CAM", ovr: 87, nat: "POR", num: 8, height: 179, age: 31, tendencies: ["Late runs", "Set pieces"] },
  { club: "mun", name: "Kobbie Mainoo", pos: "CM", ovr: 82, nat: "ENG", num: 37, height: 175, age: 20, tendencies: ["Press resistance"] },
  { club: "mun", name: "Amad Diallo", pos: "RW", ovr: 81, nat: "CIV", num: 16, height: 173, age: 23, tendencies: ["Dribbler"] },
  { club: "mun", name: "André Onana", pos: "GK", ovr: 83, nat: "CMR", num: 24, height: 190, age: 29, tendencies: ["Sweeper keeper"] },
  { club: "mun", name: "Matthijs de Ligt", pos: "CB", ovr: 84, nat: "NED", num: 4, height: 189, age: 26, tendencies: ["Physical defender"] },
  { club: "che", name: "Cole Palmer", pos: "CAM", ovr: 88, nat: "ENG", num: 20, foot: "L", height: 189, age: 23, visual: { skin: 0, hair: 2, hairStyle: 1, bulk: 0.98 }, tendencies: ["Cut inside", "Composed finisher"] },
  { club: "che", name: "Enzo Fernández", pos: "CM", ovr: 85, nat: "ARG", num: 8, height: 178, age: 24, tendencies: ["Progressive passer"] },
  { club: "che", name: "Moisés Caicedo", pos: "CDM", ovr: 84, nat: "ECU", num: 25, height: 178, age: 24, tendencies: ["Ball winner"] },
  { club: "che", name: "Reece James", pos: "RB", ovr: 84, nat: "ENG", num: 24, height: 182, age: 25, tendencies: ["Overlapping back"] },
  { club: "tot", name: "Son Heung-min", pos: "LW", ovr: 86, nat: "KOR", num: 7, foot: "R", height: 183, age: 33, tendencies: ["Runs in behind"] },
  { club: "tot", name: "Cristian Romero", pos: "CB", ovr: 85, nat: "ARG", num: 17, height: 185, age: 27, tendencies: ["Aggressive defender"] },
  { club: "tot", name: "Micky van de Ven", pos: "CB", ovr: 84, nat: "NED", num: 37, height: 193, age: 24, tendencies: ["Recovery pace"] },
  { club: "tot", name: "Guglielmo Vicario", pos: "GK", ovr: 84, nat: "ITA", num: 1, height: 194, age: 29, tendencies: ["Shot stopper"] },
  { club: "new", name: "Alexander Isak", pos: "ST", ovr: 87, nat: "SWE", num: 14, height: 192, age: 26, tendencies: ["Channel runs", "Finisher"] },
  { club: "new", name: "Sandro Tonali", pos: "CM", ovr: 84, nat: "ITA", num: 8, height: 181, age: 25, tendencies: ["Box-to-box"] },
  { club: "bha", name: "Kaoru Mitoma", pos: "LW", ovr: 82, nat: "JPN", num: 22, height: 178, age: 28, tendencies: ["Dribbler"] },
  { club: "rma", name: "Kylian Mbappé", pos: "ST", ovr: 91, nat: "FRA", num: 10, foot: "R", height: 178, age: 27, visual: { skin: 2, hair: 0, hairStyle: 1, bulk: 0.98 }, tendencies: ["Explosive pace", "Attacking runs", "1v1 finisher"] },
  { club: "rma", name: "Vinícius Júnior", pos: "LW", ovr: 90, nat: "BRA", num: 7, foot: "R", height: 176, age: 25, visual: { skin: 3, hair: 0, hairStyle: 1, bulk: 0.94 }, tendencies: ["Acceleration", "One-on-one flair", "End product"] },
  { club: "rma", name: "Jude Bellingham", pos: "CAM", ovr: 90, nat: "ENG", num: 5, height: 186, age: 22, visual: { skin: 1, hair: 2, hairStyle: 1, bulk: 1.04 }, tendencies: ["Box arrivals", "Dynamic midfield runs"] },
  { club: "rma", name: "Federico Valverde", pos: "CM", ovr: 88, nat: "URU", num: 8, height: 182, age: 27, tendencies: ["Driving runs", "Long shots"] },
  { club: "rma", name: "Thibaut Courtois", pos: "GK", ovr: 89, nat: "BEL", num: 1, height: 200, age: 33, visual: { skin: 0, hair: 3, hairStyle: 1, bulk: 1.1 }, tendencies: ["Reach", "One-on-one"] },
  { club: "rma", name: "Rodrygo", pos: "RW", ovr: 85, nat: "BRA", num: 11, height: 174, age: 24, tendencies: ["Inside forward"] },
  { club: "rma", name: "Antonio Rüdiger", pos: "CB", ovr: 86, nat: "GER", num: 22, height: 190, age: 32, tendencies: ["Physical defender"] },
  { club: "rma", name: "Eduardo Camavinga", pos: "CM", ovr: 84, nat: "FRA", num: 6, height: 182, age: 23, tendencies: ["Ball carrier"] },
  { club: "bar", name: "Lamine Yamal", pos: "RW", ovr: 87, nat: "ESP", num: 19, foot: "L", height: 180, age: 18, visual: { skin: 2, hair: 0, hairStyle: 2, bulk: 0.9 }, tendencies: ["Flair", "Creator"] },
  { club: "bar", name: "Pedri", pos: "CM", ovr: 87, nat: "ESP", num: 8, height: 174, age: 23, tendencies: ["Press resistant", "Tempo"] },
  { club: "bar", name: "Robert Lewandowski", pos: "ST", ovr: 88, nat: "POL", num: 9, height: 185, age: 37, visual: { skin: 0, hair: 4, hairStyle: 1, bulk: 1.06 }, tendencies: ["Penalty-box movement"] },
  { club: "bar", name: "Raphinha", pos: "LW", ovr: 86, nat: "BRA", num: 11, height: 176, age: 28, tendencies: ["Direct winger"] },
  { club: "bar", name: "Marc-André ter Stegen", pos: "GK", ovr: 87, nat: "GER", num: 1, height: 187, age: 33, tendencies: ["Distribution"] },
  { club: "bar", name: "Jules Koundé", pos: "CB", ovr: 85, nat: "FRA", num: 23, height: 180, age: 26, tendencies: ["Ball-playing defender"] },
  { club: "atm", name: "Antoine Griezmann", pos: "CAM", ovr: 87, nat: "FRA", num: 7, height: 176, age: 34, tendencies: ["Link play", "Finisher"] },
  { club: "atm", name: "Julián Álvarez", pos: "ST", ovr: 85, nat: "ARG", num: 19, height: 170, age: 25, tendencies: ["Pressing forward"] },
  { club: "atm", name: "Jan Oblak", pos: "GK", ovr: 88, nat: "SVN", num: 13, height: 188, age: 32, tendencies: ["Positioning", "Reflexes"] },
  { club: "bay", name: "Harry Kane", pos: "ST", ovr: 90, nat: "ENG", num: 9, height: 188, age: 32, visual: { skin: 0, hair: 2, hairStyle: 1, bulk: 1.06 }, tendencies: ["Drop deep", "Finisher"] },
  { club: "bay", name: "Jamal Musiala", pos: "CAM", ovr: 88, nat: "GER", num: 42, height: 184, age: 22, visual: { skin: 2, hair: 0, hairStyle: 2, bulk: 0.96 }, tendencies: ["Dribble progression"] },
  { club: "bay", name: "Joshua Kimmich", pos: "CDM", ovr: 87, nat: "GER", num: 6, height: 177, age: 30, tendencies: ["Distributor"] },
  { club: "bay", name: "Alphonso Davies", pos: "LB", ovr: 84, nat: "CAN", num: 19, height: 183, age: 25, tendencies: ["Recovery pace"] },
  { club: "bay", name: "Manuel Neuer", pos: "GK", ovr: 86, nat: "GER", num: 1, height: 193, age: 39, tendencies: ["Sweeper keeper"] },
  { club: "bay", name: "Michael Olise", pos: "RW", ovr: 85, nat: "FRA", num: 17, height: 184, age: 23, tendencies: ["Creator"] },
  { club: "bvb", name: "Serhou Guirassy", pos: "ST", ovr: 84, nat: "GUI", num: 9, height: 187, age: 29, tendencies: ["Target man"] },
  { club: "bvb", name: "Julian Brandt", pos: "CAM", ovr: 84, nat: "GER", num: 10, height: 185, age: 29, tendencies: ["Between the lines"] },
  { club: "bvb", name: "Gregor Kobel", pos: "GK", ovr: 86, nat: "SUI", num: 1, height: 194, age: 27, tendencies: ["Shot stopper"] },
  { club: "b04", name: "Florian Wirtz", pos: "CAM", ovr: 88, nat: "GER", num: 10, height: 176, age: 22, visual: { skin: 0, hair: 3, hairStyle: 2, bulk: 0.92 }, tendencies: ["Line-breaking passes", "Dribbler"] },
  { club: "b04", name: "Granit Xhaka", pos: "CDM", ovr: 84, nat: "SUI", num: 34, height: 186, age: 33, tendencies: ["Switch of play"] },
  { club: "int", name: "Lautaro Martínez", pos: "ST", ovr: 89, nat: "ARG", num: 10, height: 174, age: 28, visual: { skin: 1, hair: 0, hairStyle: 1, bulk: 1.0 }, tendencies: ["Penalty-box movement"] },
  { club: "int", name: "Nicolò Barella", pos: "CM", ovr: 87, nat: "ITA", num: 23, height: 175, age: 28, tendencies: ["Box-to-box"] },
  { club: "int", name: "Alessandro Bastoni", pos: "CB", ovr: 86, nat: "ITA", num: 95, foot: "L", height: 190, age: 26, tendencies: ["Ball-playing defender"] },
  { club: "int", name: "Yann Sommer", pos: "GK", ovr: 85, nat: "SUI", num: 1, height: 183, age: 36, tendencies: ["Reflexes"] },
  { club: "mil", name: "Rafael Leão", pos: "LW", ovr: 86, nat: "POR", num: 10, foot: "R", height: 188, age: 26, visual: { skin: 3, hair: 0, hairStyle: 2, bulk: 1.0 }, tendencies: ["Explosive dribbler"] },
  { club: "mil", name: "Theo Hernández", pos: "LB", ovr: 85, nat: "FRA", num: 19, foot: "L", height: 184, age: 28, tendencies: ["Overlapping back"] },
  { club: "mil", name: "Mike Maignan", pos: "GK", ovr: 87, nat: "FRA", num: 16, height: 191, age: 30, tendencies: ["Shot stopper"] },
  { club: "mil", name: "Christian Pulisic", pos: "RW", ovr: 83, nat: "USA", num: 11, height: 177, age: 27, tendencies: ["Inside runs"] },
  { club: "juv", name: "Dušan Vlahović", pos: "ST", ovr: 84, nat: "SRB", num: 9, height: 190, age: 25, tendencies: ["Shot power"] },
  { club: "juv", name: "Kenan Yıldız", pos: "LW", ovr: 82, nat: "TUR", num: 10, height: 185, age: 20, tendencies: ["Dribbler"] },
  { club: "juv", name: "Bremer", pos: "CB", ovr: 84, nat: "BRA", num: 3, height: 188, age: 28, tendencies: ["Aggressive defender"] },
  { club: "nap", name: "Khvicha Kvaratskhelia", pos: "LW", ovr: 86, nat: "GEO", num: 77, foot: "R", height: 183, age: 24, tendencies: ["Flair dribbler"] },
  { club: "rom", name: "Paulo Dybala", pos: "CAM", ovr: 84, nat: "ARG", num: 21, foot: "L", height: 177, age: 32, tendencies: ["Finesse shots"] },
  { club: "ata", name: "Ademola Lookman", pos: "LW", ovr: 84, nat: "NGA", num: 11, height: 174, age: 27, tendencies: ["Direct attacker"] },
  { club: "psg", name: "Ousmane Dembélé", pos: "RW", ovr: 88, nat: "FRA", num: 10, height: 178, age: 28, visual: { skin: 3, hair: 0, hairStyle: 1, bulk: 0.95 }, tendencies: ["Pace", "Dribbler"] },
  { club: "psg", name: "Achraf Hakimi", pos: "RB", ovr: 86, nat: "MAR", num: 2, height: 181, age: 27, tendencies: ["Overlapping back"] },
  { club: "psg", name: "Gianluigi Donnarumma", pos: "GK", ovr: 88, nat: "ITA", num: 1, height: 196, age: 26, visual: { skin: 1, hair: 0, hairStyle: 1, bulk: 1.12 }, tendencies: ["Reach", "Reflexes"] },
  { club: "psg", name: "Marquinhos", pos: "CB", ovr: 87, nat: "BRA", num: 5, height: 183, age: 31, tendencies: ["Organiser"] },
  { club: "psg", name: "Vitinha", pos: "CM", ovr: 86, nat: "POR", num: 17, height: 172, age: 25, tendencies: ["Tempo"] },
  { club: "psg", name: "João Neves", pos: "CM", ovr: 83, nat: "POR", num: 87, height: 174, age: 21, tendencies: ["Press resistant"] },
  { club: "om", name: "Mason Greenwood", pos: "RW", ovr: 81, nat: "ENG", num: 10, foot: "L", height: 181, age: 24, tendencies: ["Cut inside"] },
  { club: "slb", name: "Ángel Di María", pos: "RW", ovr: 82, nat: "ARG", num: 11, foot: "L", height: 180, age: 37, tendencies: ["Creator"] },
  { club: "slb", name: "Anatoliy Trubin", pos: "GK", ovr: 82, nat: "UKR", num: 1, height: 199, age: 24, tendencies: ["Reach"] },
  { club: "fcp", name: "Diogo Costa", pos: "GK", ovr: 84, nat: "POR", num: 99, height: 186, age: 26, tendencies: ["Shot stopper"] },
  { club: "scp", name: "Viktor Gyökeres", pos: "ST", ovr: 86, nat: "SWE", num: 9, height: 187, age: 27, visual: { skin: 0, hair: 3, hairStyle: 1, bulk: 1.08 }, tendencies: ["Runs in behind", "Finisher"] },
  { club: "scp", name: "Morten Hjulmand", pos: "CDM", ovr: 82, nat: "DEN", num: 42, height: 185, age: 26, tendencies: ["Ball winner"] },
  { club: "fla", name: "Pedro", pos: "ST", ovr: 82, nat: "BRA", num: 9, height: 185, age: 28, tendencies: ["Link striker"] },
  { club: "pam", name: "Estevão", pos: "RW", ovr: 80, nat: "BRA", num: 41, height: 176, age: 18, tendencies: ["Flair"] },
  { club: "bot", name: "Thiago Almada", pos: "CAM", ovr: 80, nat: "ARG", num: 10, height: 171, age: 24, tendencies: ["Creator"] },
  { club: "aja", name: "Brian Brobbey", pos: "ST", ovr: 79, nat: "NED", num: 9, height: 180, age: 23, tendencies: ["Target man"] },
  { club: "psv", name: "Luuk de Jong", pos: "ST", ovr: 80, nat: "NED", num: 9, height: 188, age: 35, tendencies: ["Aerial target"] },
  { club: "cel", name: "Callum McGregor", pos: "CM", ovr: 80, nat: "SCO", num: 42, height: 178, age: 32, tendencies: ["Tempo"] },
  { club: "ran", name: "James Tavernier", pos: "RB", ovr: 78, nat: "ENG", num: 2, height: 182, age: 34, tendencies: ["Set pieces"] },
  { club: "gal", name: "Victor Osimhen", pos: "ST", ovr: 87, nat: "NGA", num: 45, height: 185, age: 26, visual: { skin: 4, hair: 0, hairStyle: 1, bulk: 1.08 }, tendencies: ["Runs in behind", "Aerial power"] },
  { club: "fen", name: "Edin Džeko", pos: "ST", ovr: 80, nat: "BIH", num: 9, height: 193, age: 39, tendencies: ["Target man"] },
  { club: "hil", name: "Rúben Neves", pos: "CDM", ovr: 83, nat: "POR", num: 8, height: 180, age: 28, tendencies: ["Long passing"] },
  { club: "nsr", name: "Cristiano Ronaldo", pos: "ST", ovr: 86, nat: "POR", num: 7, height: 187, age: 41, visual: { skin: 1, hair: 0, hairStyle: 1, bulk: 1.05 }, tendencies: ["Penalty-box movement", "Aerial power"] },
  { club: "mia", name: "Lionel Messi", pos: "CAM", ovr: 88, nat: "ARG", num: 10, foot: "L", height: 170, age: 38, visual: { skin: 1, hair: 0, hairStyle: 1, bulk: 0.9 }, tendencies: ["Vision", "Finesse shots", "Playmaker"] },
  { club: "mia", name: "Luis Suárez", pos: "ST", ovr: 80, nat: "URU", num: 9, height: 182, age: 38, tendencies: ["Poacher"] },
  { club: "mia", name: "Sergio Busquets", pos: "CDM", ovr: 80, nat: "ESP", num: 5, height: 189, age: 37, tendencies: ["Tempo"] },
  { club: "lafc", name: "Denis Bouanga", pos: "LW", ovr: 79, nat: "GAB", num: 99, height: 180, age: 31, tendencies: ["Direct winger"] },
  { club: "vil", name: "Álex Baena", pos: "CAM", ovr: 82, nat: "ESP", num: 16, height: 175, age: 24, tendencies: ["Between the lines"] },
  { club: "ath", name: "Nico Williams", pos: "LW", ovr: 85, nat: "ESP", num: 10, height: 183, age: 23, visual: { skin: 3, hair: 0, hairStyle: 2, bulk: 0.95 }, tendencies: ["1v1 pace"] },
  { club: "rso", name: "Martín Zubimendi", pos: "CDM", ovr: 84, nat: "ESP", num: 4, height: 181, age: 26, tendencies: ["Positional midfielder"] },
  { club: "sge", name: "Omar Marmoush", pos: "ST", ovr: 83, nat: "EGY", num: 7, height: 183, age: 26, tendencies: ["Channel runs"] },
];

const FIRST: Record<string, string[]> = {
  eng: ["James", "Harry", "Jack", "Oliver", "George", "Mason", "Alex", "Ben", "Leo", "Callum", "Jordan", "Harvey", "Noah", "Jacob", "Ryan", "Adam", "Lewis", "Owen", "Finley", "Archie"],
  spa: ["Pablo", "Álvaro", "Hugo", "Marcos", "Iker", "Dani", "Sergio", "Alejandro", "Adrián", "Martín", "Diego", "Javier", "Raúl", "Nico", "Pedro", "Gonzalo", "Unai", "Ander"],
  ger: ["Jonas", "Leon", "Finn", "Paul", "Luca", "Niklas", "Max", "Tim", "Felix", "Florian", "Lars", "Kai", "Mats", "Nico", "Julian", "Tom"],
  ita: ["Lorenzo", "Marco", "Andrea", "Matteo", "Alessandro", "Davide", "Federico", "Giacomo", "Nicola", "Simone", "Giovanni", "Luca", "Riccardo"],
  fra: ["Lucas", "Hugo", "Théo", "Mathis", "Adam", "Jules", "Enzo", "Nathan", "Rayan", "Yanis", "Maxence", "Alexandre", "Baptiste"],
  por: ["Diogo", "Gonçalo", "João", "Tiago", "Rafael", "Bruno", "Francisco", "Rodrigo", "André", "Nuno", "Pedro", "Martim"],
  bra: ["Lucas", "Gabriel", "Matheus", "Pedro", "Rafael", "Bruno", "Felipe", "Gustavo", "Thiago", "Caio", "André", "Igor", "Wesley", "Endrick"],
  ned: ["Daan", "Sem", "Luuk", "Jesse", "Teun", "Milan", "Justin", "Noa", "Sven", "Bram", "Finn", "Mats"],
  bel: ["Arthur", "Nicolas", "Louis", "Maxime", "Simon", "Julien", "Noah", "Liam", "Stan"],
  sco: ["Craig", "Scott", "Andrew", "Kyle", "Connor", "Declan", "Fraser", "Calum", "Ross"],
  tur: ["Arda", "Yusuf", "Emre", "Burak", "Kerem", "Hakan", "Can", "Mert", "Oğuz", "Barış"],
  ara: ["Salem", "Faisal", "Nasser", "Abdullah", "Saud", "Mohammed", "Khalid", "Yasser", "Turki"],
  usa: ["Taylor", "Chris", "Miles", "Brian", "Austin", "Ethan", "Caleb", "Gio", "Walker", "Paxton"],
  egy: ["Mahmoud", "Omar", "Youssef", "Karim"],
};

const LAST: Record<string, string[]> = {
  eng: ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Evans", "Walker", "Hall", "Clark", "Wright", "Green", "Baker", "Cooper", "Ward", "Morris", "Hughes"],
  spa: ["García", "López", "Martín", "Ruiz", "Hernández", "Navarro", "Torres", "Gil", "Serrano", "Vázquez", "Iglesias", "Castro"],
  ger: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Wagner", "Becker", "Hoffmann", "Schulz", "Koch", "Bauer", "Richter"],
  ita: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Greco", "Conti", "Gallo", "Costa"],
  fra: ["Bernard", "Dubois", "Laurent", "Michel", "Garcia", "David", "Robert", "Simon", "Moreau", "Fournier", "Girard"],
  por: ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Sousa", "Fernandes"],
  bra: ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Almeida", "Ribeiro", "Carvalho", "Gomes"],
  ned: ["de Jong", "van Dijk", "Bakker", "Visser", "Janssen", "Meijer", "de Boer", "Mulder", "Smit", "Bos"],
  bel: ["Peeters", "Janssens", "Maes", "Jacobs", "Willems", "Claes", "Goossens", "Wouters"],
  sco: ["Murray", "Campbell", "Stewart", "Robertson", "Thomson", "MacDonald", "Reid", "Fraser"],
  tur: ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Aydın", "Öztürk", "Arslan"],
  ara: ["Al-Harbi", "Al-Dawsari", "Al-Shehri", "Al-Mutairi", "Al-Qahtani", "Al-Otaibi", "Al-Amri"],
  usa: ["Johnson", "Williams", "Miller", "Davis", "Moore", "Anderson", "Thomas", "Jackson"],
  egy: ["Hassan", "Ibrahim", "Farouk", "Nasser"],
};

const REGION: Record<string, string> = {
  epl: "eng",
  cha: "eng",
  laliga: "spa",
  seg: "spa",
  bund: "ger",
  b2: "ger",
  seriea: "ita",
  serieb: "ita",
  ligue1: "fra",
  ligue2: "fra",
  prim: "por",
  bra: "bra",
  brb: "bra",
  ere: "ned",
  bel: "bel",
  sco: "sco",
  tur: "tur",
  spl: "ara",
  mls: "usa",
};

const TEMPLATE: Pos[] = [
  "GK", "GK",
  "LB", "LB",
  "RB", "RB",
  "CB", "CB", "CB", "CB",
  "CDM", "CDM",
  "CM", "CM", "CM",
  "CAM", "CAM",
  "LW", "LW",
  "RW", "RW",
  "ST", "ST", "ST",
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function attrBlock(ovr: number, pos: Pos, rand: () => number) {
  const j = () => (rand() - 0.5) * 10;
  const base: Record<Pos, [number, number, number, number, number, number]> = {
    GK: [ovr - 28, ovr - 30, ovr - 14, ovr - 22, ovr + 1, ovr - 6],
    LB: [ovr + 2, ovr - 16, ovr - 4, ovr - 4, ovr - 1, ovr - 4],
    RB: [ovr + 2, ovr - 16, ovr - 4, ovr - 4, ovr - 1, ovr - 4],
    CB: [ovr - 8, ovr - 18, ovr - 8, ovr - 12, ovr + 3, ovr + 2],
    CDM: [ovr - 4, ovr - 8, ovr + 1, ovr - 2, ovr + 2, ovr + 1],
    CM: [ovr - 2, ovr - 4, ovr + 2, ovr, ovr - 4, ovr - 2],
    CAM: [ovr, ovr + 1, ovr + 3, ovr + 2, ovr - 16, ovr - 6],
    LW: [ovr + 3, ovr, ovr - 1, ovr + 3, ovr - 18, ovr - 6],
    RW: [ovr + 3, ovr, ovr - 1, ovr + 3, ovr - 18, ovr - 6],
    ST: [ovr + 1, ovr + 4, ovr - 6, ovr, ovr - 22, ovr + 1],
  };
  const row = base[pos];
  const keys = ["pac", "sho", "pas", "dri", "def", "phy"] as const;
  const out = { pac: 50, sho: 40, pas: 50, dri: 50, def: 40, phy: 50 };
  keys.forEach((k, i) => {
    out[k] = clamp(Math.round(row[i] + j()), pos === "GK" && k === "def" ? 55 : 28, 97);
  });
  if (pos === "GK") out.def = clamp(ovr + Math.round(j() * 0.3), 60, 95);
  return out;
}

function makeVisual(seed: string, pos: Pos, partial?: Partial<Visual>): Visual {
  const h = hash(seed);
  return {
    skin: partial?.skin ?? h % 6,
    hair: partial?.hair ?? (h >> 3) % 6,
    hairStyle: partial?.hairStyle ?? (pos === "GK" && h % 5 === 0 ? 0 : (h >> 6) % 4),
    bulk: partial?.bulk ?? 0.92 + ((h >> 9) % 20) / 100,
  };
}

const HEIGHT: Record<Pos, [number, number]> = {
  GK: [186, 198],
  CB: [184, 196],
  LB: [176, 186],
  RB: [176, 186],
  CDM: [178, 190],
  CM: [174, 186],
  CAM: [170, 182],
  LW: [170, 182],
  RW: [170, 182],
  ST: [178, 192],
};

function buildClubPlayers(seed: Seed): Player[] {
  const rand = rng(hash(seed.id));
  const region = REGION[seed.league] ?? "eng";
  const stars = STARS.filter((s) => s.club === seed.id);
  const usedNum = new Set<number>();
  const players: Player[] = [];
  const takenNames = new Set<string>();

  const push = (p: Player) => {
    players.push(p);
    usedNum.add(p.num);
    takenNames.add(p.name);
  };

  for (const star of stars) {
    const stats = attrBlock(star.ovr, star.pos, rand);
    const id = `${seed.id}-${star.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    push({
      id,
      name: star.name,
      nat: star.nat,
      pos: star.pos,
      num: star.num,
      age: star.age ?? 26,
      height: star.height ?? 180,
      foot: star.foot ?? "R",
      ovr: star.ovr,
      pot: clamp(star.ovr + (star.age && star.age < 23 ? 6 : star.age && star.age > 32 ? 0 : 2), star.ovr, 95),
      ...stats,
      visual: makeVisual(id, star.pos, star.visual),
      tendencies: star.tendencies ?? [],
      clubId: seed.id,
    });
  }

  let i = 0;
  for (const pos of TEMPLATE) {
    if (players.filter((p) => p.pos === pos).length >= (pos === "GK" ? 2 : pos === "ST" || pos === "CB" ? 3 : 2) && players.length >= 18) {
      continue;
    }
    if (players.length >= 22) break;
    const already = players.filter((p) => p.pos === pos).length;
    const cap = pos === "GK" ? 2 : pos === "CB" || pos === "ST" || pos === "CM" ? 4 : 2;
    if (already >= cap) continue;
    const spread = (rand() - 0.45) * 14;
    const ovr = clamp(Math.round(seed.rep - 10 + spread - (pos === "GK" ? 1 : 0)), 62, seed.rep - 1);
    const fn = FIRST[region][Math.floor(rand() * FIRST[region].length)]!;
    const ln = LAST[region][Math.floor(rand() * LAST[region].length)]!;
    let name = `${fn} ${ln}`;
    let guard = 0;
    while (takenNames.has(name) && guard < 8) {
      name = `${FIRST[region][Math.floor(rand() * FIRST[region].length)]} ${ln}`;
      guard++;
    }
    let num = 1 + Math.floor(rand() * 40);
    while (usedNum.has(num)) num = 1 + Math.floor(rand() * 98);
    const age = clamp(Math.round(18 + rand() * 16), 17, 36);
    const [h0, h1] = HEIGHT[pos];
    const id = `${seed.id}-g${i++}`;
    const stats = attrBlock(ovr, pos, rand);
    push({
      id,
      name,
      nat: LEAGUES.find((l) => l.id === seed.league)?.nation ?? "ENG",
      pos,
      num,
      age,
      height: Math.round(h0 + rand() * (h1 - h0)),
      foot: rand() < 0.18 ? "L" : "R",
      ovr,
      pot: clamp(ovr + (age < 23 ? Math.round(2 + rand() * 8) : age > 30 ? 0 : Math.round(rand() * 3)), ovr, 92),
      ...stats,
      visual: makeVisual(id, pos),
      tendencies: [],
      clubId: seed.id,
    });
  }
  return players.sort((a, b) => b.ovr - a.ovr);
}

export const CLUBS: Club[] = SEEDS.map(({ id, name, short, league, city, kit, stadium, rep }) => ({
  id,
  name,
  short,
  league,
  city,
  kit,
  stadium,
  rep,
}));

const CLUB_PLAYERS: Record<string, Player[]> = {};
for (const seed of SEEDS) CLUB_PLAYERS[seed.id] = buildClubPlayers(seed);

const ALL_PLAYERS: Player[] = Object.values(CLUB_PLAYERS).flat();

const NAT_SQUADS: Record<string, Player[]> = {};
for (const nation of NATIONS) {
  const pool = ALL_PLAYERS.filter((p) => p.nat === nation.id).sort((a, b) => b.ovr - a.ovr);
  const picked: Player[] = [];
  const gks = pool.filter((p) => p.pos === "GK").slice(0, 2);
  picked.push(...gks);
  for (const p of pool) {
    if (picked.length >= 20) break;
    if (!picked.includes(p)) picked.push(p);
  }
  const rand = rng(hash(nation.id + "-nat"));
  let n = 0;
  while (picked.length < 18) {
    const pos = TEMPLATE[picked.length % TEMPLATE.length]!;
    const ovr = clamp(72 + Math.round(rand() * 8), 68, 82);
    const id = `nat-${nation.id}-${n++}`;
    const stats = attrBlock(ovr, pos, rand);
    const region = nation.id === "BRA" ? "bra" : nation.id === "ESP" ? "spa" : nation.id === "FRA" ? "fra" : nation.id === "GER" ? "ger" : nation.id === "ITA" ? "ita" : nation.id === "POR" ? "por" : nation.id === "NED" ? "ned" : nation.id === "USA" || nation.id === "MEX" ? "usa" : "eng";
    const name = `${FIRST[region]![n % FIRST[region]!.length]} ${LAST[region]![(n * 3) % LAST[region]!.length]}`;
    picked.push({
      id,
      name,
      nat: nation.id,
      pos,
      num: 1 + ((n * 7) % 26),
      age: 22 + (n % 10),
      height: 178 + (n % 12),
      foot: "R",
      ovr,
      pot: ovr + 2,
      ...stats,
      visual: makeVisual(id, pos),
      tendencies: [],
      clubId: `nat-${nation.id}`,
    });
  }
  NAT_SQUADS[nation.id] = picked;
}

export function getClub(id: string): Club | undefined {
  return CLUBS.find((c) => c.id === id);
}

export function getLeague(id: string): League | undefined {
  return LEAGUES.find((l) => l.id === id);
}

export function getNation(id: string): Nation | undefined {
  return NATIONS.find((n) => n.id === id);
}

export function squadOf(clubId: string): Player[] {
  return (CLUB_PLAYERS[clubId] ?? []).map((p) => ({ ...p, visual: { ...p.visual } }));
}

export function nationSquad(id: string): Player[] {
  return (NAT_SQUADS[id] ?? []).map((p) => ({ ...p, visual: { ...p.visual } }));
}

export function clubsIn(leagueId: string): Club[] {
  return CLUBS.filter((c) => c.league === leagueId).sort((a, b) => b.rep - a.rep);
}

export function findPlayer(id: string): Player | undefined {
  return ALL_PLAYERS.find((p) => p.id === id) ?? Object.values(NAT_SQUADS).flat().find((p) => p.id === id);
}

export function searchPlayers(q: string, leagueId?: string, pos?: Pos): Player[] {
  const query = q.trim().toLowerCase();
  let list = ALL_PLAYERS;
  if (leagueId) {
    const ids = new Set(CLUBS.filter((c) => c.league === leagueId).map((c) => c.id));
    list = list.filter((p) => ids.has(p.clubId));
  }
  if (pos) list = list.filter((p) => p.pos === pos);
  if (query) {
    list = list.filter((p) => p.name.toLowerCase().includes(query) || p.nat.toLowerCase().includes(query));
  }
  return [...list].sort((a, b) => b.ovr - a.ovr).slice(0, 60);
}

export function allPlayers(): Player[] {
  return ALL_PLAYERS;
}

export function playerValue(p: Pick<Player, "ovr" | "age" | "pot">): number {
  const prime = Math.max(0.4, 1 - Math.abs(p.age - 27) * 0.045);
  const growth = 1 + Math.max(0, p.pot - p.ovr) * 0.035;
  const millions = Math.pow(Math.max(0.4, (p.ovr - 55) / 20), 2.35) * 16 * prime * growth;
  return Math.round(millions * 1_000_000);
}

export function wageOf(p: Player): number {
  return Math.round(playerValue(p) / 220);
}

export function formatMoney(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m`;
  if (n >= 1_000) return `€${Math.round(n / 1000)}k`;
  return `€${n}`;
}

export function expandedStats(p: Player): { group: string; rows: [string, number][] }[] {
  const h = (salt: string, base: number) => clamp(Math.round(base + ((hash(p.id + salt) % 9) - 4)), 1, 99);
  const gk = p.pos === "GK";
  return [
    {
      group: "Pace",
      rows: [
        ["Acceleration", h("acc", p.pac + (gk ? 8 : 1))],
        ["Sprint speed", h("spr", p.pac)],
      ],
    },
    {
      group: "Shooting",
      rows: [
        ["Finishing", h("fin", gk ? 18 : p.pos === "ST" ? p.sho + 3 : p.sho - 2)],
        ["Shot power", h("pow", gk ? 40 : p.sho)],
        ["Long shots", h("lng", gk ? 16 : p.pos === "CAM" || p.pos === "CM" ? p.sho + 4 : p.sho - 6)],
        ["Volleys", h("vol", gk ? 14 : p.sho - 4)],
        ["Penalties", h("pen", gk ? 20 : p.sho - 2)],
      ],
    },
    {
      group: "Passing",
      rows: [
        ["Vision", h("vis", p.pas + (p.pos === "CAM" ? 4 : 0))],
        ["Crossing", h("cro", p.pos === "LW" || p.pos === "RW" || p.pos === "LB" || p.pos === "RB" ? p.pas + 6 : p.pas - 4)],
        ["Short passing", h("shp", p.pas + 2)],
        ["Long passing", h("lop", gk ? p.pas + 6 : p.pas - 1)],
      ],
    },
    {
      group: "Dribbling",
      rows: [
        ["Ball control", h("bc", p.dri)],
        ["Dribbling", h("dr", p.dri + (p.pos === "LW" || p.pos === "RW" ? 3 : 0))],
        ["Agility", h("ag", p.dri - 2)],
        ["Balance", h("bal", p.phy - 6)],
        ["Composure", h("com", p.ovr - 3)],
        ["Reactions", h("rea", p.ovr)],
      ],
    },
    {
      group: "Defending",
      rows: [
        ["Interceptions", h("int", gk ? p.def - 8 : p.def)],
        ["Tackling", h("tac", gk ? 20 : p.def + 1)],
        ["Heading", h("hea", p.pos === "CB" || p.pos === "ST" ? p.phy + 2 : p.phy - 8)],
      ],
    },
    {
      group: "Physical",
      rows: [
        ["Strength", h("str", p.phy)],
        ["Stamina", h("sta", clamp(78 + (30 - p.age), 55, 92))],
        ["Jumping", h("jum", p.phy - 2)],
        ["Aggression", h("agg", p.pos === "CDM" || p.pos === "CB" ? p.phy + 4 : p.phy - 4)],
      ],
    },
    {
      group: "Goalkeeping",
      rows: [
        ["Diving", h("div", gk ? p.ovr + 1 : 12)],
        ["Handling", h("han", gk ? p.ovr - 1 : 12)],
        ["Kicking", h("kik", gk ? p.pas + 8 : 18)],
        ["Reflexes", h("ref", gk ? p.ovr + 2 : 14)],
        ["Positioning", h("gkp", gk ? p.ovr : 16)],
        ["Reach", h("rch", gk ? p.height > 192 ? p.ovr + 3 : p.ovr - 1 : 10)],
      ],
    },
  ];
}

export function roleBlurb(p: Player): string {
  if (p.tendencies.length) return p.tendencies.join(" · ");
  const map: Record<Pos, string> = {
    GK: "Shot stopper · Claims crosses",
    LB: "Overlapping full-back",
    RB: "Overlapping full-back",
    CB: "Positional defender",
    CDM: "Shields the back line",
    CM: "Links play both ways",
    CAM: "Arrives between the lines",
    LW: "Stretches the flank",
    RW: "Stretches the flank",
    ST: "Leads the line",
  };
  return map[p.pos];
}

export const DB_NOTE =
  "Unofficial database. Names are public identifiers. Kits, badges, and ratings are original estimates — not licensed by any league, club, or EA Sports.";
