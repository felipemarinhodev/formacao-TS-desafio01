import { dirname, resolve } from "node:path";
import { Serializable, SerializableStatic } from "../domain/types.js";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

export abstract class Database<Static extends SerializableStatic, Instance extends Serializable = InstanceType<Static>> {
  protected readonly dbPath: string;
  protected dbData: Map<string, Instance> = new Map();
  readonly dbEntity: Static;
  constructor(entity: Static) {
    this.dbEntity = entity;
    const filePath = fileURLToPath(import.meta.url);
    this.dbPath = resolve(dirname(filePath), `.data/${entity.name.toLowerCase()}.json`);
     this.#initialize();
  }

  #initialize() {
    if (!existsSync(dirname(this.dbPath))) {
      mkdirSync(dirname(this.dbPath), { recursive: true });
    }

    if (existsSync(this.dbPath)) {
      const data: [string, Record<string, unknown>][] = JSON.parse(readFileSync(this.dbPath, 'utf-8'));
      for (const [key, value] of data) {
        this.dbData.set(key, this.dbEntity.fromObject(value)); 
      }
      return
    }
    this.#updateFile() 
  }

  #updateFile() {
    const data = [...this.dbData.entries()].map(([key, value]) => [key, value.toObject()]);
    writeFileSync(this.dbPath, JSON.stringify(data)); 
    return this;
  }

  list() {
    return [...this.dbData.values()];
  }

  remove(id: string) {
    this.dbData.delete(id);
    return this.#updateFile();
  }
  
  save(entity: Instance) {
    this.dbData.set(entity.id, entity);
    return this.#updateFile();
  }

  listBy<Property extends keyof Instance> (property: Property, value: Instance[Property]) {
    const allData = this.list();
    return allData.filter((data) => {
      let comparable = data[property] as unknown;
      let comparison = value as unknown;
      // se a propriedade for um objeto, um array ou uma data
      // não temos como comparar usando ===
      // portanto camos converter tudo que cair nesses casos para string
      if (typeof comparable === 'object') {
        [comparable, comparison] = [JSON.stringify(comparable), JSON.stringify(comparison)];
      }
      // Ai podemos comparar os dois dados
      return comparable === comparison;
    })
  }

  findById(id: string) {
    return this.dbData.get(id)
  }
}
