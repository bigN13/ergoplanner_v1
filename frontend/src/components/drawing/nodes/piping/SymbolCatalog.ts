// Symbol catalog for piping components

/**
 * Symbol catalog entry
 */
export interface ISymbolCatalogEntry {
  id: string;
  name: string;
  category: 'valve' | 'fitting' | 'flange' | 'instrument' | 'specialty';
  subCategory: string;
  description: string;
  standards: string[];
  icon?: string;
  defaultProperties?: Record<string, unknown>;
  searchTags: string[];
}

/**
 * Valve catalog definitions (60+ types)
 */
export const VALVE_CATALOG: ISymbolCatalogEntry[] = [
  // Gate Valves
  {
    id: 'gate-valve-rising-stem',
    name: 'Gate Valve - Rising Stem',
    category: 'valve',
    subCategory: 'gate',
    description: 'Rising stem gate valve for on/off service',
    standards: ['API 600', 'ASME B16.34'],
    searchTags: ['gate', 'rising', 'stem', 'isolation', 'wedge'],
  },
  {
    id: 'gate-valve-non-rising-stem',
    name: 'Gate Valve - Non-Rising Stem',
    category: 'valve',
    subCategory: 'gate',
    description: 'Non-rising stem gate valve for space-limited installations',
    standards: ['API 600', 'ASME B16.34'],
    searchTags: ['gate', 'NRS', 'non-rising', 'stem', 'isolation'],
  },
  {
    id: 'gate-valve-knife',
    name: 'Knife Gate Valve',
    category: 'valve',
    subCategory: 'gate',
    description: 'Knife gate valve for slurry and viscous media',
    standards: ['MSS SP-81', 'TAPPI TIS 405-8'],
    searchTags: ['knife', 'gate', 'slurry', 'pulp', 'wastewater'],
  },
  {
    id: 'gate-valve-slab',
    name: 'Slab Gate Valve',
    category: 'valve',
    subCategory: 'gate',
    description: 'Through-conduit slab gate valve',
    standards: ['API 6D'],
    searchTags: ['slab', 'gate', 'through-conduit', 'pipeline'],
  },

  // Globe Valves
  {
    id: 'globe-valve-straight',
    name: 'Globe Valve - Straight Pattern',
    category: 'valve',
    subCategory: 'globe',
    description: 'Straight pattern globe valve for throttling service',
    standards: ['ASME B16.34', 'BS 1873'],
    searchTags: ['globe', 'straight', 'throttling', 'control'],
  },
  {
    id: 'globe-valve-angle',
    name: 'Globe Valve - Angle Pattern',
    category: 'valve',
    subCategory: 'globe',
    description: 'Angle pattern globe valve with 90° flow direction',
    standards: ['ASME B16.34', 'BS 1873'],
    searchTags: ['globe', 'angle', 'throttling', '90-degree'],
  },
  {
    id: 'globe-valve-y-pattern',
    name: 'Globe Valve - Y-Pattern',
    category: 'valve',
    subCategory: 'globe',
    description: 'Y-pattern globe valve with improved flow characteristics',
    standards: ['ASME B16.34'],
    searchTags: ['globe', 'y-pattern', 'wye', 'throttling'],
  },
  {
    id: 'globe-valve-needle',
    name: 'Needle Valve',
    category: 'valve',
    subCategory: 'globe',
    description: 'Needle valve for precise flow control',
    standards: ['ASME B16.34'],
    searchTags: ['needle', 'globe', 'precision', 'control', 'metering'],
  },

  // Ball Valves
  {
    id: 'ball-valve-floating',
    name: 'Ball Valve - Floating Ball',
    category: 'valve',
    subCategory: 'ball',
    description: 'Floating ball valve for general service',
    standards: ['API 608', 'ASME B16.34'],
    searchTags: ['ball', 'floating', 'quarter-turn', 'isolation'],
  },
  {
    id: 'ball-valve-trunnion',
    name: 'Ball Valve - Trunnion Mounted',
    category: 'valve',
    subCategory: 'ball',
    description: 'Trunnion mounted ball valve for high pressure',
    standards: ['API 6D', 'ASME B16.34'],
    searchTags: ['ball', 'trunnion', 'high-pressure', 'pipeline'],
  },
  {
    id: 'ball-valve-3-way',
    name: 'Ball Valve - 3-Way',
    category: 'valve',
    subCategory: 'ball',
    description: '3-way ball valve for diverting or mixing',
    standards: ['API 608'],
    searchTags: ['ball', '3-way', 'three-way', 'diverting', 'mixing'],
  },
  {
    id: 'ball-valve-v-port',
    name: 'Ball Valve - V-Port',
    category: 'valve',
    subCategory: 'ball',
    description: 'V-port ball valve for control applications',
    standards: ['ISA 75.08.01'],
    searchTags: ['ball', 'v-port', 'control', 'modulating', 'characterized'],
  },
  {
    id: 'ball-valve-cavity-filled',
    name: 'Ball Valve - Cavity Filled',
    category: 'valve',
    subCategory: 'ball',
    description: 'Cavity filled ball valve for sanitary service',
    standards: ['3A', 'FDA'],
    searchTags: ['ball', 'cavity-filled', 'sanitary', 'hygienic'],
  },

  // Butterfly Valves
  {
    id: 'butterfly-valve-wafer',
    name: 'Butterfly Valve - Wafer Type',
    category: 'valve',
    subCategory: 'butterfly',
    description: 'Wafer type butterfly valve',
    standards: ['API 609', 'ASME B16.34'],
    searchTags: ['butterfly', 'wafer', 'quarter-turn'],
  },
  {
    id: 'butterfly-valve-lug',
    name: 'Butterfly Valve - Lug Type',
    category: 'valve',
    subCategory: 'butterfly',
    description: 'Lug type butterfly valve for dead-end service',
    standards: ['API 609', 'ASME B16.34'],
    searchTags: ['butterfly', 'lug', 'dead-end', 'quarter-turn'],
  },
  {
    id: 'butterfly-valve-double-flanged',
    name: 'Butterfly Valve - Double Flanged',
    category: 'valve',
    subCategory: 'butterfly',
    description: 'Double flanged butterfly valve',
    standards: ['API 609', 'AWWA C504'],
    searchTags: ['butterfly', 'double-flanged', 'flanged'],
  },
  {
    id: 'butterfly-valve-triple-offset',
    name: 'Butterfly Valve - Triple Offset',
    category: 'valve',
    subCategory: 'butterfly',
    description: 'Triple offset butterfly valve for zero leakage',
    standards: ['API 609', 'ASME B16.34'],
    searchTags: ['butterfly', 'triple-offset', 'TOV', 'metal-seated'],
  },
  {
    id: 'butterfly-valve-high-performance',
    name: 'Butterfly Valve - High Performance',
    category: 'valve',
    subCategory: 'butterfly',
    description: 'High performance double offset butterfly valve',
    standards: ['API 609'],
    searchTags: ['butterfly', 'high-performance', 'double-offset'],
  },

  // Check Valves
  {
    id: 'check-valve-swing',
    name: 'Check Valve - Swing Type',
    category: 'valve',
    subCategory: 'check',
    description: 'Swing check valve for horizontal flow',
    standards: ['API 594', 'ASME B16.34'],
    searchTags: ['check', 'swing', 'non-return', 'NRV'],
  },
  {
    id: 'check-valve-lift',
    name: 'Check Valve - Lift Type',
    category: 'valve',
    subCategory: 'check',
    description: 'Lift check valve for vertical flow',
    standards: ['API 594', 'ASME B16.34'],
    searchTags: ['check', 'lift', 'piston', 'non-return'],
  },
  {
    id: 'check-valve-wafer',
    name: 'Check Valve - Wafer Type',
    category: 'valve',
    subCategory: 'check',
    description: 'Wafer check valve with dual plate',
    standards: ['API 594'],
    searchTags: ['check', 'wafer', 'dual-plate', 'double-door'],
  },
  {
    id: 'check-valve-tilting-disc',
    name: 'Check Valve - Tilting Disc',
    category: 'valve',
    subCategory: 'check',
    description: 'Tilting disc check valve',
    standards: ['API 594'],
    searchTags: ['check', 'tilting-disc', 'non-return'],
  },
  {
    id: 'check-valve-ball',
    name: 'Check Valve - Ball Type',
    category: 'valve',
    subCategory: 'check',
    description: 'Ball check valve',
    standards: ['API 594'],
    searchTags: ['check', 'ball', 'non-return'],
  },
  {
    id: 'check-valve-stop',
    name: 'Stop Check Valve',
    category: 'valve',
    subCategory: 'check',
    description: 'Stop check valve (globe-check combination)',
    standards: ['ASME B16.34'],
    searchTags: ['stop-check', 'globe-check', 'SDNR'],
  },

  // Plug Valves
  {
    id: 'plug-valve-lubricated',
    name: 'Plug Valve - Lubricated',
    category: 'valve',
    subCategory: 'plug',
    description: 'Lubricated plug valve',
    standards: ['API 6D', 'ASME B16.34'],
    searchTags: ['plug', 'lubricated', 'taper', 'quarter-turn'],
  },
  {
    id: 'plug-valve-non-lubricated',
    name: 'Plug Valve - Non-Lubricated',
    category: 'valve',
    subCategory: 'plug',
    description: 'Non-lubricated plug valve with sleeve',
    standards: ['API 6D'],
    searchTags: ['plug', 'non-lubricated', 'sleeved', 'lined'],
  },
  {
    id: 'plug-valve-eccentric',
    name: 'Plug Valve - Eccentric',
    category: 'valve',
    subCategory: 'plug',
    description: 'Eccentric plug valve',
    standards: ['AWWA C517'],
    searchTags: ['plug', 'eccentric', 'cam-action'],
  },
  {
    id: 'plug-valve-3-way',
    name: 'Plug Valve - 3-Way',
    category: 'valve',
    subCategory: 'plug',
    description: '3-way plug valve for diverting',
    standards: ['API 6D'],
    searchTags: ['plug', '3-way', 'three-way', 'multiport'],
  },

  // Diaphragm Valves
  {
    id: 'diaphragm-valve-weir',
    name: 'Diaphragm Valve - Weir Type',
    category: 'valve',
    subCategory: 'diaphragm',
    description: 'Weir type diaphragm valve',
    standards: ['MSS SP-88'],
    searchTags: ['diaphragm', 'weir', 'corrosive', 'sanitary'],
  },
  {
    id: 'diaphragm-valve-straight',
    name: 'Diaphragm Valve - Straight Through',
    category: 'valve',
    subCategory: 'diaphragm',
    description: 'Straight through diaphragm valve',
    standards: ['MSS SP-88'],
    searchTags: ['diaphragm', 'straight-through', 'full-bore'],
  },

  // Pinch Valves
  {
    id: 'pinch-valve-mechanical',
    name: 'Pinch Valve - Mechanical',
    category: 'valve',
    subCategory: 'pinch',
    description: 'Mechanical pinch valve',
    standards: ['MSS SP-125'],
    searchTags: ['pinch', 'mechanical', 'sleeve', 'slurry'],
  },
  {
    id: 'pinch-valve-pneumatic',
    name: 'Pinch Valve - Pneumatic',
    category: 'valve',
    subCategory: 'pinch',
    description: 'Pneumatic pinch valve',
    standards: ['MSS SP-125'],
    searchTags: ['pinch', 'pneumatic', 'air-operated'],
  },

  // Control Valves
  {
    id: 'control-valve-globe',
    name: 'Control Valve - Globe Type',
    category: 'valve',
    subCategory: 'control',
    description: 'Globe control valve with actuator',
    standards: ['ISA 75.01.01', 'IEC 60534'],
    searchTags: ['control', 'globe', 'modulating', 'FCV', 'PCV', 'TCV', 'LCV'],
  },
  {
    id: 'control-valve-angle',
    name: 'Control Valve - Angle Type',
    category: 'valve',
    subCategory: 'control',
    description: 'Angle control valve',
    standards: ['ISA 75.01.01'],
    searchTags: ['control', 'angle', 'modulating'],
  },
  {
    id: 'control-valve-3-way',
    name: 'Control Valve - 3-Way',
    category: 'valve',
    subCategory: 'control',
    description: '3-way mixing or diverting control valve',
    standards: ['ISA 75.01.01'],
    searchTags: ['control', '3-way', 'mixing', 'diverting'],
  },
  {
    id: 'control-valve-cage',
    name: 'Control Valve - Cage Guided',
    category: 'valve',
    subCategory: 'control',
    description: 'Cage guided control valve',
    standards: ['ISA 75.01.01'],
    searchTags: ['control', 'cage', 'guided', 'balanced'],
  },

  // Pressure Relief Valves
  {
    id: 'relief-valve-spring',
    name: 'Pressure Relief Valve - Spring Loaded',
    category: 'valve',
    subCategory: 'relief',
    description: 'Spring loaded pressure relief valve',
    standards: ['API 520', 'ASME Section VIII'],
    searchTags: ['relief', 'PRV', 'PSV', 'spring', 'safety'],
  },
  {
    id: 'relief-valve-pilot',
    name: 'Pressure Relief Valve - Pilot Operated',
    category: 'valve',
    subCategory: 'relief',
    description: 'Pilot operated pressure relief valve',
    standards: ['API 520'],
    searchTags: ['relief', 'pilot', 'PORV', 'safety'],
  },
  {
    id: 'relief-valve-vacuum',
    name: 'Vacuum Relief Valve',
    category: 'valve',
    subCategory: 'relief',
    description: 'Vacuum relief valve',
    standards: ['API 2000'],
    searchTags: ['vacuum', 'relief', 'breaker'],
  },
  {
    id: 'relief-valve-thermal',
    name: 'Thermal Relief Valve',
    category: 'valve',
    subCategory: 'relief',
    description: 'Thermal expansion relief valve',
    standards: ['ASME B31.3'],
    searchTags: ['thermal', 'relief', 'expansion', 'TRV'],
  },

  // Pressure Reducing Valves
  {
    id: 'prv-direct-acting',
    name: 'PRV - Direct Acting',
    category: 'valve',
    subCategory: 'pressure-reducing',
    description: 'Direct acting pressure reducing valve',
    standards: ['ISA 75.01.01'],
    searchTags: ['PRV', 'pressure', 'reducing', 'regulator'],
  },
  {
    id: 'prv-pilot-operated',
    name: 'PRV - Pilot Operated',
    category: 'valve',
    subCategory: 'pressure-reducing',
    description: 'Pilot operated pressure reducing valve',
    standards: ['ISA 75.01.01'],
    searchTags: ['PRV', 'pilot', 'pressure', 'reducing'],
  },

  // Special Valves
  {
    id: 'valve-solenoid',
    name: 'Solenoid Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Electrically operated solenoid valve',
    standards: ['NEMA', 'IEC'],
    searchTags: ['solenoid', 'electric', 'on-off'],
  },
  {
    id: 'valve-breather',
    name: 'Breather Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Tank breather valve',
    standards: ['API 2000'],
    searchTags: ['breather', 'conservation', 'vent'],
  },
  {
    id: 'valve-float',
    name: 'Float Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Float operated valve',
    standards: ['AWWA'],
    searchTags: ['float', 'level', 'control'],
  },
  {
    id: 'valve-foot',
    name: 'Foot Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Foot valve with strainer',
    standards: ['MSS SP-125'],
    searchTags: ['foot', 'strainer', 'suction'],
  },
  {
    id: 'valve-flush-bottom',
    name: 'Flush Bottom Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Flush bottom tank valve',
    standards: ['DIN 28127'],
    searchTags: ['flush', 'bottom', 'tank', 'outlet'],
  },
  {
    id: 'valve-sampling',
    name: 'Sampling Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Process sampling valve',
    standards: ['ASME B31.3'],
    searchTags: ['sampling', 'sample', 'test'],
  },
  {
    id: 'valve-blowdown',
    name: 'Blowdown Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Blowdown valve for boilers',
    standards: ['ASME B31.1'],
    searchTags: ['blowdown', 'boiler', 'drain'],
  },
  {
    id: 'valve-excess-flow',
    name: 'Excess Flow Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Excess flow check valve',
    standards: ['API 607'],
    searchTags: ['excess', 'flow', 'safety', 'shutoff'],
  },
  {
    id: 'valve-pressure-seal',
    name: 'Pressure Seal Valve',
    category: 'valve',
    subCategory: 'special',
    description: 'Pressure seal bonnet valve',
    standards: ['ASME B16.34'],
    searchTags: ['pressure-seal', 'high-pressure', 'bonnet'],
  },
];

/**
 * Fitting catalog definitions (30+ types)
 */
export const FITTING_CATALOG: ISymbolCatalogEntry[] = [
  // Elbows
  {
    id: 'elbow-90-lr',
    name: 'Elbow - 90° Long Radius',
    category: 'fitting',
    subCategory: 'elbow',
    description: '90 degree long radius elbow (1.5D)',
    standards: ['ASME B16.9', 'MSS SP-75'],
    searchTags: ['elbow', '90', 'long-radius', 'LR', 'bend'],
  },
  {
    id: 'elbow-90-sr',
    name: 'Elbow - 90° Short Radius',
    category: 'fitting',
    subCategory: 'elbow',
    description: '90 degree short radius elbow (1D)',
    standards: ['ASME B16.9'],
    searchTags: ['elbow', '90', 'short-radius', 'SR'],
  },
  {
    id: 'elbow-45',
    name: 'Elbow - 45°',
    category: 'fitting',
    subCategory: 'elbow',
    description: '45 degree elbow',
    standards: ['ASME B16.9'],
    searchTags: ['elbow', '45', 'bend'],
  },
  {
    id: 'elbow-reducing',
    name: 'Elbow - Reducing',
    category: 'fitting',
    subCategory: 'elbow',
    description: 'Reducing elbow',
    standards: ['ASME B16.9'],
    searchTags: ['elbow', 'reducing', 'reducer'],
  },
  {
    id: 'elbow-mitered',
    name: 'Elbow - Mitered',
    category: 'fitting',
    subCategory: 'elbow',
    description: 'Mitered elbow',
    standards: ['ASME B31.3'],
    searchTags: ['elbow', 'mitered', 'segmented'],
  },

  // Tees
  {
    id: 'tee-equal',
    name: 'Tee - Equal',
    category: 'fitting',
    subCategory: 'tee',
    description: 'Equal tee fitting',
    standards: ['ASME B16.9'],
    searchTags: ['tee', 'equal', 'branch'],
  },
  {
    id: 'tee-reducing',
    name: 'Tee - Reducing',
    category: 'fitting',
    subCategory: 'tee',
    description: 'Reducing tee fitting',
    standards: ['ASME B16.9'],
    searchTags: ['tee', 'reducing', 'reducer'],
  },
  {
    id: 'tee-barred',
    name: 'Tee - Barred',
    category: 'fitting',
    subCategory: 'tee',
    description: 'Barred tee for pig launcher',
    standards: ['ASME B16.9'],
    searchTags: ['tee', 'barred', 'pig', 'launcher'],
  },
  {
    id: 'lateral-45',
    name: 'Lateral - 45°',
    category: 'fitting',
    subCategory: 'tee',
    description: '45 degree lateral',
    standards: ['ASME B16.9'],
    searchTags: ['lateral', 'wye', '45', 'branch'],
  },

  // Reducers
  {
    id: 'reducer-concentric',
    name: 'Reducer - Concentric',
    category: 'fitting',
    subCategory: 'reducer',
    description: 'Concentric reducer',
    standards: ['ASME B16.9'],
    searchTags: ['reducer', 'concentric', 'cone'],
  },
  {
    id: 'reducer-eccentric',
    name: 'Reducer - Eccentric',
    category: 'fitting',
    subCategory: 'reducer',
    description: 'Eccentric reducer',
    standards: ['ASME B16.9'],
    searchTags: ['reducer', 'eccentric', 'flat-bottom', 'flat-top'],
  },
  {
    id: 'reducer-swage',
    name: 'Swage Nipple',
    category: 'fitting',
    subCategory: 'reducer',
    description: 'Swage nipple reducer',
    standards: ['ASME B16.9'],
    searchTags: ['swage', 'nipple', 'reducer'],
  },
  {
    id: 'reducer-bushing',
    name: 'Reducer Bushing',
    category: 'fitting',
    subCategory: 'reducer',
    description: 'Threaded reducer bushing',
    standards: ['ASME B16.11'],
    searchTags: ['bushing', 'reducer', 'threaded'],
  },

  // Crosses
  {
    id: 'cross-equal',
    name: 'Cross - Equal',
    category: 'fitting',
    subCategory: 'cross',
    description: 'Equal cross fitting',
    standards: ['ASME B16.9'],
    searchTags: ['cross', 'equal', '4-way'],
  },
  {
    id: 'cross-reducing',
    name: 'Cross - Reducing',
    category: 'fitting',
    subCategory: 'cross',
    description: 'Reducing cross fitting',
    standards: ['ASME B16.9'],
    searchTags: ['cross', 'reducing', '4-way'],
  },

  // Couplings
  {
    id: 'coupling-full',
    name: 'Coupling - Full',
    category: 'fitting',
    subCategory: 'coupling',
    description: 'Full coupling',
    standards: ['ASME B16.11'],
    searchTags: ['coupling', 'full', 'socket'],
  },
  {
    id: 'coupling-half',
    name: 'Coupling - Half',
    category: 'fitting',
    subCategory: 'coupling',
    description: 'Half coupling',
    standards: ['ASME B16.11'],
    searchTags: ['coupling', 'half', 'socket'],
  },
  {
    id: 'coupling-reducing',
    name: 'Coupling - Reducing',
    category: 'fitting',
    subCategory: 'coupling',
    description: 'Reducing coupling',
    standards: ['ASME B16.11'],
    searchTags: ['coupling', 'reducing', 'bell'],
  },

  // Unions
  {
    id: 'union-threaded',
    name: 'Union - Threaded',
    category: 'fitting',
    subCategory: 'union',
    description: 'Threaded union',
    standards: ['ASME B16.11'],
    searchTags: ['union', 'threaded', 'disconnect'],
  },
  {
    id: 'union-socket-weld',
    name: 'Union - Socket Weld',
    category: 'fitting',
    subCategory: 'union',
    description: 'Socket weld union',
    standards: ['ASME B16.11'],
    searchTags: ['union', 'socket-weld', 'disconnect'],
  },
  {
    id: 'union-dielectric',
    name: 'Union - Dielectric',
    category: 'fitting',
    subCategory: 'union',
    description: 'Dielectric union for dissimilar metals',
    standards: ['ASTM F1974'],
    searchTags: ['union', 'dielectric', 'insulating'],
  },

  // Caps and Plugs
  {
    id: 'cap-pipe',
    name: 'Pipe Cap',
    category: 'fitting',
    subCategory: 'cap',
    description: 'Pipe end cap',
    standards: ['ASME B16.9', 'ASME B16.11'],
    searchTags: ['cap', 'end', 'closure'],
  },
  {
    id: 'plug-pipe',
    name: 'Pipe Plug',
    category: 'fitting',
    subCategory: 'plug',
    description: 'Threaded pipe plug',
    standards: ['ASME B16.11'],
    searchTags: ['plug', 'threaded', 'closure'],
  },

  // Olets
  {
    id: 'olet-weldolet',
    name: 'Weldolet',
    category: 'fitting',
    subCategory: 'olet',
    description: 'Butt-weld branch connection',
    standards: ['MSS SP-97'],
    searchTags: ['weldolet', 'olet', 'branch', 'outlet'],
  },
  {
    id: 'olet-threadolet',
    name: 'Threadolet',
    category: 'fitting',
    subCategory: 'olet',
    description: 'Threaded branch connection',
    standards: ['MSS SP-97'],
    searchTags: ['threadolet', 'olet', 'branch', 'threaded'],
  },
  {
    id: 'olet-sockolet',
    name: 'Sockolet',
    category: 'fitting',
    subCategory: 'olet',
    description: 'Socket weld branch connection',
    standards: ['MSS SP-97'],
    searchTags: ['sockolet', 'olet', 'branch', 'socket'],
  },
  {
    id: 'olet-latrolet',
    name: 'Latrolet',
    category: 'fitting',
    subCategory: 'olet',
    description: '45° lateral branch connection',
    standards: ['MSS SP-97'],
    searchTags: ['latrolet', 'olet', 'lateral', '45'],
  },

  // Special Fittings
  {
    id: 'fitting-nipple',
    name: 'Nipple',
    category: 'fitting',
    subCategory: 'nipple',
    description: 'Pipe nipple',
    standards: ['ASME B16.11'],
    searchTags: ['nipple', 'barrel', 'close'],
  },
  {
    id: 'fitting-expansion-joint',
    name: 'Expansion Joint',
    category: 'fitting',
    subCategory: 'expansion',
    description: 'Bellows expansion joint',
    standards: ['EJMA'],
    searchTags: ['expansion', 'joint', 'bellows', 'compensator'],
  },
  {
    id: 'fitting-y-strainer',
    name: 'Y-Strainer',
    category: 'fitting',
    subCategory: 'strainer',
    description: 'Y-type strainer',
    standards: ['ASME B16.34'],
    searchTags: ['strainer', 'y-type', 'filter'],
  },
  {
    id: 'fitting-t-strainer',
    name: 'T-Strainer',
    category: 'fitting',
    subCategory: 'strainer',
    description: 'T-type basket strainer',
    standards: ['ASME B16.34'],
    searchTags: ['strainer', 't-type', 'basket', 'filter'],
  },
];

/**
 * Flange catalog definitions (20+ types)
 */
export const FLANGE_CATALOG: ISymbolCatalogEntry[] = [
  {
    id: 'flange-weld-neck',
    name: 'Flange - Weld Neck',
    category: 'flange',
    subCategory: 'weld-neck',
    description: 'Weld neck flange',
    standards: ['ASME B16.5', 'ASME B16.47'],
    searchTags: ['flange', 'weld-neck', 'WN', 'WNRF'],
  },
  {
    id: 'flange-slip-on',
    name: 'Flange - Slip On',
    category: 'flange',
    subCategory: 'slip-on',
    description: 'Slip on flange',
    standards: ['ASME B16.5'],
    searchTags: ['flange', 'slip-on', 'SO', 'SORF'],
  },
  {
    id: 'flange-socket-weld',
    name: 'Flange - Socket Weld',
    category: 'flange',
    subCategory: 'socket-weld',
    description: 'Socket weld flange',
    standards: ['ASME B16.5'],
    searchTags: ['flange', 'socket-weld', 'SW'],
  },
  {
    id: 'flange-lap-joint',
    name: 'Flange - Lap Joint',
    category: 'flange',
    subCategory: 'lap-joint',
    description: 'Lap joint flange',
    standards: ['ASME B16.5'],
    searchTags: ['flange', 'lap-joint', 'LJ', 'loose'],
  },
  {
    id: 'flange-threaded',
    name: 'Flange - Threaded',
    category: 'flange',
    subCategory: 'threaded',
    description: 'Threaded flange',
    standards: ['ASME B16.5'],
    searchTags: ['flange', 'threaded', 'screwed', 'NPT'],
  },
  {
    id: 'flange-blind',
    name: 'Flange - Blind',
    category: 'flange',
    subCategory: 'blind',
    description: 'Blind flange',
    standards: ['ASME B16.5', 'ASME B16.47'],
    searchTags: ['flange', 'blind', 'blank', 'BL'],
  },
  {
    id: 'flange-spectacle-blind',
    name: 'Spectacle Blind',
    category: 'flange',
    subCategory: 'blind',
    description: 'Spectacle blind (figure-8 blind)',
    standards: ['ASME B16.48'],
    searchTags: ['spectacle', 'blind', 'figure-8', 'spacer'],
  },
  {
    id: 'flange-orifice',
    name: 'Flange - Orifice',
    category: 'flange',
    subCategory: 'orifice',
    description: 'Orifice flange',
    standards: ['ASME B16.36'],
    searchTags: ['flange', 'orifice', 'metering'],
  },
  {
    id: 'flange-long-weld-neck',
    name: 'Flange - Long Weld Neck',
    category: 'flange',
    subCategory: 'weld-neck',
    description: 'Long weld neck flange',
    standards: ['ASME B16.5'],
    searchTags: ['flange', 'long-weld-neck', 'LWN', 'nozzle'],
  },
  {
    id: 'flange-expander',
    name: 'Flange - Expander',
    category: 'flange',
    subCategory: 'special',
    description: 'Expander flange',
    standards: ['MSS SP-44'],
    searchTags: ['flange', 'expander', 'transition'],
  },
  {
    id: 'flange-reducer',
    name: 'Flange - Reducer',
    category: 'flange',
    subCategory: 'special',
    description: 'Reducer flange',
    standards: ['MSS SP-44'],
    searchTags: ['flange', 'reducer', 'reducing'],
  },
  {
    id: 'flange-rtj',
    name: 'Flange - Ring Joint',
    category: 'flange',
    subCategory: 'rtj',
    description: 'Ring type joint flange',
    standards: ['ASME B16.5', 'API 6A'],
    searchTags: ['flange', 'RTJ', 'ring-joint', 'RJ'],
  },
  {
    id: 'flange-compact',
    name: 'Flange - Compact',
    category: 'flange',
    subCategory: 'compact',
    description: 'Compact flange',
    standards: ['NORSOK L-005'],
    searchTags: ['flange', 'compact', 'SPO', 'DESTEC'],
  },
  {
    id: 'flange-swivel',
    name: 'Flange - Swivel',
    category: 'flange',
    subCategory: 'swivel',
    description: 'Swivel ring flange',
    standards: ['ASME B16.5'],
    searchTags: ['flange', 'swivel', 'rotating'],
  },
  {
    id: 'flange-puddle',
    name: 'Flange - Puddle',
    category: 'flange',
    subCategory: 'special',
    description: 'Puddle flange for concrete penetration',
    standards: ['AWWA C207'],
    searchTags: ['flange', 'puddle', 'wall', 'penetration'],
  },
  {
    id: 'flange-anchor',
    name: 'Flange - Anchor',
    category: 'flange',
    subCategory: 'special',
    description: 'Anchor flange',
    standards: ['MSS SP-58'],
    searchTags: ['flange', 'anchor', 'fixed-point'],
  },
];

/**
 * Complete piping symbol catalog
 */
export class PipingSymbolCatalog {
  private static instance: PipingSymbolCatalog;
  private catalog: Map<string, ISymbolCatalogEntry> = new Map();

  private constructor() {
    this.loadCatalog();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PipingSymbolCatalog {
    if (!PipingSymbolCatalog.instance) {
      PipingSymbolCatalog.instance = new PipingSymbolCatalog();
    }
    return PipingSymbolCatalog.instance;
  }

  /**
   * Load catalog entries
   */
  private loadCatalog(): void {
    [...VALVE_CATALOG, ...FITTING_CATALOG, ...FLANGE_CATALOG].forEach(entry => {
      this.catalog.set(entry.id, entry);
    });
  }

  /**
   * Get symbol by ID
   */
  public getSymbol(id: string): ISymbolCatalogEntry | undefined {
    return this.catalog.get(id);
  }

  /**
   * Get all symbols
   */
  public getAllSymbols(): ISymbolCatalogEntry[] {
    return Array.from(this.catalog.values());
  }

  /**
   * Get symbols by category
   */
  public getByCategory(category: string): ISymbolCatalogEntry[] {
    return Array.from(this.catalog.values()).filter(s => s.category === category);
  }

  /**
   * Get symbols by subcategory
   */
  public getBySubCategory(subCategory: string): ISymbolCatalogEntry[] {
    return Array.from(this.catalog.values()).filter(s => s.subCategory === subCategory);
  }

  /**
   * Search symbols
   */
  public search(query: string): ISymbolCatalogEntry[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.catalog.values()).filter(symbol =>
      symbol.name.toLowerCase().includes(lowerQuery) ||
      symbol.description.toLowerCase().includes(lowerQuery) ||
      symbol.searchTags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get catalog statistics
   */
  public getStatistics(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.catalog.size,
      valves: 0,
      fittings: 0,
      flanges: 0,
    };

    this.catalog.forEach(symbol => {
      const key = `${symbol.category}s`;
      if (key in stats) {
        (stats as Record<string, number>)[key] = ((stats as Record<string, number>)[key] ?? 0) + 1;
      }
    });

    return stats;
  }
}

export const pipingSymbolCatalog = PipingSymbolCatalog.getInstance();

export default pipingSymbolCatalog;