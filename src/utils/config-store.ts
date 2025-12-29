import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface ConfigSettings {
  apiBaseUrl?: string;
  uiBaseUrl?: string;
}

export interface ConfigStore {
  getStoreFilePath(): string;
  get(): Promise<ConfigSettings>;
  set(settings: Partial<ConfigSettings>): Promise<void>;
  reset(): Promise<void>;
}

export class FileConfigStore implements ConfigStore {
  private filePath: string;
  private configCache: ConfigSettings | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  getStoreFilePath(): string {
    return this.filePath;
  }

  async get(): Promise<ConfigSettings> {
    return this.cache;
  }

  async set(settings: Partial<ConfigSettings>): Promise<void> {
    const currentConfig = this.cache;
    this.configCache = { ...currentConfig, ...settings };
    this.writeConfigCache();
  }

  async reset(): Promise<void> {
    this.configCache = {};
    this.writeConfigCache();
  }

  /**
   * Safe accessor that ensures cache is loaded
   */
  private get cache(): ConfigSettings {
    if (this.configCache === null) {
      this.loadConfigCache();
    }
    return this.configCache!;
  }

  private loadConfigCache(): void {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    } catch (err: any) {
      if (err.code !== "EEXIST") throw err;
    }

    try {
      const content = fs.readFileSync(this.filePath, "utf8");
      this.configCache = JSON.parse(content);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        this.configCache = {};
      } else {
        throw err;
      }
    }
  }

  private writeConfigCache(): void {
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(this.cache, null, 2),
      "utf8"
    );
  }
}

export function createDefaultConfigStore(): ConfigStore {
  const filePath = path.join(os.homedir(), ".stallion", "config.json");
  return new FileConfigStore(filePath);
}
