'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Target, Eye, Swords, Shield, ChevronDown, ChevronUp } from 'lucide-react';

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

export function CoachingTab({ selectedGame }: { selectedGame: string }) {
  const [openSection, setOpenSection] = useState<string | null>('mecanicas');

  const toggleSection = (s: string) => setOpenSection(prev => prev === s ? null : s);

  const mecanicas: TipCard[] = [
    { title: 'Last Hitting', description: 'Practica el último golpe a minions en Practice Tool. El oro de last hits es tu fuente principal de income. Apunta a 7+ CS por minuto. En lane fase, prioriza CS sobre trades si tu campeón no tiene ventaja.', icon: <Target className="w-4 h-4 text-[#c8aa6e]" /> },
    { title: 'Wave Management', description: 'Slow Push: deja 2-3 caster minions vivos para crear una ola grande. Fast Push: empuja rápido con habilidades para recallar o roam. Freeze: mantén la ola cerca de tu torre para negar CS al rival y ser vulnerable a ganks.', icon: <Shield className="w-4 h-4 text-[#0acbe6]" /> },
    { title: 'Trading Stance', description: 'Cuando el rival last hittea un minion, es tu ventana para hacer daño (auto + habilidad + retroceder). No trades cuando tu ola está empujando — te vas a recibir daño de minions. Posiciónate entre minions aliados para protección.', icon: <Swords className="w-4 h-4 text-[#e84057]" /> },
    { title: 'Creep Block', description: 'Usa tu cuerpo para bloquear minions enemigos y que la ola empuje hacia tu torre. Esto te permite freeze cerca de torre y negar al rival. Cuidado: algunos campeones (Darius, Nasus) benefician mucho de esto.', icon: <Target className="w-4 h-4 text-[#0fba81]" /> },
    { title: 'Map Awareness', description: 'Mira el minimap cada 3-5 segundos. Si tu jungler no está en mapa visible, asume que te van a gankear. Si el rival mid falta, avisa a tus lanes. El minimap te da información gratuita — úsala.', icon: <Eye className="w-4 h-4 text-[#f0c646]" /> },
    { title: 'Powerspikes', description: 'Conoce tus power spikes: niveles (2, 3, 6, 11, 16) y completar items clave. Si vas por debajo, busca una power spike para intentar un play. Si vas por arriba, presiona tu ventaja ANTES de que el rival alcance su spike.', icon: <Swords className="w-4 h-4 text-[#c8aa6e]" /> },
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
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <GraduationCap className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2] lol-title">MOBA Coach</h2>
          <p className="text-xs text-[#5b5a56]">Mecánicas, visión y composiciones para mejorar tu juego</p>
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
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
