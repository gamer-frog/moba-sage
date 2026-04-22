'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import { getDdVersion, CHAMPION_NAME_MAP } from './helpers';

interface SkillIconProps {
  championName: string;
  skill: 'Q' | 'W' | 'E' | 'R';
  size?: number;
}

const SKILL_COLORS: Record<string, string> = {
  Q: '#0acbe6',
  W: '#0fba81',
  E: '#f0c646',
  R: '#e84057',
};

// Skill names displayed on fallback when icon fails
const SKILL_NAMES: Record<string, Record<'Q'|'W'|'E'|'R', string>> = {
  'Master Yi':    { Q: 'Alpha', W: 'Wuju', E: 'Meditate', R: 'Highland' },
  'Jinx':         { Q: 'Zap', W: 'Flame', E: 'Shrapnel', R: 'Super Mega' },
  'Lee Sin':      { Q: 'Tempest', W: 'Safeguard', E: 'Iron Will', R: 'Kick' },
  'Katarina':     { Q: 'Bouncing', W: 'Prep', E: 'Shunpo', R: 'Death Lotus' },
  'Ahri':         { Q: 'Orb', W: 'Fox-Fire', E: 'Charm', R: 'Spirit Rush' },
  'Darius':       { Q: 'Decimate', W: 'Cripple', E: 'Apprehend', R: 'Noxian Might' },
  'Thresh':       { Q: 'Hook', W: 'Lantern', E: 'Flay', R: 'The Box' },
  'Malphite':     { Q: 'Seismic', W: 'Thunderclap', E: 'Ground Slam', R: 'Unstoppable' },
  'Nautilus':     { Q: 'Hook', W: 'Titan', E: 'Riptide', R: 'Depth Charge' },
  'Brand':        { Q: 'Fireball', W: 'Pillar', E: 'Conflag', R: 'Pyroclasm' },
  'Garen':        { Q: 'Decisive', W: 'Courage', E: 'Judgment', R: 'Demacian' },
  'Diana':        { Q: 'Crescent', W: 'Pale', E: 'Moonfall', R: 'Lunar Rush' },
  'Ashe':         { Q: 'Frost Shot', W: 'Ranger', E: 'Volley', R: 'Enchanted' },
  'Ezreal':       { Q: 'Mystic', W: 'Essence', E: 'Arcane Shift', R: 'Trueshot' },
  'Zed':          { Q: 'Shuriken', W: 'Shadow Slash', E: 'Shadow Swap', R: 'Death Mark' },
  'Vayne':        { Q: 'Tumble', W: 'Silver Bolt', E: 'Condemn', R: 'Final Hour' },
  'Caitlyn':      { Q: 'Piltover', W: 'Yordle Trap', E: 'Net Gun', R: 'Ace in Hole' },
  'Morgana':      { Q: 'Dark Binding', W: 'Black Shield', E: 'Tormented', R: 'Soul Shackles' },
  'Jhin':         { Q: 'Dancing', W: 'Deadly', E: 'Captive', R: 'Curtain Call' },
  'Vi':           { Q: 'Vault', W: 'Denting', E: 'Relentless', R: 'Cease & Desist' },
  'Graves':       { Q: 'Buckshot', W: 'Smoke', E: 'Quickdraw', R: 'Collateral' },
  'Lulu':         { Q: 'Glitterlance', W: 'Whimsy', E: 'Help Pix', R: 'Wild Growth' },
  'Orianna':      { Q: 'Command', W: 'Dissonance', E: 'Command Attack', R: 'Shockwave' },
  'Syndra':       { Q: 'Dark Sphere', W: 'Force of Will', E: 'Scatter', R: 'Unleashed' },
  'Camille':      { Q: 'Q', W: 'Tactical', E: 'Hookshot', R: 'Hextech Ultimatum' },
  'Wukong':       { Q: 'Crushing', W: 'Decoy', E: 'Nimbus', R: 'Cyclone' },
  'Kennen':       { Q: 'Thunder', W: 'Lightning Rush', E: 'Magnetic', R: 'Slicing Mael' },
  'Shen':         { Q: 'Vorpal', W: 'Shield', E: 'Shadow Dash', R: 'Stand United' },
  'Yasuo':        { Q: 'Steel Tempest', W: 'Wind Wall', E: 'Sweeping Blade', R: 'Last Breath' },
};

// Some champions have non-standard DDragon spell keys
const SPELL_KEY_OVERRIDES: Record<string, Partial<Record<'Q'|'W'|'E'|'R', string>>> = {
  'Katarina':      { Q: 'KatarinaRicochet', E: 'KatarinaShunpo' },
  'Nidalee':       { W: 'NidaleeJavelin', E: 'NidaleeBushwhack', R: 'NidaleeAspectOfCougar' },
  'Shaco':         { W: 'ShacoBox', E: 'ShacoCage' },
  'Rengar':        { R: 'RengarThrillOfTheHunt' },
  'Fiddlesticks':  { E: 'DrainMundo', W: 'FiddleSticksDrain' },
  'Jayce':         { R: 'JayceMercuryCannon', E: 'JayceThunderingBlow' },
  'Nunu':          { W: 'NunuSnowballBarrage', E: 'NunuBloodBoil', R: 'NunuAbsoluteZero' },
  'Quinn':         { R: 'QuinnValorMark', E: 'QuinnVault' },
  'Kindred':       { W: 'KindredWolfBite', R: 'KindredLambResurrect' },
  'Viego':         { W: 'ViegoW', E: 'ViegoE', R: 'ViegoR' },
  'KSante':        { E: 'KSanteE', R: 'KSanteR' },
  'FiddleSticks':  { W: 'FiddleSticksDrain', E: 'FiddleSticksCrowstorm', R: 'FiddleSticksRequiem' },
  'Belveth':       { E: 'BelvethE', R: 'BelvethR' },
  'Velkoz':        { E: 'VelkozE', R: 'VelkozR' },
  'Chogath':        { W: 'ChogathW', E: 'ChogathE', R: 'ChogathR' },
  'Khazix':        { W: 'KhazixTasteTheirFear', E: 'KhazixLeap', R: 'KhazixVoidAssault' },
  'RekSai':        { E: 'RekSaiPreySeeker', R: 'RekSaiVoidBurst' },
  'TwistedFate':   { W: 'TwistedFatePickACard', R: 'TwistedFateDestiny', E: 'TwistedFate' },
  'Leblanc':       { W: 'LeblancSigilOfMalice', R: 'Leblanc' },
  'MissFortune':   { W: 'MissFortuneStrut', E: 'MissFortune' },
  'LeeSin':        { W: 'LeeSinSafeguard', E: 'LeeSinIronWill', R: 'LeeSinKick' },
  'MasterYi':      { Q: 'MasterYiQ', W: 'MasterYiWujujuStyle', E: 'MasterYiMeditate', R: 'MasterYiHighlander' },
  'XinZhao':      { E: 'XinZhaoAudaciousCharge', R: 'XinZhaoCrescentSweep' },
  'Aatrox':        { W: 'AatroxW', E: 'AatroxE', R: 'AatroxR' },
  'Elise':         { Q: 'EliseQ', W: 'EliseSpiderFormCocoon', E: 'EliseRappel', R: 'EliseR' },
  // Complete spell keys para todos los campeones del tier list
  'Ahri':          { Q: 'AhriTumble', R: 'AhriSoulExplosion' },
  'Darius':        { Q: 'DariusDecimate', W: 'DariusCripplingStrike', E: 'DariusApprehend', R: 'DariusNoxianGuillotine' },
  'Thresh':        { Q: 'ThreshQ', W: 'ThreshW', E: 'ThreshE', R: 'ThreshR' },
  'Malphite':      { Q: 'MalphiteQ', W: 'MalphiteW', E: 'MalphiteE', R: 'MalphiteR' },
  'Nautilus':      { Q: 'NautilusAnchorDrag', W: 'NautilusTitanWraith', E: 'NautilusRiptide', R: 'NautilusGrandLine' },
  'Brand':         { Q: 'BrandBlaze', W: 'BrandPillarOfFlame', E: 'BrandConflagration', R: 'BrandPyroclasm' },
  'Garen':         { Q: 'GarenQ', W: 'GarenW', E: 'GarenE', R: 'GarenR' },
  'Diana':         { Q: 'DianaQ', W: 'DianaW', E: 'DianaE', R: 'DianaR' },
  'Ashe':          { Q: 'AsheQ', W: 'AsheW', E: 'AsheE', R: 'AsheR' },
  'Ezreal':        { Q: 'EzrealQ', W: 'EzrealW', E: 'EzrealE', R: 'EzrealR' },
  'Zed':           { Q: 'ZedQ', W: 'ZedW', E: 'ZedE', R: 'ZedR' },
  'Vayne':         { Q: 'VayneTumble', W: 'VayneSilverBolts', E: 'VayneCondemn', R: 'VayneInquisition' },
  'Caitlyn':       { Q: 'CaitlynQ', W: 'CaitlynW', E: 'CaitlynE', R: 'CaitlynR' },
  'Morgana':       { Q: 'MorganaQ', W: 'MorganaW', E: 'MorganaE', R: 'MorganaR' },
  'Jhin':          { Q: 'JhinQ', W: 'JhinW', E: 'JhinE', R: 'JhinR' },
  'Vi':            { Q: 'ViQ', W: 'ViW', E: 'ViE', R: 'ViR' },
  'Graves':        { Q: 'GravesQ', W: 'GravesW', E: 'GravesE', R: 'GravesR' },
  'Lulu':          { Q: 'LuluQ', W: 'LuluW', E: 'LuluE', R: 'LuluR' },
  'Orianna':       { Q: 'OriannaQ', W: 'OriannaW', E: 'OriannaE', R: 'OriannaR' },
  'Syndra':        { Q: 'SyndraQ', W: 'SyndraW', E: 'SyndraE', R: 'SyndraR' },
  'Camille':       { Q: 'CamilleQ', W: 'CamilleW', E: 'CamilleE', R: 'CamilleR' },
  'MonkeyKing':    { Q: 'MonkeyKingQ', W: 'MonkeyKingDecoy', E: 'MonkeyKingNimbusStrike', R: 'MonkeyKingCyclone' },
  'Kennen':        { Q: 'KennenQ', W: 'KennenW', E: 'KennenE', R: 'KennenR' },
  'Shen':          { Q: 'ShenQ', W: 'ShenW', E: 'ShenE', R: 'ShenR' },
  'Yasuo':         { Q: 'YasuoQ', W: 'YasuoW', E: 'YasuoE', R: 'YasuoR3' },
  'Jinx':          { Q: 'JinxQ', W: 'JinxW', E: 'JinxE', R: 'JinxR' },
  'Ornn':          { Q: 'OrnnQ', W: 'OrnnW', E: 'OrnnE', R: 'OrnnR' },
  'Briar':         { Q: 'BriarQ', W: 'BriarW', E: 'BriarE', R: 'BriarR' },
  'AurelionSol':   { W: 'AurelionSolW', E: 'AurelionSolE', R: 'AurelionSolR' },
  'Veigar':        { Q: 'VeigarQ', W: 'VeigarW', E: 'VeigarE', R: 'VeigarR' },
  'Nilah':         { Q: 'NilahQ', W: 'NilahW', E: 'NilahE', R: 'NilahR' },
  'Soraka':        { Q: 'SorakaQ', W: 'SorakaW', E: 'SorakaE', R: 'SorakaR' },
  'Zyra':          { Q: 'ZyraQ', W: 'ZyraW', E: 'ZyraE', R: 'ZyraR' },
  'Nocturne':      { Q: 'NocturneQ', W: 'NocturneW', E: 'NocturneE', R: 'NocturneR' },
  'Blitzcrank':    { Q: 'BlitzcrankQ', W: 'BlitzcrankW', E: 'BlitzcrankE', R: 'BlitzcrankR' },
  'Senna':         { Q: 'SennaQ', W: 'SennaW', E: 'SennaE', R: 'SennaR' },
  'Draven':        { Q: 'DravenQ', W: 'DravenW', E: 'DravenE', R: 'DravenR' },
  'Renekton':      { Q: 'RenektonQ', W: 'RenektonW', E: 'RenektonE', R: 'RenektonR' },
  'Volibear':      { Q: 'VolibearQ', W: 'VolibearW', E: 'VolibearE', R: 'VolibearR' },
  'Tristana':      { Q: 'TristanaQ', W: 'TristanaW', E: 'TristanaE', R: 'TristanaR' },
  'Amumu':         { Q: 'AmumuQ', W: 'AmumuW', E: 'AmumuE', R: 'AmumuR' },
  'Leona':         { Q: 'LeonaQ', W: 'LeonaW', E: 'LeonaE', R: 'LeonaR' },
  'Nami':          { Q: 'NamiQ', W: 'NamiW', E: 'NamiE', R: 'NamiR' },
  'Rakan':         { Q: 'RakanQ', W: 'RakanW', E: 'RakanE', R: 'RakanR' },
  'Lux':           { Q: 'LuxQ', W: 'LuxW', E: 'LuxE', R: 'LuxR' },
  'Braum':         { Q: 'BraumQ', W: 'BraumW', E: 'BraumE', R: 'BraumR' },
  'Bard':          { Q: 'BardQ', W: 'BardW', E: 'BardE', R: 'BardR' },
  'Mordekaiser':   { Q: 'MordekaiserQ', W: 'MordekaiserW', E: 'MordekaiserE', R: 'MordekaiserR' },
  'Azir':          { Q: 'AzirQ', W: 'AzirW', E: 'AzirE', R: 'AzirR' },
  'Ekko':          { Q: 'EkkoQ', W: 'EkkoW', E: 'EkkoE', R: 'EkkoR' },
  'Taliyah':       { Q: 'TaliyahQ', W: 'TaliyahW', E: 'TaliyahE', R: 'TaliyahR' },
  'Ivern':         { Q: 'IvernQ', W: 'IvernW', E: 'IvernE', R: 'IvernR' },
  'Kalista':       { Q: 'KalistaQ', W: 'KalistaW', E: 'KalistaE', R: 'KalistaR' },
  'Skarner':       { Q: 'SkarnerQ', W: 'SkarnerW', E: 'SkarnerE', R: 'SkarnerR' },
  'Urgot':         { Q: 'UrgotQ', W: 'UrgotW', E: 'UrgotE', R: 'UrgotR' },
  'Yorick':        { Q: 'YorickQ', W: 'YorickW', E: 'YorickE', R: 'YorickR' },
};

function getSpellKey(championName: string, skill: 'Q' | 'W' | 'E' | 'R'): string {
  const override = SPELL_KEY_OVERRIDES[championName];
  if (override && override[skill]) return override[skill];
  // Default: {ChampKey}{Q/W/E/R}
  const mapped = CHAMPION_NAME_MAP[championName];
  const champKey = mapped || championName.replace(/['\s.]/g, '');
  return `${champKey}${skill}`;
}

export const SkillIcon = memo(function SkillIcon({ championName, skill, size = 32 }: SkillIconProps) {
  const [imgError, setImgError] = useState(false);
  const color = SKILL_COLORS[skill];
  const version = getDdVersion();
  const spellKey = getSpellKey(championName, skill);
  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellKey}.png`;

  return (
    <div
      className="relative rounded-lg overflow-hidden shrink-0 group"
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${color}50`,
        boxShadow: `0 0 8px ${color}15`,
      }}
      title={`${championName} - ${skill}`}
    >
      {!imgError ? (
        <Image
          src={iconUrl}
          alt={`${championName} ${skill}`}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          loading="lazy"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center"
          style={{
            backgroundColor: `${color}20`,
          }}
        >
          <span className="font-black leading-none" style={{ color, fontSize: size * 0.4 }}>{skill}</span>
          {(() => {
            const names = SKILL_NAMES[championName];
            if (names && names[skill]) {
              return <span className="text-[6px] font-medium leading-none mt-0.5" style={{ color: `${color}99` }}>{names[skill]}</span>;
            }
            return null;
          })()}
        </div>
      )}
      {!imgError && (
        <div
          className="absolute bottom-0 right-0 w-1/2 h-1/2 flex items-center justify-center text-[8px] font-black"
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#f0e6d2',
            borderTopLeftRadius: '2px',
          }}
        >
          {skill}
        </div>
      )}
    </div>
  );
});

export function AbilityBar({ championName }: { championName: string }) {
  const skills: Array<'Q' | 'W' | 'E' | 'R'> = ['Q', 'W', 'E', 'R'];
  return (
    <div className="flex items-center gap-1.5">
      {skills.map(skill => (
        <SkillIcon key={skill} championName={championName} skill={skill} size={32} />
      ))}
    </div>
  );
}
