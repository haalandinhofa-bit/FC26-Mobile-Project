import { useEffect, useMemo, useState } from "react";
import { CLUBS, DB_NOTE, LEAGUES, NATIONS, expandedStats, formatMoney, getClub, getNation, playerValue, roleBlurb, searchPlayers, wageOf } from "@/game/data";
import { makeClubSide, makeNationSide, ensurePlayerStarts, type Side } from "@/game/lineup";
import { createMixer, type Mixer } from "@/game/audio";
import type { MatchConfig } from "@/game/engine";
import { simScore } from "@/game/engine";
import {
  applyPersonal,
  applyScore,
  createManager,
  createPlayerCareer,
  leagueComplete,
  marketList,
  newSeason,
  nextUserFixture,
  offerFor,
  opponentSide,
  sellPlayer,
  setTactics,
  simOtherFixtures,
  simUserFixture,
  squadOvr,
  train,
  tryBuy,
  userSide,
} from "@/game/career";
import { exportStore, importStore, loadStore, tableFrom, writeStore, type CareerSave, type Store } from "@/game/save";
import { createTournament, groupTable, nextTie, recordTie, simRest } from "@/game/tournament";
import { FORMATION_IDS, defaultTactics, type Difficulty, type FormationId, type Player, type Pos, type Settings, type Tactics, type Weather } from "@/game/types";
import { MatchView } from "@/components/ninety/match-view";

type Screen =
  | "boot"
  | "menu"
  | "modes"
  | "kickoff"
  | "tournament"
  | "thub"
  | "career"
  | "newmgr"
  | "newplr"
  | "dash"
  | "squad"
  | "tactics"
  | "market"
  | "table"
  | "fixtures"
  | "database"
  | "profile"
  | "settings"
  | "saves"
  | "about"
  | "match";

const mixer: Mixer = createMixer();

export function GameApp() {
  const [store, setStore] = useState<Store | null>(null);
  const [screen, setScreen] = useState<Screen>("boot");
  const [stack, setStack] = useState<Screen[]>([]);
  const [slot, setSlot] = useState(0);
  const [profile, setProfile] = useState<Player | null>(null);
  const [match, setMatch] = useState<MatchConfig | null>(null);
  const [returnTo, setReturnTo] = useState<Screen>("menu");
  const [note, setNote] = useState("");
  const [ask, setAsk] = useState<{ text: string; go: () => void } | null>(null);
  const [kick, setKick] = useState({
    kind: "club" as "club" | "nation",
    home: "mci",
    away: "liv",
    side: 0 as 0 | 1,
    difficulty: "normal" as Difficulty,
    lengthMin: 6 as 4 | 6 | 8 | 10,
    weather: "night" as Weather,
    formation: "4-3-3" as FormationId,
    knockout: false,
    mode: "match" as MatchConfig["mode"],
  });

  useEffect(() => {
    const loaded = loadStore();
    setStore(loaded);
    setKick((k) => ({ ...k, difficulty: loaded.settings.difficulty, lengthMin: loaded.settings.lengthMin }));
  }, []);

  useEffect(() => {
    if (!store) return;
    mixer.setVolumes(store.settings.sfx, store.settings.crowd);
  }, [store]);

  const save = store?.slots[slot] ?? null;

  function persist(next: Store) {
    setStore(next);
    const res = writeStore(next);
    if (!res.ok) setNote(res.error ?? "Save failed.");
    else setNote("");
  }

  function go(next: Screen) {
    setStack((s) => [...s, screen]);
    setScreen(next);
    mixer.play("ui");
  }
  function back() {
    setStack((s) => {
      const copy = [...s];
      const prev = copy.pop();
      setScreen(prev ?? "menu");
      return copy;
    });
  }
  function jump(next: Screen) {
    setStack([]);
    setScreen(next);
  }

  function updateSettings(patch: Partial<Settings>) {
    if (!store) return;
    persist({ ...store, settings: { ...store.settings, ...patch } });
  }

  function updateCareer(next: CareerSave) {
    if (!store) return;
    const slots = [...store.slots] as Store["slots"];
    slots[slot] = next;
    persist({ ...store, slots });
  }

  function startMatch(cfg: MatchConfig, ret: Screen) {
    setMatch(cfg);
    setReturnTo(ret);
    setScreen("match");
  }

  function onMatchExit(result: { home: number; away: number; pens: [number, number] | null; ratings: { id: string; goals: number; assists: number; rating: number }[] } | null) {
    if (!store) return;
    const settings = store.settings;
    if (result && save && returnTo === "dash") {
      const fix = nextUserFixture(save);
      if (fix) {
        let next = simOtherFixtures(save);
        const pens = result.pens && result.home === result.away ? result.pens : undefined;
        next = applyScore(next, fix.id, result.home, result.away, pens);
        if (next.playerId) {
          const me = result.ratings.find((r) => r.id === next.playerId);
          if (me) next = applyPersonal(next, me.goals, me.assists, me.rating);
        }
        const slots = [...store.slots] as Store["slots"];
        slots[slot] = next;
        const gf = fix.home === save.clubId ? result.home : result.away;
        const ga = fix.home === save.clubId ? result.away : result.home;
        persist({
          ...store,
          slots,
          settings,
          career: {
            matches: store.career.matches + 1,
            goals: store.career.goals + gf,
            wins: store.career.wins + (gf > ga ? 1 : 0),
          },
        });
      }
    }
    if (result && store.tournament && returnTo === "thub") {
      const tie = nextTie(store.tournament);
      if (tie) {
        let t = simRest(store.tournament, () => simScore(78, 76, Math.random));
        t = recordTie(t, tie.id, result.home, result.away, result.home === result.away ? result.pens : null);
        persist({ ...store, tournament: t });
      }
    }
    setMatch(null);
    jump(returnTo === "match" ? "menu" : returnTo);
  }

  if (!store || screen === "boot") {
    return (
      <main className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-6 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
          <div className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-[linear-gradient(180deg,transparent,rgba(214,255,63,0.08))]" />
          <div className="absolute bottom-[18%] left-1/2 h-40 w-[140%] -translate-x-1/2 rounded-[100%] border border-line" />
          <div className="absolute bottom-[28%] left-1/2 h-px w-[80%] -translate-x-1/2 bg-line" />
        </div>
        <p className="font-display text-sm tracking-[0.45em] text-accent">MATCHDAY FOOTBALL</p>
        <h1 className="font-display text-7xl leading-none tracking-wide sm:text-8xl">NINETY</h1>
        <p className="mt-3 max-w-md text-muted">Eleven versus eleven. Kick off, cups, and careers — built for a phone in landscape.</p>
        <button
          type="button"
          className="mt-8 rounded-full bg-accent px-8 py-3 font-semibold text-ink"
          onClick={() => {
            // Let the user enter even if this Android WebView cannot start audio.
            setScreen("menu");
            try {
              mixer.unlock();
            } catch {
              // Audio is non-essential; gameplay remains available silently.
            }
          }}
        >
          Tap to enter
        </button>
        <p className="mt-6 max-w-lg text-xs text-muted">Unofficial simulation. Not affiliated with EA Sports, FIFA, or any league or club.</p>
      </main>
    );
  }

  if (screen === "match" && match) {
    return <MatchView config={match} settings={store.settings} mixer={mixer} onExit={onMatchExit} />;
  }

  const settings = store.settings;

  return (
    <main className="flex h-dvh flex-col bg-bg">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          {screen !== "menu" ? (
            <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={back}>
              Back
            </button>
          ) : null}
          <span className="font-display text-xl tracking-[0.2em]">NINETY</span>
        </div>
        <p className="hidden text-sm text-muted sm:block">{titleOf(screen)}</p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {screen === "menu" ? <Menu onGo={go} hasSave={store.slots.some(Boolean)} /> : null}
        {screen === "modes" ? (
          <Modes
            onKick={() => go("kickoff")}
            onTournament={() => go("tournament")}
            onManager={() => go("career")}
            onPlayer={() => go("newplr")}
            onTrain={() => {
              const home = makeClubSide("mci");
              const away = makeClubSide("liv");
              startMatch(configFrom(home, away, 0, settings, "practice", false, kick.weather), "modes");
            }}
            onPens={() => {
              const home = makeClubSide(kick.home);
              const away = makeClubSide(kick.away);
              startMatch(configFrom(home, away, 0, settings, "shootout", true, "night"), "modes");
            }}
            onData={() => go("database")}
          />
        ) : null}
        {screen === "kickoff" ? (
          <Kickoff
            kick={kick}
            setKick={setKick}
            onStart={() => {
              const home = kick.kind === "club" ? makeClubSide(kick.home, { ...defaultTactics(kick.formation), formation: kick.formation }) : makeNationSide(kick.home, { ...defaultTactics(kick.formation), formation: kick.formation });
              const away = kick.kind === "club" ? makeClubSide(kick.away) : makeNationSide(kick.away);
              startMatch(
                configFrom(home, away, kick.side, { ...settings, difficulty: kick.difficulty, lengthMin: kick.lengthMin }, kick.mode, kick.knockout, kick.weather),
                "menu",
              );
            }}
          />
        ) : null}
        {screen === "tournament" ? (
          <TournamentSetup
            onCreate={(t) => {
              persist({ ...store, tournament: t });
              jump("thub");
            }}
          />
        ) : null}
        {screen === "thub" && store.tournament ? (
          <TournamentHub
            t={store.tournament}
            onPlay={() => {
              const t = store.tournament!;
              const tie = nextTie(t);
              if (!tie) return;
              const home = t.kind === "club" ? makeClubSide(tie.home) : makeNationSide(tie.home);
              const away = t.kind === "club" ? makeClubSide(tie.away) : makeNationSide(tie.away);
              const user = tie.home === t.userId ? 0 : 1;
              startMatch(
                configFrom(home, away, user as 0 | 1, { ...settings, difficulty: t.difficulty, lengthMin: t.lengthMin }, "match", true, t.weather),
                "thub",
              );
            }}
            onSim={() => {
              if (!store.tournament) return;
              const t = simRest(store.tournament, () => simScore(78, 76, Math.random));
              const tie = nextTie(store.tournament);
              if (!tie) {
                persist({ ...store, tournament: t });
                return;
              }
              const [hg, ag] = simScore(80, 78, Math.random);
              persist({ ...store, tournament: recordTie(t, tie.id, hg, ag) });
            }}
          />
        ) : null}
        {screen === "career" ? (
          <CareerHome
            store={store}
            onNew={() => go("newmgr")}
            onContinue={(i) => {
              setSlot(i);
              jump("dash");
            }}
            onDelete={(i) =>
              setAsk({
                text: "Delete this career? This cannot be undone.",
                go: () => {
                  const slots = [...store.slots] as Store["slots"];
                  slots[i] = null;
                  persist({ ...store, slots });
                  setAsk(null);
                },
              })
            }
          />
        ) : null}
        {screen === "newmgr" ? (
          <NewManager
            onCreate={(clubId, name, i) => {
              const career = createManager(clubId, name);
              const slots = [...store.slots] as Store["slots"];
              const write = () => {
                slots[i] = career;
                setSlot(i);
                persist({ ...store, slots });
                jump("dash");
              };
              if (slots[i]) setAsk({ text: "Overwrite this save slot?", go: () => { write(); setAsk(null); } });
              else write();
            }}
          />
        ) : null}
        {screen === "newplr" ? (
          <NewPlayer
            onCreate={(opts, i) => {
              const career = createPlayerCareer(opts);
              const slots = [...store.slots] as Store["slots"];
              const write = () => {
                slots[i] = career;
                setSlot(i);
                persist({ ...store, slots });
                jump("dash");
              };
              if (slots[i]) setAsk({ text: "Overwrite this save slot?", go: () => { write(); setAsk(null); } });
              else write();
            }}
          />
        ) : null}
        {screen === "dash" && save ? (
          <Dashboard
            save={save}
            onPlay={() => {
              const fix = nextUserFixture(save);
              if (!fix) return;
              let home = fix.home === save.clubId ? userSide(save) : opponentSide(save, fix.home);
              let away = fix.away === save.clubId ? userSide(save) : opponentSide(save, fix.away);
              const user = (fix.home === save.clubId ? 0 : 1) as 0 | 1;
              let lock: string | undefined;
              if (save.playerId) {
                const me = save.squad.find((p) => p.id === save.playerId);
                if (me) {
                  if (user === 0) home = ensurePlayerStarts(home, me.id, me.pos);
                  else away = ensurePlayerStarts(away, me.id, me.pos);
                  lock = me.id;
                }
              }
              const cfg = configFrom(home, away, user, settings, "match", fix.comp === "cup", "night");
              startMatch(lock ? { ...cfg, lockId: lock } : cfg, "dash");
            }}
            onSim={() => updateCareer(simUserFixture(save))}
            onTrain={(key) => updateCareer(train(save, key))}
            onNav={go}
            onSeason={() => updateCareer(newSeason(save))}
            done={leagueComplete(save)}
          />
        ) : null}
        {screen === "squad" && save ? <Squad save={save} onOpen={(p) => { setProfile(p); go("profile"); }} /> : null}
        {screen === "tactics" && save ? <TacticsPanel tactics={save.tactics} squad={save.squad} onChange={(t) => updateCareer(setTactics(save, t))} /> : null}
        {screen === "market" && save ? (
          <Market
            save={save}
            onBuy={(id, kind) => {
              const p = marketList(save).find((x) => x.id === id);
              if (!p) return;
              const res = tryBuy(save, id, offerFor(p, kind));
              setNote(res.msg);
              if (res.ok) updateCareer(res.save);
            }}
            onSell={(id) => {
              const res = sellPlayer(save, id);
              setNote(res.msg);
              if (res.ok) updateCareer(res.save);
            }}
          />
        ) : null}
        {screen === "table" && save ? <LeagueTable save={save} /> : null}
        {screen === "fixtures" && save ? <Fixtures save={save} /> : null}
        {screen === "database" ? (
          <Database
            onOpen={(p) => {
              setProfile(p);
              go("profile");
            }}
          />
        ) : null}
        {screen === "profile" && profile ? <Profile player={profile} /> : null}
        {screen === "settings" ? <SettingsPanel settings={settings} onChange={updateSettings} /> : null}
        {screen === "saves" ? (
          <Saves
            store={store}
            note={note}
            onExport={() => {
              const blob = new Blob([exportStore(store)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "ninety-save.json";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
            onImport={(text) => {
              const next = importStore(text);
              if (!next) setNote("That file is not a NINETY save.");
              else {
                persist(next);
                setNote("Save imported into this browser.");
              }
            }}
          />
        ) : null}
        {screen === "about" ? <About /> : null}
        {note && screen !== "saves" ? <p className="mt-4 text-sm text-accent">{note}</p> : null}
      </div>
      {ask ? (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/80 p-6">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5">
            <p>{ask.text}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-full bg-accent px-4 py-2 font-semibold text-ink" onClick={ask.go}>
                Confirm
              </button>
              <button type="button" className="rounded-full border border-line px-4 py-2" onClick={() => setAsk(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function gaRemoved() {
  return null;
}

function requireLineup() {
  return { ensurePlayerStarts: (side: Side, id: string, pos: Pos) => {
    const all = [...side.xi, ...side.bench];
    if (side.xi.some((p) => p.id === id)) return side;
    const me = all.find((p) => p.id === id);
    if (!me) return side;
    let replace = 1;
    let worst = 999;
    side.xi.forEach((p, i) => {
      if (p.pos === "GK") return;
      const bias = p.pos === pos ? 0 : 8;
      if (p.ovr + bias < worst) {
        worst = p.ovr + bias;
        replace = i;
      }
    });
    const xi = [...side.xi];
    const dropped = xi[replace];
    if (!dropped) return side;
    xi[replace] = me;
    return { ...side, xi, bench: [...side.bench.filter((p) => p.id !== id), dropped] };
  } };
}

function withLock(cfg: MatchConfig, id: string): MatchConfig {
  return { ...cfg, lockId: id, mode: "match" };
}

function configFrom(home: Side, away: Side, userTeam: 0 | 1, settings: Settings, mode: MatchConfig["mode"], knockout: boolean, weather: Weather): MatchConfig {
  return {
    home,
    away,
    userTeam,
    lengthSec: settings.lengthMin * 60,
    difficulty: settings.difficulty,
    weather,
    assistance: settings.assistance,
    mode,
    knockout,
  };
}

function titleOf(screen: Screen) {
  const map: Record<Screen, string> = {
    boot: "",
    menu: "Main menu",
    modes: "Play",
    kickoff: "Kick off",
    tournament: "Tournament",
    thub: "Tournament",
    career: "Careers",
    newmgr: "New manager",
    newplr: "New player",
    dash: "Career",
    squad: "Squad",
    tactics: "Tactics",
    market: "Transfers",
    table: "Table",
    fixtures: "Fixtures",
    database: "Database",
    profile: "Player",
    settings: "Settings",
    saves: "Saves",
    about: "About",
    match: "Match",
  };
  return map[screen];
}

function Menu({ onGo, hasSave }: { onGo: (s: Screen) => void; hasSave: boolean }) {
  const items: { s: Screen; k: string; d: string }[] = [
    { s: "modes", k: "Play", d: "Kick off, cups, training, penalties" },
    { s: "career", k: hasSave ? "Continue career" : "Career", d: "Manager or player, saved in this browser" },
    { s: "database", k: "Database", d: "Clubs, nations, and player profiles" },
    { s: "settings", k: "Settings", d: "Graphics, controls, audio" },
    { s: "saves", k: "Saves", d: "Slots, export, and import" },
    { s: "about", k: "About this build", d: "What is playable, and what is not" },
  ];
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <button key={item.s} type="button" className="rounded-2xl border border-line bg-surface p-4 text-left" onClick={() => onGo(item.s)}>
          <span className="font-display text-2xl tracking-wide">{item.k}</span>
          <span className="mt-1 block text-sm text-muted">{item.d}</span>
        </button>
      ))}
    </div>
  );
}

function Modes(props: { onKick: () => void; onTournament: () => void; onManager: () => void; onPlayer: () => void; onTrain: () => void; onPens: () => void; onData: () => void }) {
  const rows = [
    ["Kick off", "Pick two sides and play", props.onKick],
    ["Tournament", "Two groups of four, semis, final, third place", props.onTournament],
    ["Manager career", "League, cup, transfers", props.onManager],
    ["Player career", "One footballer, ratings, training", props.onPlayer],
    ["Training", "Open pitch. Reset the ball whenever you want", props.onTrain],
    ["Penalties", "A shootout from the spot", props.onPens],
    ["Database", "Browse the unofficial roster", props.onData],
  ] as const;
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
      {rows.map(([k, d, fn]) => (
        <button key={k} type="button" className="rounded-2xl border border-line bg-surface px-4 py-3 text-left" onClick={fn}>
          <span className="font-display text-xl">{k}</span>
          <span className="block text-sm text-muted">{d}</span>
        </button>
      ))}
      <button type="button" disabled className="rounded-2xl border border-line px-4 py-3 text-left opacity-50">
        <span className="font-display text-xl">Online</span>
        <span className="block text-sm text-muted">Unavailable in this build — no network play is simulated.</span>
      </button>
    </div>
  );
}

function Kickoff({
  kick,
  setKick,
  onStart,
}: {
  kick: { kind: "club" | "nation"; home: string; away: string; side: 0 | 1; difficulty: Difficulty; lengthMin: 4 | 6 | 8 | 10; weather: Weather; formation: FormationId; knockout: boolean; mode: MatchConfig["mode"] };
  setKick: (k: typeof kick) => void;
  onStart: () => void;
}) {
  const [q, setQ] = useState("");
  const clubs = CLUBS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const nations = NATIONS.filter((n) => n.name.toLowerCase().includes(q.toLowerCase()));
  const list = kick.kind === "club" ? clubs : nations;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Chip on={kick.kind === "club"} label="Clubs" onClick={() => setKick({ ...kick, kind: "club", home: "mci", away: "liv" })} />
        <Chip on={kick.kind === "nation"} label="Nations" onClick={() => setKick({ ...kick, kind: "nation", home: "BRA", away: "ARG" })} />
        <Chip on={kick.side === 0} label="You: home" onClick={() => setKick({ ...kick, side: 0 })} />
        <Chip on={kick.side === 1} label="You: away" onClick={() => setKick({ ...kick, side: 1 })} />
        <Chip on={kick.knockout} label={kick.knockout ? "Knockout: on" : "Knockout: off"} onClick={() => setKick({ ...kick, knockout: !kick.knockout })} />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Select label="Difficulty" value={kick.difficulty} options={["easy", "normal", "hard", "world"]} onChange={(difficulty) => setKick({ ...kick, difficulty: difficulty as Difficulty })} />
        <Select label="Length" value={String(kick.lengthMin)} options={["4", "6", "8", "10"]} onChange={(v) => setKick({ ...kick, lengthMin: Number(v) as 4 | 6 | 8 | 10 })} />
        <Select label="Conditions" value={kick.weather} options={["night", "day", "overcast", "rain"]} onChange={(weather) => setKick({ ...kick, weather: weather as Weather })} />
      </div>
      <label className="text-sm text-muted">
        Search
        <input className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-3" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Club or nation" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <TeamPick title="Home" active={kick.home} list={list} kind={kick.kind} onPick={(home) => setKick({ ...kick, home })} />
        <TeamPick title="Away" active={kick.away} list={list} kind={kick.kind} onPick={(away) => setKick({ ...kick, away })} />
      </div>
      <button type="button" className="rounded-full bg-accent px-6 py-3 font-semibold text-ink" onClick={onStart} disabled={kick.home === kick.away}>
        Start match
      </button>
    </div>
  );
}

function TeamPick({ title, active, list, kind, onPick }: { title: string; active: string; list: { id: string; name: string; kit?: [string, string, string] }[]; kind: "club" | "nation"; onPick: (id: string) => void }) {
  const shown = list.slice(0, 12);
  return (
    <div>
      <p className="mb-2 font-display tracking-wide">{title}</p>
      <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {shown.map((t) => {
          const kit = kind === "club" ? getClub(t.id)?.kit : getNation(t.id)?.kit;
          return (
            <button key={t.id} type="button" className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-left ${active === t.id ? "border-accent" : "border-line"}`} onClick={() => onPick(t.id)}>
              {kit ? <Crest kit={kit} short={t.name.slice(0, 3).toUpperCase()} /> : null}
              <span className="text-sm">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TournamentSetup({ onCreate }: { onCreate: (t: ReturnType<typeof createTournament>) => void }) {
  const [kind, setKind] = useState<"club" | "nation">("club");
  const [userId, setUserId] = useState("mci");
  const [q, setQ] = useState("");
  const pool = kind === "club" ? CLUBS.map((c) => c.id) : NATIONS.map((n) => n.id);
  const list = (kind === "club" ? CLUBS : NATIONS).filter((t) => t.name.toLowerCase().includes(q.toLowerCase())).slice(0, 14);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <div className="flex gap-2">
        <Chip on={kind === "club"} label="Clubs" onClick={() => { setKind("club"); setUserId("mci"); }} />
        <Chip on={kind === "nation"} label="Nations" onClick={() => { setKind("nation"); setUserId("BRA"); }} />
      </div>
      <input className="rounded-xl border border-line bg-surface px-3 py-3" value={q} placeholder="Find your side" onChange={(e) => setQ(e.target.value)} />
      <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
        {list.map((t) => (
          <button key={t.id} type="button" className={`rounded-xl border px-3 py-2 text-left ${userId === t.id ? "border-accent" : "border-line"}`} onClick={() => setUserId(t.id)}>
            {t.name}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="rounded-full bg-accent px-5 py-3 font-semibold text-ink"
        onClick={() => onCreate(createTournament({ name: kind === "club" ? "Club Cup" : "Nations Cup", kind, userId, pool, difficulty: "normal", lengthMin: 6, weather: "night" }))}
      >
        Create tournament
      </button>
    </div>
  );
}

function TournamentHub({ t, onPlay, onSim }: { t: NonNullable<Store["tournament"]>; onPlay: () => void; onSim: () => void }) {
  const nameOf = (id: string) => (t.kind === "club" ? getClub(id)?.name : getNation(id)?.name) ?? id;
  const tie = nextTie(t);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h2 className="font-display text-3xl">{t.name}</h2>
      <p className="text-muted capitalize">{t.stage === "done" ? "Tournament complete" : `${t.stage} stage`}</p>
      {tie ? (
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-sm text-muted">Your next tie</p>
          <p className="font-display text-2xl">{nameOf(tie.home)} vs {nameOf(tie.away)}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="rounded-full bg-accent px-4 py-2 font-semibold text-ink" onClick={onPlay}>Play</button>
            <button type="button" className="rounded-full border border-line px-4 py-2" onClick={onSim}>Sim</button>
          </div>
        </div>
      ) : (
        <button type="button" className="w-fit rounded-full border border-line px-4 py-2" onClick={onSim}>Sim remaining</button>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {t.groups.map((g, i) => (
          <table key={i} className="w-full text-left text-sm">
            <caption className="mb-1 text-left font-display">Group {i + 1}</caption>
            <tbody>
              {groupTable(g, t.fixtures).map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className="py-1">{nameOf(r.id)}</td>
                  <td>{r.pts}</td>
                  <td className="text-muted">{r.gf - r.ga}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      {t.semis.length ? (
        <div>
          <p className="font-display">Knockout</p>
          {[...t.semis, t.final, t.third].filter(Boolean).map((f) => (
            <p key={f!.id} className="text-sm">
              {f!.id === "third" ? "Third" : f!.id === "final" ? "Final" : "Semi"}: {nameOf(f!.home)} {f!.hg ?? "-"}–{f!.ag ?? "-"} {nameOf(f!.away)}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CareerHome({ store, onNew, onContinue, onDelete }: { store: Store; onNew: () => void; onContinue: (i: number) => void; onDelete: (i: number) => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <button type="button" className="rounded-full bg-accent px-5 py-3 font-semibold text-ink" onClick={onNew}>New manager career</button>
      {store.slots.map((s, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-sm text-muted">Slot {i + 1}</p>
          {s ? (
            <>
              <p className="font-display text-2xl">{s.name}</p>
              <p className="text-sm text-muted">{getClub(s.clubId)?.name} · season {s.season} · {s.kind}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink" onClick={() => onContinue(i)}>Continue</button>
                <button type="button" className="rounded-full border border-danger px-4 py-2 text-sm text-danger" onClick={() => onDelete(i)}>Delete</button>
              </div>
            </>
          ) : (
            <p className="text-muted">Empty</p>
          )}
        </div>
      ))}
      <p className="text-xs text-muted">Careers are stored in this browser only. Export a file from Saves if you want a backup.</p>
    </div>
  );
}

function NewManager({ onCreate }: { onCreate: (clubId: string, name: string, slot: number) => void }) {
  const [league, setLeague] = useState("epl");
  const [clubId, setClubId] = useState("mci");
  const [name, setName] = useState("A. Cole");
  const [slot, setSlot] = useState(0);
  const clubs = CLUBS.filter((c) => c.league === league);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <label className="text-sm text-muted">Your name
        <input className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-3" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <Select label="League" value={league} options={LEAGUES.map((l) => l.id)} labels={Object.fromEntries(LEAGUES.map((l) => [l.id, l.name]))} onChange={(id) => { setLeague(id); const first = CLUBS.find((c) => c.league === id); if (first) setClubId(first.id); }} />
      <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {clubs.map((c) => (
          <button key={c.id} type="button" className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-left ${clubId === c.id ? "border-accent" : "border-line"}`} onClick={() => setClubId(c.id)}>
            <Crest kit={c.kit} short={c.short} />
            <span>{c.name}</span>
            <span className="ml-auto text-sm text-muted">{c.stadium}</span>
          </button>
        ))}
      </div>
      <Select label="Save slot" value={String(slot)} options={["0", "1", "2"]} labels={{ "0": "Slot 1", "1": "Slot 2", "2": "Slot 3" }} onChange={(v) => setSlot(Number(v))} />
      <button type="button" className="rounded-full bg-accent px-5 py-3 font-semibold text-ink" onClick={() => onCreate(clubId, name, slot)}>Start season</button>
    </div>
  );
}

function NewPlayer({ onCreate }: { onCreate: (opts: Parameters<typeof createPlayerCareer>[0], slot: number) => void }) {
  const [name, setName] = useState("Jordan Hale");
  const [nat, setNat] = useState("ENG");
  const [pos, setPos] = useState<Pos>("ST");
  const [foot, setFoot] = useState<"L" | "R">("R");
  const [age, setAge] = useState(18);
  const [clubId, setClubId] = useState("lee");
  const [slot, setSlot] = useState(0);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <h2 className="font-display text-3xl">Create player</h2>
      <input className="rounded-xl border border-line bg-surface px-3 py-3" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Select label="Nation" value={nat} options={NATIONS.map((n) => n.id)} labels={Object.fromEntries(NATIONS.map((n) => [n.id, n.name]))} onChange={setNat} />
        <Select label="Position" value={pos} options={["GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"]} onChange={(v) => setPos(v as Pos)} />
        <Select label="Foot" value={foot} options={["R", "L"]} onChange={(v) => setFoot(v as "L" | "R")} />
        <label className="text-sm text-muted">Age {age}
          <input type="range" min={16} max={22} value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-2 w-full" />
        </label>
      </div>
      <Select label="Starting club" value={clubId} options={CLUBS.map((c) => c.id)} labels={Object.fromEntries(CLUBS.map((c) => [c.id, c.name]))} onChange={setClubId} />
      <Select label="Save slot" value={String(slot)} options={["0", "1", "2"]} labels={{ "0": "Slot 1", "1": "Slot 2", "2": "Slot 3" }} onChange={(v) => setSlot(Number(v))} />
      <button type="button" className="rounded-full bg-accent px-5 py-3 font-semibold text-ink" onClick={() => onCreate({ name, nat, pos, foot, age, clubId, skin: 1, hair: 2, hairStyle: 1, height: 180 }, slot)}>
        Begin career
      </button>
    </div>
  );
}

function Dashboard({ save, onPlay, onSim, onTrain, onNav, onSeason, done }: { save: CareerSave; onPlay: () => void; onSim: () => void; onTrain: (key: "pac" | "sho" | "pas" | "dri" | "def" | "phy") => void; onNav: (s: Screen) => void; onSeason: () => void; done: boolean }) {
  const club = getClub(save.clubId);
  const fix = nextUserFixture(save);
  const opp = fix ? (fix.home === save.clubId ? fix.away : fix.home) : "";
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-3">
        {club ? <Crest kit={club.kit} short={club.short} size={64} /> : null}
        <div>
          <h2 className="font-display text-3xl">{club?.name}</h2>
          <p className="text-sm text-muted">{save.kind === "player" ? save.name : "Manager"} · Season {save.season} · OVR {squadOvr(save)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <Info k="Budget" v={formatMoney(save.budget)} />
        <Info k="Confidence" v={`${save.confidence}`} />
        <Info k="Record" v={`${save.stats.won}-${save.stats.drawn}-${save.stats.lost}`} />
      </div>
      {save.kind === "player" ? (
        <p className="text-sm text-muted">Apps {save.personal.apps} · Goals {save.personal.goals} · Assists {save.personal.assists} · Training left {4 - save.trains}</p>
      ) : null}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-muted">{fix ? (fix.comp === "cup" ? "Cup" : "League") : "Season"}</p>
        <p className="font-display text-2xl">{fix ? `vs ${getClub(opp)?.name ?? opp}` : "Fixtures complete"}</p>
        {save.messages[0] ? <p className="mt-2 text-sm text-muted">{save.messages[0]}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {fix ? (
            <>
              <button type="button" className="rounded-full bg-accent px-4 py-2 font-semibold text-ink" onClick={onPlay}>Play</button>
              <button type="button" className="rounded-full border border-line px-4 py-2" onClick={onSim}>Sim</button>
            </>
          ) : null}
          {done ? (
            <button type="button" className="rounded-full border border-accent px-4 py-2 text-accent" onClick={onSeason}>Next season</button>
          ) : null}
        </div>
      </div>
      {save.kind === "player" && save.trains < 4 ? (
        <div className="flex flex-wrap gap-2">
          {(["pac", "sho", "pas", "dri", "def", "phy"] as const).map((k) => (
            <TrainBtn key={k} label={k.toUpperCase()} onClick={() => onTrain(k)} />
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <NavBtn label="Squad" onClick={() => onNav("squad")} />
        <NavBtn label="Tactics" onClick={() => onNav("tactics")} />
        <NavBtn label="Transfers" onClick={() => onNav("market")} />
        <NavBtn label="Table" onClick={() => onNav("table")} />
        <NavBtn label="Fixtures" onClick={() => onNav("fixtures")} />
        <NavBtn label="Saves" onClick={() => onNav("saves")} />
      </div>
      {save.confidence <= 0 ? <p className="text-sm text-danger">Board confidence has collapsed. You can keep going, but the job is on the line.</p> : null}
    </div>
  );
}

function TrainBtn({ label, onClick }: { label: string; onClick: () => void }) {
  void onClick;
  return <span className="rounded-full border border-line px-3 py-2 text-xs">{label}</span>;
}

function Squad({ save, onOpen }: { save: CareerSave; onOpen: (p: Player) => void }) {
  const xi = useMemo(() => userSide(save).xi.map((p) => p.id), [save]);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-1">
      {[...save.squad].sort((a, b) => b.ovr - a.ovr).map((p) => (
        <button key={p.id} type="button" className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-left" onClick={() => onOpen(p)}>
          <span>{xi.includes(p.id) ? "XI" : "BN"} · {p.pos} {p.name}</span>
          <span className="text-accent">{p.ovr}</span>
        </button>
      ))}
    </div>
  );
}

function TacticsPanel({ tactics, squad, onChange }: { tactics: Tactics; squad: Player[]; onChange: (t: Tactics) => void }) {
  const outfield = squad.filter((p) => p.pos !== "GK");
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FORMATION_IDS.map((f) => (
          <Chip key={f} on={tactics.formation === f} label={f} onClick={() => onChange({ ...tactics, formation: f })} />
        ))}
      </div>
      {(["possession", "balanced", "counter", "press"] as const).map((s) => (
        <Chip key={s} on={tactics.style === s} label={s} onClick={() => onChange({ ...tactics, style: s })} />
      ))}
      <Slider label="Defensive depth" value={tactics.depth} onChange={(depth) => onChange({ ...tactics, depth })} />
      <Slider label="Width" value={tactics.width} onChange={(width) => onChange({ ...tactics, width })} />
      <Slider label="Press" value={tactics.press} onChange={(press) => onChange({ ...tactics, press })} />
      <Slider label="Tempo" value={tactics.tempo} onChange={(tempo) => onChange({ ...tactics, tempo })} />
      <Select label="Penalty taker" value={tactics.penalty} options={outfield.map((p) => p.id)} labels={Object.fromEntries(outfield.map((p) => [p.id, p.name]))} onChange={(penalty) => onChange({ ...tactics, penalty })} />
      <p className="text-xs text-muted">Depth, width, press, and style change how the team moves in the match.</p>
    </div>
  );
}

function Market({ save, onBuy, onSell }: { save: CareerSave; onBuy: (id: string, kind: "low" | "fair" | "high") => void; onSell: (id: string) => void }) {
  const [pos, setPos] = useState<Pos | "">("");
  const list = marketList(save).filter((p) => !pos || p.pos === pos).slice(0, 20);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      <p className="text-sm text-muted">Budget {formatMoney(save.budget)}. Offers can be rejected.</p>
      <Select label="Position" value={pos || "ALL"} options={["ALL", "GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"]} onChange={(v) => setPos(v === "ALL" ? "" : (v as Pos))} />
      {list.map((p) => (
        <div key={p.id} className="rounded-xl border border-line bg-surface p-3">
          <div className="flex justify-between">
            <span>{p.name} · {p.pos} · {p.ovr}</span>
            <span className="text-muted">{formatMoney(playerValue(p))}</span>
          </div>
          <p className="text-xs text-muted">{getClub(p.clubId)?.name} · wage {formatMoney(wageOf(p))}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" className="rounded-full border border-line px-3 py-1 text-sm" onClick={() => onBuy(p.id, "low")}>Bid low</button>
            <button type="button" className="rounded-full border border-line px-3 py-1 text-sm" onClick={() => onBuy(p.id, "fair")}>Fair</button>
            <button type="button" className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-ink" onClick={() => onBuy(p.id, "high")}>Premium</button>
          </div>
        </div>
      ))}
      <h3 className="font-display text-xl">Your squad</h3>
      {save.squad.filter((p) => p.id !== save.playerId).slice(0, 12).map((p) => (
        <div key={p.id} className="flex items-center justify-between text-sm">
          <span>{p.name} · {p.ovr}</span>
          <button type="button" className="rounded-full border border-line px-3 py-1" onClick={() => onSell(p.id)}>Sell</button>
        </div>
      ))}
    </div>
  );
}

function LeagueTable({ save }: { save: CareerSave }) {
  const rows = tableFrom(save.tableIds, save.fixtures);
  return (
    <table className="mx-auto w-full max-w-xl text-left text-sm">
      <thead className="text-muted">
        <tr><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className={`border-t border-line ${r.id === save.clubId ? "text-accent" : ""}`}>
            <td className="py-2">{getClub(r.id)?.name ?? r.id}</td>
            <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td>
            <td>{r.gf - r.ga}</td><td>{r.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Fixtures({ save }: { save: CareerSave }) {
  return (
    <ul className="mx-auto flex max-w-xl flex-col gap-1 text-sm">
      {[...save.fixtures, ...save.cup.bracket].map((f) => (
        <li key={f.id} className="flex justify-between border-b border-line py-2">
          <span>{f.comp === "cup" ? "Cup" : `R${f.round + 1}`} {getClub(f.home)?.short} vs {getClub(f.away)?.short}</span>
          <span>{f.hg == null ? "–" : `${f.hg}-${f.ag}`}</span>
        </li>
      ))}
    </ul>
  );
}

function Database({ onOpen }: { onOpen: (p: Player) => void }) {
  const [q, setQ] = useState("");
  const [league, setLeague] = useState("");
  const rows = searchPlayers(q, league || undefined);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <p className="text-xs text-muted">{DB_NOTE}</p>
      <input className="rounded-xl border border-line bg-surface px-3 py-3" placeholder="Search players" value={q} onChange={(e) => setQ(e.target.value)} />
      <Select label="League" value={league || "ALL"} options={["ALL", ...LEAGUES.map((l) => l.id)]} labels={{ ALL: "All leagues", ...Object.fromEntries(LEAGUES.map((l) => [l.id, l.name])) }} onChange={(v) => setLeague(v === "ALL" ? "" : v)} />
      {rows.map((p) => (
        <button key={p.id} type="button" className="flex justify-between rounded-xl border border-line px-3 py-2 text-left" onClick={() => onOpen(p)}>
          <span>{p.name} · {p.pos} · {getClub(p.clubId)?.short ?? p.nat}</span>
          <span className="text-accent">{p.ovr}</span>
        </button>
      ))}
    </div>
  );
}

function Profile({ player }: { player: Player }) {
  const groups = expandedStats(player);
  const club = getClub(player.clubId);
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <p className="text-sm text-muted">{club?.name ?? getNation(player.nat)?.name ?? player.nat} · {player.pos} · #{player.num}</p>
        <h2 className="font-display text-4xl">{player.name}</h2>
        <p className="text-muted">{roleBlurb(player)}</p>
        <p className="mt-1 text-sm">OVR {player.ovr} · POT {player.pot} · {player.age} yrs · {player.height} cm · {player.foot} foot · {formatMoney(playerValue(player))}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["PAC", player.pac], ["SHO", player.sho], ["PAS", player.pas], ["DRI", player.dri], ["DEF", player.def], ["PHY", player.phy]].map(([k, v]) => (
          <div key={String(k)} className="rounded-xl bg-surface py-2">
            <p className="text-xs text-muted">{k}</p>
            <p className="font-display text-2xl text-accent">{v}</p>
          </div>
        ))}
      </div>
      {groups.map((g) => (
        <div key={g.group}>
          <p className="mb-1 font-display tracking-wide">{g.group}</p>
          {g.rows.map(([name, value]) => (
            <div key={name} className="mb-1 grid grid-cols-[1fr_2rem_5rem] items-center gap-2 text-sm">
              <span>{name}</span>
              <span className="text-muted">{value}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-surface-2"><span className="block h-full bg-accent" style={{ width: `${value}%` }} /></span>
            </div>
          ))}
        </div>
      ))}
      <p className="text-xs text-muted">Detailed attributes are a derived model from the six core ratings. They are estimates, not official data.</p>
    </div>
  );
}

function SettingsPanel({ settings, onChange }: { settings: Settings; onChange: (p: Partial<Settings>) => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <Select label="Graphics" value={settings.graphics} options={["low", "medium", "high"]} onChange={(graphics) => onChange({ graphics: graphics as Settings["graphics"] })} />
      <Select label="Frame rate" value={String(settings.fps)} options={["30", "60"]} onChange={(fps) => onChange({ fps: Number(fps) as 30 | 60 })} />
      <Select label="Camera" value={settings.camera} options={["broadcast", "tele", "wide", "tactical"]} onChange={(camera) => onChange({ camera: camera as Settings["camera"] })} />
      <Select label="Pass help" value={settings.assistance} options={["low", "med", "high"]} onChange={(assistance) => onChange({ assistance: assistance as Settings["assistance"] })} />
      <Select label="Difficulty" value={settings.difficulty} options={["easy", "normal", "hard", "world"]} onChange={(difficulty) => onChange({ difficulty: difficulty as Difficulty })} />
      <Slider label="Effects" value={settings.sfx} onChange={(sfx) => onChange({ sfx })} />
      <Slider label="Crowd" value={settings.crowd} onChange={(crowd) => onChange({ crowd })} />
      <Slider label="Button size" value={(settings.buttonScale - 0.8) / 0.5} onChange={(v) => onChange({ buttonScale: 0.8 + v * 0.5 })} />
      <button type="button" className="w-fit rounded-full border border-line px-4 py-2" onClick={() => onChange({ leftHanded: !settings.leftHanded })}>
        {settings.leftHanded ? "Left-handed layout" : "Right-handed layout"}
      </button>
      <button type="button" className="w-fit rounded-full border border-line px-4 py-2" onClick={() => onChange({ vibration: !settings.vibration })}>
        Vibration {settings.vibration ? "on" : "off"}
      </button>
    </div>
  );
}

function Saves({ store, note, onExport, onImport }: { store: Store; note: string; onExport: () => void; onImport: (text: string) => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <p className="text-sm text-muted">Three career slots live in this browser. A reset, private mode, or full storage can wipe them. Export a JSON backup.</p>
      <button type="button" className="rounded-full bg-accent px-4 py-3 font-semibold text-ink" onClick={onExport}>Export save file</button>
      <label className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
        Import save file
        <input
          type="file"
          accept="application/json"
          className="mt-2 block w-full"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void file.text().then(onImport);
          }}
        />
      </label>
      <p className="text-sm">Matches played {store.career.matches} · Goals {store.career.goals} · Wins {store.career.wins}</p>
      {note ? <p className="text-sm text-accent">{note}</p> : null}
    </div>
  );
}

function About() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3 text-sm text-muted">
      <h2 className="font-display text-3xl text-fg">About this build</h2>
      <p>NINETY is an original mobile football game. It is not EA Sports FC, and it is not licensed by any league, club, or competition. Team and player names are public identifiers. Kits, badges, and ratings are original placeholders.</p>
      <p>Playable now: 11v11 3D matches, touch and keyboard controls, passing, through balls, crosses, shooting, tackling, sprint, a skill burst, goalkeepers, formations, tactics, set pieces, fouls, cards, substitutions, half-time, extra time and penalties in knockout ties, a short positional replay after goals, tournaments, manager career, player career, a transfer market, and browser saves.</p>
      <p>Still limited: club lists are a deep sample, not every club in every division. Faces are stylized, not scans. Commentary is on-screen text. Careers use a single round-robin, not a 38-game calendar. Cup ties are one match, not two-legged. There is no online multiplayer. Weather changes friction and the sky, not a full physics overhaul. Replays rewind positions; they are not broadcast cameras.</p>
      <p>The database is modular. Clubs, players, and competitions are data, not hard-wired rules.</p>
    </div>
  );
}

function Crest({ kit, short, size = 36 }: { kit: [string, string, string]; short: string; size?: number }) {
  const id = `${short}-${kit[0].replace("#", "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={kit[0]} />
          <stop offset="1" stopColor={kit[1]} />
        </linearGradient>
      </defs>
      <path d="M32 4 L56 14 V34 C56 48 32 60 32 60 C32 60 8 48 8 34 V14 Z" fill={`url(#${id})`} />
      <text x="32" y="38" textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize="13" fill={kit[2]}>
        {short.slice(0, 3)}
      </text>
    </svg>
  );
}

function Chip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" className={`rounded-full border px-3 py-2 text-sm capitalize ${on ? "border-accent text-accent" : "border-line"}`} onClick={onClick}>
      {label}
    </button>
  );
}

function Select({ label, value, options, onChange, labels }: { label: string; value: string; options: string[]; onChange: (v: string) => void; labels?: Record<string, string> }) {
  return (
    <label className="text-sm text-muted">
      {label}
      <select className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-3 text-fg" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{labels?.[o] ?? o}</option>
        ))}
      </select>
    </label>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="text-sm text-muted">
      {label}
      <input type="range" min={0} max={1} step={0.01} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" />
    </label>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2">
      <p className="text-xs text-muted">{k}</p>
      <p className="font-display text-xl">{v}</p>
    </div>
  );
}

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="rounded-xl border border-line bg-surface px-3 py-3 text-left font-display tracking-wide" onClick={onClick}>
      {label}
    </button>
  );
}
