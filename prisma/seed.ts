import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const champions = [
  // Tier S — Dioses del Meta (8 champions)
  { name: 'Ahri', title: 'the Nine-Tailed Fox', role: 'Mid', tier: 'S', winRate: 53.2, pickRate: 8.1, banRate: 2.8 },
  { name: 'Jinx', title: 'the Loose Cannon', role: 'ADC', tier: 'S', winRate: 54.1, pickRate: 12.3, banRate: 5.1 },
  { name: 'Lee Sin', title: 'the Blind Monk', role: 'Jungle', tier: 'S', winRate: 52.8, pickRate: 10.5, banRate: 6.2 },
  { name: 'Thresh', title: 'the Chain Warden', role: 'Support', tier: 'S', winRate: 51.9, pickRate: 15.2, banRate: 1.5 },
  { name: 'Darius', title: 'the Hand of Noxus', role: 'Top', tier: 'S', winRate: 53.5, pickRate: 7.8, banRate: 8.3 },
  { name: 'Master Yi', title: 'Wuju Bladesman', role: 'Jungle', tier: 'S', winRate: 55.2, pickRate: 14.1, banRate: 12.5 },
  { name: 'Yasuo', title: 'the Unforgiven', role: 'Mid', tier: 'S', winRate: 51.8, pickRate: 11.2, banRate: 4.7 },
  { name: 'Caitlyn', title: 'the Sheriff of Piltover', role: 'ADC', tier: 'S', winRate: 52.5, pickRate: 9.6, banRate: 2.1 },

  // Tier A — Fuertes (39 champions — original A + promoted B/C/D)
  { name: 'Orianna', title: 'the Lady of Clockwork', role: 'Mid', tier: 'A', winRate: 51.2, pickRate: 6.3, banRate: 0.8 },
  { name: 'Vi', title: 'the Piltover Enforcer', role: 'Jungle', tier: 'A', winRate: 50.8, pickRate: 5.2, banRate: 1.2 },
  { name: 'Ezreal', title: 'the Prodigal Explorer', role: 'ADC', tier: 'A', winRate: 49.5, pickRate: 8.9, banRate: 0.5 },
  { name: 'Lulu', title: 'the Fae Sorceress', role: 'Support', tier: 'A', winRate: 50.1, pickRate: 7.4, banRate: 0.3 },
  { name: 'Garen', title: 'The Might of Demacia', role: 'Top', tier: 'A', winRate: 51.5, pickRate: 6.7, banRate: 1.1 },
  { name: 'Katarina', title: 'the Sinister Blade', role: 'Mid', tier: 'A', winRate: 50.3, pickRate: 7.1, banRate: 2.3 },
  { name: 'Graves', title: 'the Outlaw', role: 'Jungle', tier: 'A', winRate: 49.8, pickRate: 4.5, banRate: 0.6 },
  { name: 'Vayne', title: 'the Night Hunter', role: 'ADC', tier: 'A', winRate: 50.6, pickRate: 5.8, banRate: 0.4 },
  { name: 'Leona', title: 'the Radiant Dawn', role: 'Support', tier: 'A', winRate: 51.0, pickRate: 4.9, banRate: 0.7 },
  { name: 'Renekton', title: 'the Butcher of the Sands', role: 'Top', tier: 'A', winRate: 50.4, pickRate: 5.6, banRate: 1.5 },
  { name: 'Zed', title: 'the Master of Shadows', role: 'Mid', tier: 'A', winRate: 49.2, pickRate: 8.3, banRate: 3.8 },
  { name: 'Amumu', title: 'the Sad Mummy', role: 'Jungle', tier: 'A', winRate: 51.3, pickRate: 6.1, banRate: 0.9 },
  { name: 'Jhin', title: 'the Virtuoso', role: 'ADC', tier: 'A', winRate: 51.7, pickRate: 7.2, banRate: 1.0 },
  { name: 'Morgana', title: 'the Fallen', role: 'Support', tier: 'A', winRate: 50.5, pickRate: 8.8, banRate: 1.3 },
  { name: 'Camille', title: 'the Steel Shadow', role: 'Top', tier: 'A', winRate: 49.9, pickRate: 5.1, banRate: 2.0 },
  { name: 'Diana', title: 'Scorn of the Moon', role: 'Jungle', tier: 'A', winRate: 50.2, pickRate: 4.8, banRate: 1.4 },

  // Promoted from B to A
  { name: 'Lux', title: 'the Lady of Luminosity', role: 'Mid', tier: 'A', winRate: 48.5, pickRate: 9.2, banRate: 0.6 },
  { name: 'Nami', title: 'the Tidecaller', role: 'Support', tier: 'A', winRate: 49.1, pickRate: 5.3, banRate: 0.2 },
  { name: 'Wukong', title: 'the Monkey King', role: 'Top', tier: 'A', winRate: 48.8, pickRate: 4.2, banRate: 0.8 },
  { name: 'Volibear', title: 'the Relentless Storm', role: 'Top', tier: 'A', winRate: 47.9, pickRate: 3.8, banRate: 0.5 },
  { name: 'Twisted Fate', title: 'the Card Master', role: 'Mid', tier: 'A', winRate: 48.2, pickRate: 4.5, banRate: 1.1 },
  { name: 'Ashe', title: 'the Frost Archer', role: 'ADC', tier: 'A', winRate: 49.3, pickRate: 6.4, banRate: 0.3 },
  { name: 'Rakan', title: 'the Charmer', role: 'Support', tier: 'A', winRate: 48.1, pickRate: 4.7, banRate: 0.2 },
  { name: 'Xin Zhao', title: 'the Seneschal of Demacia', role: 'Jungle', tier: 'A', winRate: 48.7, pickRate: 3.9, banRate: 0.4 },
  { name: 'Tristana', title: 'the Yordle Gunner', role: 'ADC', tier: 'A', winRate: 48.9, pickRate: 5.1, banRate: 0.5 },
  { name: 'Shen', title: 'the Eye of Twilight', role: 'Top', tier: 'A', winRate: 47.5, pickRate: 3.2, banRate: 0.7 },
  { name: 'Syndra', title: 'the Dark Sovereign', role: 'Mid', tier: 'A', winRate: 47.8, pickRate: 4.1, banRate: 0.9 },

  // Promoted from C to A
  { name: 'Yorick', title: 'Shepherd of Souls', role: 'Top', tier: 'A', winRate: 46.2, pickRate: 2.1, banRate: 0.3 },
  { name: 'Ivern', title: 'the Green Father', role: 'Jungle', tier: 'A', winRate: 45.8, pickRate: 1.5, banRate: 0.1 },
  { name: 'Nidalee', title: 'the Bestial Huntress', role: 'Jungle', tier: 'A', winRate: 46.5, pickRate: 2.3, banRate: 0.4 },
  { name: 'Kalista', title: 'the Spear of Vengeance', role: 'ADC', tier: 'A', winRate: 45.5, pickRate: 1.8, banRate: 0.2 },
  { name: 'Braum', title: 'the Heart of the Freljord', role: 'Support', tier: 'A', winRate: 46.8, pickRate: 2.5, banRate: 0.1 },
  { name: "Vel'Koz", title: 'the Eye of the Void', role: 'Mid', tier: 'A', winRate: 46.0, pickRate: 1.9, banRate: 0.3 },
  { name: 'Mordekaiser', title: 'the Iron Revenant', role: 'Top', tier: 'A', winRate: 45.2, pickRate: 2.7, banRate: 0.6 },
  { name: 'Taliyah', title: 'the Stoneweaver', role: 'Mid', tier: 'A', winRate: 46.3, pickRate: 2.0, banRate: 0.2 },

  // Promoted from D to A
  { name: 'Bard', title: 'the Wandering Caretaker', role: 'Support', tier: 'A', winRate: 43.5, pickRate: 1.2, banRate: 0.1 },
  { name: 'Skarner', title: 'the Crystal Vanguard', role: 'Jungle', tier: 'A', winRate: 44.1, pickRate: 0.8, banRate: 0.1 },
  { name: 'Azir', title: 'the Emperor of the Sands', role: 'Mid', tier: 'A', winRate: 43.8, pickRate: 1.0, banRate: 0.2 },
  { name: 'Urgot', title: 'the Dreadnought', role: 'Top', tier: 'A', winRate: 44.5, pickRate: 1.4, banRate: 0.3 },
];

const patchNotes = [
  {
    version: '14.8',
    title: 'Patch 14.8 — Ajustes de Mid Season',
    summary: 'Ajustes de champions para preparación de mid-season invicta.',
    digest: 'Esta patch trae cambios significativos al meta de mid-season. Se buffean campeones de jungla como Master Yi y Lee Sin, mientras se ajustanADCs de alta movilidad. Jinx recibe un ligero nerf en su rango de W pero compensa con más daño en su pasiva. Thresh mantiene su dominio en la bot lane con pequeñas mejoras de calidad de vida. Darius y Garen reciben ajustes para diversificar la top lane.',
    sourceGame: 'LoL',
  },
];

const aiInsights = [
  { champion: 'Master Yi', category: 'buff', content: 'Master Yi ha recibido un buff significativo en su Q que le permite resetear más rápido tras eliminaciones. Esto lo convierte en un jungler extremadamente peligroso en partidas de snowball.', confidence: 0.92 },
  { champion: 'Jinx', category: 'buff', content: 'Jinx mantiene su status de ADC dominante gracias a la sinergia con la nueva runa de cosecha. Su win rate subió un 2.3% esta patch.', confidence: 0.88 },
  { champion: 'Ahri', category: 'tier-change', content: 'Ahri asciende a Tier S tras los cambios en su E. Ahora charm tiene mayor rango base, permitiéndole atrapar objetivos desde posiciones más seguras.', confidence: 0.85 },
  { champion: 'Darius', category: 'meta', content: 'El meta actual de bruisers favorece a Darius enormemente. Con la reducción de defensas mágicas en varios items, su Q sigue siendo devastador en teamfights.', confidence: 0.90 },
  { champion: 'Lee Sin', category: 'counter', content: 'Lee Sin es un counter directo de Diana en la jungla. Su presión temprana supera a Diana, y puede invadir su jungle sin riesgo gracias a sus escapes.', confidence: 0.87 },
  { champion: 'Thresh', category: 'synergy', content: 'La sinergia Thresh + Jinx es una de las más fuertes del meta. Thresh puede enganchar y lanzar a Jinx para que active su pasiva de forma casi garantizada.', confidence: 0.93 },
  { champion: 'Yasuo', category: 'nerf', content: 'Yasuo recibió un nerf en su muro de viento (W), que ahora dura 0.75 segundos menos. Aún así, su kit de reseteo lo mantiene en Tier S.', confidence: 0.91 },
  { champion: 'Caitlyn', category: 'meta', content: 'Caitlyn domina el early game en la bot lane. Su combo de trampa + headshot puede eliminar aADCs frágiles en el level 2, especialmente contra Jhin.', confidence: 0.86 },
  { champion: 'Katarina', category: 'buff', content: 'Katarina gana velocidad de movimiento al usar dagas, lo que mejora su supervivencia en teamfights. Este cambio la posiciona como pick sólido en mid.', confidence: 0.82 },
  { champion: 'Master Yi', category: 'meta', content: 'El combo Master Yi + Taric sigue siendo uno de los más tóxicos para jugar en contra. La incapacidad del rival de interactuar durante la invulnerabilidad de Taric es frustrante.', confidence: 0.94 },
  { champion: 'Morgana', category: 'counter', content: 'Morgana counters efectivamente a Leona. Su escudo negro (E) anula el enganche de Leona, neutralizando su principal herramienta de iniciación.', confidence: 0.89 },
  { champion: 'Zed', category: 'nerf', content: 'Zed recibe reducción de daño en sus sombras (W). El daño de las sombras now escala con un 15% menos de AD bonus.', confidence: 0.88 },
  { champion: 'Orianna', category: 'tier-change', content: 'Orianna se mantiene en Tier A pero podría ascender pronto. Su ultimate en teamfights sigue siendo uno de los mejores engages del juego.', confidence: 0.80 },
  { champion: 'Garen', category: 'buff', content: 'Garen recibe reducción de cooldown en su E, lo que le permite girar más seguido. Esto mejora su clear de jungle en el meta de bruiser jungler.', confidence: 0.83 },
  { champion: 'Vayne', category: 'counter', content: 'Vayne es el counter perfecto para tanks como Ornn y Malphite. Su porcentaje de daño verdadero con W se vuelve más relevante en teamfights largos.', confidence: 0.85 },
  { champion: 'Jinx', category: 'synergy', content: 'Jinx + Thresh es la sinergia ADC-Support más fuerte del parche actual. El porcentaje de victoria combinado supera el 55%.', confidence: 0.95 },
  { champion: 'Amumu', category: 'tier-change', content: 'Amumu sube a Tier A gracias a los cambios en items de control. Su engage con R es devastador con el nuevo build de cooldown reduction.', confidence: 0.81 },
  { champion: 'Darius', category: 'counter', content: 'Darius counterpick a Renekton en top lane. Su pasiva de hemorragia supera la sustain de Renekton en trades extendidos.', confidence: 0.84 },
  { champion: 'Lulu', category: 'synergy', content: 'Lulu + Jhin forman una potente sinergia de poke y protección. La W de Lulu permite a Jhin posicionarse mejor para sus trampas.', confidence: 0.79 },
  { champion: 'Camille', category: 'nerf', content: 'Camille pierde velocidad de movimiento en su Q2. Esto reduce significativamente su capacidad de chase en el late game.', confidence: 0.86 },
  { champion: 'Master Yi', category: 'tier-change', content: 'Master Yi asciende a Tier S por primera vez en varias patches. Su win rate del 55.2% lo convierte en el jungler más consistente.', confidence: 0.96 },
];

const taskQueue = [
  { title: 'Verificar nuevas patches', description: 'Revisar servidores Riot cada 30 min para detectar nuevas patches disponibles.', status: 'done', pointer: 0, interval: 30 },
  { title: 'Actualizar tier list', description: 'Recalcular tiers basado en win rate, pick rate y ban rate actualizados.', status: 'running', pointer: 1, interval: 60 },
  { title: 'Generar insights de IA', description: 'Analizar cambios de patch y generar insights automáticos con IA.', status: 'pending', pointer: 2, interval: 45 },
  { title: 'Detectar cosas rotas', description: 'Identificar campeones con win rate anormalmente alto o bajo.', status: 'pending', pointer: 3, interval: 30 },
  { title: 'Actualizar badges de frescura', description: 'Marcar datos que tengan más de 24h como potentially stale.', status: 'done', pointer: 4, interval: 120 },
  { title: 'Analizar sinergias de meta', description: 'Detectar combinaciones OP de champions basadas en datos reales.', status: 'pending', pointer: 5, interval: 90 },
  { title: 'Actualizar counters', description: 'Recalcular matchups basados en datos de partidas recientes.', status: 'running', pointer: 6, interval: 60 },
  { title: 'Sincronizar datos de Wild Rift', description: 'Importar datos de champions de Wild Rift si hay cambios.', status: 'pending', pointer: 7, interval: 180 },
  { title: 'Generar resumen semanal', description: 'Crear un resumen semanal de cambios en el meta para el dashboard.', status: 'pending', pointer: 8, interval: 1440 },
  { title: 'Verificar builds recomendados', description: 'Validar que los builds recomendados sigan siendo óptimos.', status: 'done', pointer: 9, interval: 120 },
  { title: 'Monitorear tier changes', description: 'Detectar cambios drásticos en tiers de champions overnight.', status: 'running', pointer: 10, interval: 30 },
  { title: 'Actualizar runas sugeridas', description: 'Sincronizar runas óptimas basadas en el meta actual.', status: 'pending', pointer: 11, interval: 240 },
  { title: 'Procesar feedback de usuarios', description: 'Analizar reportes de usuarios sobre datos incorrectos.', status: 'pending', pointer: 12, interval: 60 },
  { title: 'Backup de base de datos', description: 'Realizar backup automático de la base de datos SQLite.', status: 'done', pointer: 13, interval: 360 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.champion.deleteMany();
  await prisma.patchNote.deleteMany();
  await prisma.aiInsight.deleteMany();
  await prisma.taskQueue.deleteMany();

  // Seed champions
  console.log(`📊 Seeding ${champions.length} champions...`);
  for (const c of champions) {
    await prisma.champion.create({ data: c });
  }

  // Seed patch notes
  console.log(`📝 Seeding ${patchNotes.length} patch notes...`);
  for (const p of patchNotes) {
    await prisma.patchNote.create({ data: p });
  }

  // Seed AI insights
  console.log(`🤖 Seeding ${aiInsights.length} AI insights...`);
  for (const i of aiInsights) {
    await prisma.aiInsight.create({ data: i });
  }

  // Seed task queue
  console.log(`📋 Seeding ${taskQueue.length} tasks...`);
  for (const t of taskQueue) {
    await prisma.taskQueue.create({ data: t });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
