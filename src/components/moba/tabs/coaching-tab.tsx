'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Target, Eye, Swords, Shield, ChevronDown, ChevronUp, Zap, Gem } from 'lucide-react';

interface TipCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CompEntry {
  name: string;
  champions: string[];
  playstyle: string;
  description: string;
}

interface CounterTip {
  champion: string;
  tip: string;
}

interface KeystoneEntry {
  name: string;
  when: string;
}

interface RoleKeystones {
  role: string;
  keystones: KeystoneEntry[];
}

interface ChampionRunes {
  champion: string;
  keystone: string;
  primaryTree: string;
  primaryRunes: string[];
  secondaryTree: string;
  secondaryRunes: string[];
  shards: string;
}

export function CoachingTab({ selectedGame }: { selectedGame: string }) {
  const [openSection, setOpenSection] = useState<string | null>('mecanicas');

  const toggleSection = (s: string) => setOpenSection(prev => prev === s ? null : s);

  const mecanicas: TipCard[] = [
    { title: 'Último Golpe', description: 'Practica el último golpe a minions en Practice Tool. El oro de last hits es tu fuente principal de income. Apunta a 7+ CS por minuto. En lane fase, prioriza CS sobre trades si tu campeón no tiene ventaja.', icon: <Target className="w-4 h-4 text-[#c8aa6e]" /> },
    { title: 'Manejo de Oleadas', description: 'Slow Push: deja 2-3 caster minions vivos para crear una ola grande. Fast Push: empuja rápido con habilidades para recallar o roam. Freeze: mantén la ola cerca de tu torre para negar CS al rival y ser vulnerable a ganks.', icon: <Shield className="w-4 h-4 text-[#0acbe6]" /> },
    { title: 'Postura de Trading', description: 'Cuando el rival last hittea un minion, es tu ventana para hacer daño (auto + habilidad + retroceder). No trades cuando tu ola está empujando — te vas a recibir daño de minions. Posiciónate entre minions aliados para protección.', icon: <Swords className="w-4 h-4 text-[#e84057]" /> },
    { title: 'Bloqueo de Minions', description: 'Usa tu cuerpo para bloquear minions enemigos y que la ola empuje hacia tu torre. Esto te permite freeze cerca de torre y negar al rival. Cuidado: algunos campeones (Darius, Nasus) benefician mucho de esto.', icon: <Target className="w-4 h-4 text-[#0fba81]" /> },
    { title: 'Conciencia del Mapa', description: 'Mira el minimap cada 3-5 segundos. Si tu jungler no está en mapa visible, asume que te van a gankear. Si el rival mid falta, avisa a tus lanes. El minimap te da información gratuita — úsala.', icon: <Eye className="w-4 h-4 text-[#f0c646]" /> },
    { title: 'Picos de Poder', description: 'Conoce tus power spikes: niveles (2, 3, 6, 11, 16) y completar items clave. Si vas por debajo, busca una power spike para intentar un play. Si vas por arriba, presiona tu ventaja ANTES de que el rival alcance su spike.', icon: <Swords className="w-4 h-4 text-[#c8aa6e]" /> },
  ];

  const warding: TipCard[] = [
    { title: 'Top Lane', description: 'Ward de tríbush (bush superior) para ver ganks del jungler. Controla el río con tu support y jungler. En mid game, wardia la jungle rival para split push seguro. Pink ward en tríbush es staple.', icon: <Eye className="w-4 h-4 text-[#c8aa6e]" /> },
    { title: 'Jungle', description: 'Wardia los buffs rivales para trackear al jungler. Deep wards en su jungle te dan timers de spawn. Vision de río para objetivar Dragon/Baron. Siempre carries control wards.', icon: <Eye className="w-4 h-4 text-[#0acbe6]" /> },
    { title: 'Mid Lane', description: 'Ward de río ( ambos lados) y parte de jungle. Cuando tu warden se cae, reemplazalo inmediatamente. Pink ward en una de las brush del río es esencial para mid game teamfights.', icon: <Eye className="w-4 h-4 text-[#e84057]" /> },
    { title: 'ADC', description: 'Tu support debería wardar, pero si vas solo: ward de tríbush y el lane bush. En teamfights, mantén vision del flank. En late game, wardia antes de cada objetivo con tu team.', icon: <Eye className="w-4 h-4 text-[#0fba81]" /> },
    { title: 'Support', description: 'Eres el principal warder del equipo. Control ward en río early, oracle lens en mid/late. Wardia jungle rival para enable plays de tu jungler. En late game, prioriza vision de Baron y bases rivales.', icon: <Eye className="w-4 h-4 text-[#f0c646]" /> },
  ];

  const comps: CompEntry[] = [
    { name: 'Engage & Teamfight', champions: ['Malphite', 'Jarvan IV', 'Orianna', 'Jinx', 'Thresh'], playstyle: 'Engage brutal + follow-up', description: 'Malphite R + Jarvan EQ + Orianna R = team wipe. Jinx limpiando. Thresh protege y engancha stragglers. Comp muy fuerte en el meta 26.8-26.9 por la cantidad de AP bruisers.' },
    { name: 'Poke & Siege', champions: ['Jayce', 'Zoe', 'Varus', 'Lulu', 'Karma'], playstyle: 'Dolor a distancia + disengage', description: 'Jayce y Zoe pokean desde fuera de rango. Varus R + Lulu R = pelea forzada a tu favor. Karma shield + speedboost para kiting. Excelente en objective setups.' },
    { name: 'Split Push', champions: ['Fiora', 'Nidalee', 'Trundle', 'Sivir', 'Shen'], playstyle: 'Presión lateral + respuesta global', description: 'Fiora/Trundle splitanean. Shen R + Sivir R para responder a 4v4. Nidalee controla jungle y objetivos. Funciona con comunicación de team.' },
    { name: 'Pick Comp', champions: ['Blitzcrank', 'Elise', 'LeBlanc', 'Ezreal', 'Nautilus'], playstyle: 'Catchear y eliminar', description: 'Blitz/Nautilus hook + Elise/LB burst = muerte instantánea. Ezreal limpia desde lejos. Excelente en ranked donde un catch = Baron/Nexus.' },
    { name: 'Protect the ADC', champions: ['Ornn', 'Lee Sin', 'Orianna', 'Jinx', 'Yuumi'], playstyle: 'Peel intenso + hiper carry', description: 'Todo el team protege a Jinx. Ornn items para todo el team. Yuumi unbound a Jinx = inmortal en late game. Lee Sin kick para peel.' },
  ];

  // Section 4: Counter Tips
  const counterTips: CounterTip[] = [
    { champion: 'Darius', tip: 'Play extenders (Gnar, Vayne, Quinn). No hagas trades al nivel 1-2. Pokea cuando use Q (Decimate). Mantené distancia y usá gap closers solo cuando no tenga E.' },
    { champion: "K'Sante", tip: 'Sustain a través de su all-in con Grasp trades. Items: Black Cleaver + Riftmaker. No te dejes pillar contra la pared. Esperá que gaste sus abilities antes de tradear.' },
    { champion: 'Jinx', tip: 'Engage antes de que tenga 3 items. Snowball early. No la dejes farmear libre. Cuando use su Zap (W), es tu ventana para entrar. Focus antes de que tenga rockets.' },
    { champion: 'Thresh', tip: 'Esquiva los hooks, bateau la linterna (W). Engage al support cuando use Flay (E). Priorizá matarlo antes del ADC. Oracle lens para detectar sus trampas.' },
    { champion: 'Hwei', tip: 'Interruptí su combo de 3 spells. Gap close cuando gaste cooldowns. Es súper vulnerable sin habilidades. Comprá MR y acercate cuando tire la zona de E.' },
    { champion: 'Taliyah', tip: 'Wardia jungle entries. Engage cuando use E en combo. Cleanse si tenés. Su roca sigue un patrón — aprendé a esquivarla. Post-6 roamea mucho, tené cuidado.' },
    { champion: 'Warwick', tip: 'Comprá Quicksilver Sash para su R. No te pelees a bajo HP (su Q y R healing es enorme). Wardia su jungle para trackearlo. Es débil al burst antes de stackear.' },
    { champion: 'Lee Sin', tip: 'Esquivá su Q (Tempest). Incentivá misses de Dragon Rage (R). Es débil en late game — procrastiná el juego. Si falla la Q, castigá sin piedad.' },
    { champion: 'Master Yi', tip: 'Comprá CC (Randuin, Thornmail, Warden\'s Mail). Focus en early game. Alpha Strike (Q) lo hace invulnerable — no waste CC mientras la use. Heridas Mortales es clave.' },
    { champion: 'Yasuo', tip: 'Sin tornado (Q3) = sin kill. Dodge el Q3. Comprá Heridas Mortales. Es débil contra hard CC. Engage cuando esté sin stacks de Q. No trades cerca de minions.' },
  ];

  // Section 5: Keystones por Rol
  const roleKeystones: RoleKeystones[] = [
    {
      role: 'Top',
      keystones: [
        { name: 'Grasp of the Undying', when: 'Bruisers que tradean constantemente (Darius, K\'Sante, Ornn). Maximiza daño en short trades y da sustain.' },
        { name: 'Fleet Footwork', when: 'Poke lanes o campeones que necesitan sustain (Vayne, Quinn, Teemo). Permite tradear y retirarse.' },
        { name: 'Conqueror', when: 'Fighters que se quedan en peleas largas (Fiora, Riven, Yasuo). Stacks con cada habilidad/auto.' },
      ],
    },
    {
      role: 'Jungle',
      keystones: [
        { name: 'Dark Harvest', when: 'Junglers burst-oriented que snowballelan (Kayn, Evelynn, Shaco). Se resetea con kills y es brutal en early.' },
        { name: 'Lethal Tempo', when: 'Junglers farm-heavy o auto-attackers (Master Yi, Jax, Shyvana). Mejora DPS significativamente en clears y fights.' },
        { name: 'Aftershock', when: 'Tank junglers con CC (Nautilus, Malphite, Sejuani). Da resistencias después de enganchar — perfecto para ganks.' },
      ],
    },
    {
      role: 'Mid',
      keystones: [
        { name: 'Electrocute', when: 'Assassins que burstean rápido (Zed, Katarina, Talon). 3 hits → daño burst. Ideal para one-shot combo.' },
        { name: 'Summon Aery', when: 'Control mages con poke frecuente (Orianna, Syndra, Lissandra). Procs con cada habilidad en el rival.' },
        { name: 'Phase Rush', when: 'Mages con movilidad o que necesitan escapar (Corki, Ryze, Taliyah). 3 hits → MS burst para engage/disengage.' },
      ],
    },
    {
      role: 'ADC',
      keystones: [
        { name: 'Lethal Tempo', when: 'Hyper carries (Jinx, Kog\'Maw, Vayne). Stack attack speed con cada auto — devastador en teamfights.' },
        { name: 'Fleet Footwork', when: 'ADCs que necesitan seguridad en lane (Sivir, Ezreal, Ashe). Sustain y MS para kiting y escapar ganks.' },
        { name: 'Conqueror', when: 'Bruiser ADCs (Lucian, Varus, Samira). Stacks en peleas sostenidas — fuerte en el meta de bruiser items.' },
      ],
    },
    {
      role: 'Support',
      keystones: [
        { name: 'Summon Aery', when: 'Poke supports (Lulu, Karma, Senna). Daño y shield con cada habilidad. Ideal para harass en lane.' },
        { name: 'Guardian', when: 'Peel/protect supports (Thresh, Braum, Yuumi). Procs al proteger al ADC. Da resistencias y shield.' },
        { name: 'Glacial Augment', when: 'Engage supports (Nautilus, Leona, Morgana). Slow items + CC base = catches garantizados. Perfecto para lockdown.' },
      ],
    },
  ];

  // Section 6: Runas por Campeon S-Tier
  const championRunes: ChampionRunes[] = [
    {
      champion: "K'Sante",
      keystone: 'Grasp of the Undying',
      primaryTree: 'Valor (Resolve)',
      primaryRunes: ['Demolish', 'Bone Plating', 'Unflinching'],
      secondaryTree: 'Inspiración',
      secondaryRunes: ['Magical Footwear', 'Second Wind'],
      shards: 'Velocidad + HP + Resistencia',
    },
    {
      champion: 'Hwei',
      keystone: 'Electrocute',
      primaryTree: 'Dominación (Domination)',
      primaryRunes: ['Cheap Shot', 'Eyeball Collection', 'Ultimate Hunter'],
      secondaryTree: 'Brujería (Sorcery)',
      secondaryRunes: ['Manaflow Band', 'Transcendence'],
      shards: 'CDR + MR + HP',
    },
    {
      champion: 'Jinx',
      keystone: 'Lethal Tempo',
      primaryTree: 'Precisión (Precision)',
      primaryRunes: ['Presence of Mind', 'Legend: Bloodline', 'Cutdown'],
      secondaryTree: 'Dominación',
      secondaryRunes: ['Taste of Blood', 'Treasure Hunter'],
      shards: 'AS + AD + Resistencia',
    },
    {
      champion: 'Thresh',
      keystone: 'Guardian',
      primaryTree: 'Valor (Resolve)',
      primaryRunes: ['Font of Life', 'Bone Plating', 'Unflinching'],
      secondaryTree: 'Inspiración',
      secondaryRunes: ['Magical Footwear', 'Hextech Flashtraption'],
      shards: 'Velocidad + Armadura + HP',
    },
    {
      champion: 'Taliyah',
      keystone: 'Phase Rush',
      primaryTree: 'Brujería (Sorcery)',
      primaryRunes: ['Manaflow Band', 'Transcendence', 'Scorch'],
      secondaryTree: 'Precisión',
      secondaryRunes: ['Presence of Mind', 'Celerity'],
      shards: 'AP + MR + HP',
    },
    {
      champion: 'Warwick',
      keystone: 'Dark Harvest',
      primaryTree: 'Dominación (Domination)',
      primaryRunes: ['Cheap Shot', 'Eyeball Collection', 'Relentless Hunter'],
      secondaryTree: 'Precisión',
      secondaryRunes: ['Triumph', 'Legend: Alacrity'],
      shards: 'AS + MR + HP',
    },
  ];

  if (selectedGame === 'wildrift') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GraduationCap className="w-16 h-16 text-[#785a28] mb-4 opacity-30" />
        <h2 className="text-lg font-bold text-[#f0e6d2] mb-2">Coaching para Wild Rift</h2>
        <p className="text-sm text-[#5b5a56] max-w-md">Próximamente: guías de mecánicas, warding y macro adaptadas a Wild Rift.</p>
      </div>
    );
  }

  const sections = [
    { id: 'mecanicas', label: 'Mecánicas Fundamentales', icon: <Swords className="w-4 h-4" />, content: 'mecanicas' as const },
    { id: 'warding', label: 'Warding y Visión', icon: <Eye className="w-4 h-4" />, content: 'warding' as const },
    { id: 'comps', label: 'Composiciones Pro', icon: <Target className="w-4 h-4" />, content: 'comps' as const },
    { id: 'counters', label: 'Counter Tips', icon: <Target className="w-4 h-4" />, content: 'counters' as const },
    { id: 'keystones', label: 'Keystones por Rol', icon: <Zap className="w-4 h-4" />, content: 'keystones' as const },
    { id: 'runas', label: 'Runas por Campeón S-Tier', icon: <Gem className="w-4 h-4" />, content: 'runas' as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <GraduationCap className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2] lol-title">Entrenador MOBA</h2>
          <p className="text-xs text-[#5b5a56]">Mecánicas, visión, composiciones y más para mejorar tu juego</p>
        </div>
      </div>

      {sections.map(section => {
        const isOpen = openSection === section.id;
        const btnStyle = {
          background: isOpen ? 'rgba(200,170,110,0.08)' : 'rgba(30,35,40,0.5)',
          border: isOpen ? '1px solid rgba(200,170,110,0.25)' : '1px solid rgba(120,90,40,0.15)',
        };

        return (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
              style={btnStyle}
            >
              <div style={{ color: isOpen ? '#c8aa6e' : '#a09b8c' }}>{section.icon}</div>
              <span className="text-sm font-semibold text-[#f0e6d2] flex-1 text-left">{section.label}</span>
              {isOpen ? <ChevronUp className="w-4 h-4 text-[#c8aa6e]" /> : <ChevronDown className="w-4 h-4 text-[#5b5a56]" />}
            </button>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-2 space-y-2"
              >
                {section.content === 'mecanicas' && mecanicas.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">{tip.icon}<h3 className="text-sm font-semibold text-[#f0e6d2]">{tip.title}</h3></div>
                    <p className="text-xs text-[#a09b8c] leading-relaxed">{tip.description}</p>
                  </motion.div>
                ))}
                {section.content === 'warding' && warding.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">{tip.icon}<h3 className="text-sm font-semibold text-[#f0e6d2]">{tip.title}</h3></div>
                    <p className="text-xs text-[#a09b8c] leading-relaxed">{tip.description}</p>
                  </motion.div>
                ))}
                {section.content === 'comps' && comps.map((comp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-[#f0e6d2]">{comp.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(200,170,110,0.1)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.2)' }}>{comp.playstyle}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {comp.champions.map(c => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(10,203,230,0.08)', color: '#0acbe6', border: '1px solid rgba(10,203,230,0.15)' }}>{c}</span>
                      ))}
                    </div>
                    <p className="text-xs text-[#a09b8c] leading-relaxed">{comp.description}</p>
                  </motion.div>
                ))}
                {section.content === 'counters' && counterTips.map((ct, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#e84057]" />
                      <h3 className="text-sm font-semibold text-[#f0e6d2]">Contra {ct.champion}</h3>
                    </div>
                    <p className="text-xs text-[#a09b8c] leading-relaxed">{ct.tip}</p>
                  </motion.div>
                ))}
                {section.content === 'keystones' && roleKeystones.map((role, i) => (
                  <motion.div
                    key={role.role}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-[#f0c646]" />
                      <h3 className="text-sm font-semibold text-[#f0e6d2]">{role.role}</h3>
                    </div>
                    <div className="space-y-2.5">
                      {role.keystones.map((ks, j) => (
                        <div key={j} className="pl-2" style={{ borderLeft: '2px solid rgba(240,198,70,0.3)' }}>
                          <p className="text-xs font-semibold text-[#f0c646]">{ks.name}</p>
                          <p className="text-[11px] text-[#a09b8c] leading-relaxed mt-0.5">{ks.when}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
                {section.content === 'runas' && championRunes.map((cr, i) => (
                  <motion.div
                    key={cr.champion}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Gem className="w-4 h-4 text-[#0acbe6]" />
                      <h3 className="text-sm font-semibold text-[#f0e6d2]">{cr.champion}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded ml-auto" style={{ background: 'rgba(200,170,110,0.1)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.2)' }}>S-Tier</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(10,203,230,0.15)', color: '#0acbe6', border: '1px solid rgba(10,203,230,0.25)' }}>Keystone</span>
                        <span className="text-xs text-[#f0e6d2] font-semibold">{cr.keystone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded shrink-0" style={{ background: 'rgba(200,170,110,0.1)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.2)' }}>Primary</span>
                        <div>
                          <p className="text-[11px] text-[#a09b8c]">{cr.primaryTree}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {cr.primaryRunes.map((r, j) => (
                              <span key={j} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(200,170,110,0.06)', color: '#a09b8c', border: '1px solid rgba(120,90,40,0.1)' }}>{r}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded shrink-0" style={{ background: 'rgba(15,186,129,0.1)', color: '#0fba81', border: '1px solid rgba(15,186,129,0.2)' }}>Secondary</span>
                        <div>
                          <p className="text-[11px] text-[#a09b8c]">{cr.secondaryTree}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {cr.secondaryRunes.map((r, j) => (
                              <span key={j} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(15,186,129,0.06)', color: '#a09b8c', border: '1px solid rgba(15,186,129,0.1)' }}>{r}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(232,64,87,0.1)', color: '#e84057', border: '1px solid rgba(232,64,87,0.2)' }}>Shards</span>
                        <span className="text-[11px] text-[#a09b8c]">{cr.shards}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
