'use client';

/**
 * Factory de store partagé pour les entités stockées dans les vraies tables
 * Supabase (clients, devis, commandes, factures).
 *
 * Architecture :
 * - Un store module-level par entité — partagé entre tous les composants
 *   qui consomment le hook
 * - Loading lazy : premier mount → fetch ; les suivants utilisent le cache
 * - Optimistic UI : add/update/delete modifient le state local immédiatement
 *   et fire-and-forget le write Supabase ; rollback en cas d'erreur
 * - `subscribe` exposé via `useSyncExternalStore` (API React 18+ standard)
 *
 * L'API publique reste identique à l'ancienne (à base de `useSettings`) :
 * `items`, `addItem`, `updateItem`, `deleteItem`, `hydrated`, `refresh`.
 * Les pages n'ont rien à modifier.
 */

import { useSyncExternalStore } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

// ============================================================
// Types
// ============================================================

export type TableName = 'clients' | 'devis' | 'commandes' | 'factures';

export interface TableStoreConfig<T extends { id: string }, TRow> {
  /** Nom de la table Supabase. */
  table: TableName;
  /** Convertit une row Supabase → entité de l'app. */
  rowToEntity: (row: TRow) => T;
  /** Convertit une entité complète → row pour INSERT. */
  entityToInsertRow: (entity: T) => Record<string, unknown>;
  /** Convertit un changement partiel → row pour UPDATE. */
  changesToUpdateRow: (
    changes: Partial<T>,
    current: T
  ) => Record<string, unknown>;
}

interface InternalState<T> {
  items: T[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  /** ID user en cours — sert à invalider le cache si l'user change (login/logout). */
  userId: string | null;
}

export interface TableStore<T extends { id: string }> {
  /** Hook React — retourne le state courant. */
  useStore: () => InternalState<T>;
  /** Ajoute un item localement + Supabase (fire-and-forget). */
  addItem: (item: T) => void;
  /** Modifie un item localement + Supabase. */
  updateItem: (id: string, changes: Partial<T>) => void;
  /** Supprime un item localement + Supabase. */
  deleteItem: (id: string) => void;
  /** Force un re-fetch depuis Supabase. */
  refresh: (user: User | null) => Promise<void>;
  /** Reset complet du cache local (utilisé lors du logout). */
  reset: () => void;
  /** Recharge si user a changé (appelé par le hook de chaque composant). */
  ensureLoadedFor: (user: User | null) => void;
  /** Pour debug/tests : snapshot synchrone du state. */
  getSnapshot: () => InternalState<T>;
}

// ============================================================
// Factory
// ============================================================

export function createTableStore<T extends { id: string }, TRow>(
  config: TableStoreConfig<T, TRow>
): TableStore<T> {
  let state: InternalState<T> = {
    items: [],
    hydrated: false,
    loading: false,
    error: null,
    userId: null,
  };
  const listeners = new Set<() => void>();

  function setState(next: Partial<InternalState<T>>) {
    state = { ...state, ...next };
    listeners.forEach((fn) => fn());
  }

  function subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }

  function getSnapshot() {
    return state;
  }

  async function refresh(user: User | null): Promise<void> {
    if (!user) {
      setState({ items: [], hydrated: false, loading: false, error: null, userId: null });
      return;
    }
    setState({ loading: true, error: null, userId: user.id });
    try {
      const { data, error } = await getSupabase().from(config.table).select('*');
      if (error) {
        console.error(`[table-store/${config.table}] load failed:`, error.message);
        setState({ loading: false, error: error.message });
        return;
      }
      const mapped = (data ?? []).map((row) => config.rowToEntity(row as TRow));
      setState({ items: mapped, hydrated: true, loading: false, error: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      console.error(`[table-store/${config.table}] load exception:`, msg);
      setState({ loading: false, error: msg });
    }
  }

  function ensureLoadedFor(user: User | null) {
    if (!user) {
      // logout — purge le cache si pas déjà fait
      if (state.userId !== null) {
        setState({ items: [], hydrated: false, error: null, userId: null });
      }
      return;
    }
    // Premier mount OU user a changé → fetch
    if (state.userId !== user.id) {
      void refresh(user);
    }
  }

  function addItem(item: T): void {
    // Optimistic
    setState({ items: [item, ...state.items] });
    const row = config.entityToInsertRow(item);
    void getSupabase()
      .from(config.table)
      .insert(row as never)
      .then(({ error }) => {
        if (error) {
          console.error(`[table-store/${config.table}] insert failed:`, error.message);
          // Rollback
          setState({ items: state.items.filter((i) => i.id !== item.id) });
        }
      });
  }

  function updateItem(id: string, changes: Partial<T>): void {
    const current = state.items.find((i) => i.id === id);
    if (!current) {
      console.warn(`[table-store/${config.table}] updateItem: item ${id} non trouvé`);
      return;
    }
    // Optimistic
    const updated = { ...current, ...changes } as T;
    setState({
      items: state.items.map((i) => (i.id === id ? updated : i)),
    });
    const row = config.changesToUpdateRow(changes, current);
    void getSupabase()
      .from(config.table)
      .update(row as never)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error(`[table-store/${config.table}] update failed:`, error.message);
          // Rollback
          setState({
            items: state.items.map((i) => (i.id === id ? current : i)),
          });
        }
      });
  }

  function deleteItem(id: string): void {
    const removed = state.items.find((i) => i.id === id);
    if (!removed) return;
    setState({ items: state.items.filter((i) => i.id !== id) });
    void getSupabase()
      .from(config.table)
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error(`[table-store/${config.table}] delete failed:`, error.message);
          // Rollback
          setState({ items: [removed, ...state.items] });
        }
      });
  }

  function reset(): void {
    setState({ items: [], hydrated: false, loading: false, error: null, userId: null });
  }

  function useStore(): InternalState<T> {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  return {
    useStore,
    addItem,
    updateItem,
    deleteItem,
    refresh,
    reset,
    ensureLoadedFor,
    getSnapshot,
  };
}
