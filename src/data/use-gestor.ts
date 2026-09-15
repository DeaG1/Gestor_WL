import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings, WLItem } from '../lib/types.ts';
import * as itemsRepo from './items-repo.ts';
import * as settingsRepo from './settings-repo.ts';
import { DEFAULT_SETTINGS } from './settings-repo.ts';

export interface GestorRepos {
  listItems: () => Promise<WLItem[]>;
  insertItem: (item: Omit<WLItem, 'id'>) => Promise<WLItem>;
  updateItem: (id: string, patch: Partial<WLItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getSettings: () => Promise<Settings>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
}

export const defaultRepos: GestorRepos = {
  listItems: itemsRepo.listItems,
  insertItem: itemsRepo.insertItem,
  updateItem: itemsRepo.updateItem,
  deleteItem: itemsRepo.deleteItem,
  getSettings: settingsRepo.getSettings,
  saveSettings: settingsRepo.saveSettings,
};

export interface Gestor {
  items: WLItem[];
  settings: Settings;
  loading: boolean;
  error: string | null;
  dismissError: () => void;
  reload: () => Promise<void>;
  addItem: (item: Omit<WLItem, 'id'>) => Promise<void>;
  saveItem: (id: string, patch: Partial<WLItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
}

const message = (e: unknown): string => (e instanceof Error ? e.message : String(e));

export const useGestor = (repos: GestorRepos = defaultRepos): Gestor => {
  const [items, setItems] = useState<WLItem[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsRef = useRef<WLItem[]>([]);
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);

  const applyItems = useCallback((next: WLItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const applySettings = useCallback((next: Settings) => {
    settingsRef.current = next;
    setSettings(next);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedItems, loadedSettings] = await Promise.all([
        repos.listItems(),
        repos.getSettings(),
      ]);
      applyItems(loadedItems);
      applySettings(loadedSettings);
      setError(null);
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [repos, applyItems, applySettings]);

  useEffect(() => { void reload(); }, [reload]);

  const addItem = useCallback(async (item: Omit<WLItem, 'id'>) => {
    try {
      const saved = await repos.insertItem(item);
      applyItems([...itemsRef.current, saved]);
      setError(null);
    } catch (e) {
      setError(message(e));
    }
  }, [repos, applyItems]);

  const saveItem = useCallback(async (id: string, patch: Partial<WLItem>) => {
    const previous = itemsRef.current;
    applyItems(previous.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    try {
      await repos.updateItem(id, patch);
      setError(null);
    } catch (e) {
      applyItems(previous);
      setError(message(e));
    }
  }, [repos, applyItems]);

  const removeItem = useCallback(async (id: string) => {
    const previous = itemsRef.current;
    applyItems(previous.filter((i) => i.id !== id));
    try {
      await repos.deleteItem(id);
      setError(null);
    } catch (e) {
      applyItems(previous);
      setError(message(e));
    }
  }, [repos, applyItems]);

  const setSetting = useCallback(async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const previous = settingsRef.current;
    applySettings({ ...previous, [key]: value });
    try {
      await repos.saveSettings({ [key]: value } as Partial<Settings>);
      setError(null);
    } catch (e) {
      applySettings(previous);
      setError(message(e));
    }
  }, [repos, applySettings]);

  const dismissError = useCallback(() => setError(null), []);

  return {
    items, settings, loading, error,
    dismissError, reload, addItem, saveItem, removeItem, setSetting,
  };
};
