import { Injectable } from '@nestjs/common';
import { StudySet } from '@nostalgic/shared';
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(__dirname, '../../../data/sets.json');

@Injectable()
export class SetsService {
  private sets: StudySet[] = [];

  constructor() {
    this.loadSets();
  }

  private loadSets(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        this.sets = JSON.parse(data);
        console.log(`Loaded ${this.sets.length} sets from disk`);
      } else {
        this.sets = [
          {
            id: 'demo',
            title: 'French basics',
            description: 'Simple greetings and essentials.',
            visibility: 'public',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            terms: [
              { id: '1', term: 'Bonjour', definition: 'Hello' },
              { id: '2', term: 'Merci', definition: 'Thank you' },
              { id: '3', term: 'Au revoir', definition: 'Goodbye' }
            ]
          }
        ];
        this.saveSets();
      }
    } catch (err) {
      console.error('Error loading sets:', err);
      this.sets = [];
    }
  }

  private saveSets(): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.sets, null, 2), 'utf-8');
      console.log(`Saved ${this.sets.length} sets to disk`);
    } catch (err) {
      console.error('Error saving sets:', err);
    }
  }

  findAll(): StudySet[] {
    return this.sets;
  }

  findOne(id: string): StudySet | undefined {
    return this.sets.find((set) => set.id === id);
  }

  create(payload: Omit<StudySet, 'createdAt' | 'updatedAt'>): StudySet {
    const set: StudySet = {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.sets.push(set);
    this.saveSets();
    return set;
  }

  update(id: string, payload: Omit<StudySet, 'createdAt' | 'updatedAt' | 'id'>): StudySet | null {
    const set = this.sets.find((s) => s.id === id);
    if (!set) return null;
    const updated: StudySet = {
      ...set,
      ...payload,
      id: set.id,
      createdAt: set.createdAt,
      updatedAt: new Date().toISOString()
    };
    const index = this.sets.indexOf(set);
    this.sets[index] = updated;
    this.saveSets();
    return updated;
  }

  delete(id: string): { deleted: boolean } {
    const index = this.sets.findIndex((set) => set.id === id);
    if (index === -1) {
      return { deleted: false };
    }
    this.sets.splice(index, 1);
    this.saveSets();
    return { deleted: true };
  }
}
