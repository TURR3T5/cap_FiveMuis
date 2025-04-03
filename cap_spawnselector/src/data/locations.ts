import { SpawnLocation } from '../types';

export const spawnLocations: SpawnLocation[] = [
  {
    id: 'location1',
    name: 'Los Santos Downtown',
    description: 'Urban center with high activity',
    x: 39,
    y: 49,
    color: '#FF4444',
    status: 'online',
  },
  {
    id: 'location2',
    name: 'Mount Chiliad',
    description: 'Remote mountain region',
    x: 66,
    y: 50,
    color: '#9944FF',
    status: 'online',
  },
  {
    id: 'location3',
    name: 'Sandy Shores',
    description: 'Desert outpost with moderate security',
    x: 60,
    y: 64,
    color: '#44FF44',
    status: 'online',
  },
  {
    id: 'location4',
    name: 'Paleto Bay',
    description: 'Northern coastal settlement',
    x: 72,
    y: 45,
    color: '#4488FF',
    status: 'offline',
  },
  {
    id: 'location5',
    name: 'Zancudo Military Base',
    description: 'Restricted military zone',
    x: 56.5,
    y: 27,
    color: '#FFAA44',
    status: 'restricted',
  },
];
