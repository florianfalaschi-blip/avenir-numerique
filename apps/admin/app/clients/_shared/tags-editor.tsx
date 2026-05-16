'use client';

import { useState } from 'react';
import { Button, Input } from '@avenir/ui';

const SUGGESTED_TAGS = [
  'VIP',
  'partenaire',
  'prospect',
  'fidèle',
  'sensible-prix',
  'mauvais-payeur',
  'à-relancer',
];

export function TagsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const add = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (!clean) return;
    if (value.includes(clean)) return;
    onChange([...value, clean]);
    setInput('');
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder="Ajouter un tag…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(input);
            }
          }}
          className="max-w-xs"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => add(input)}>
          Ajouter
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => remove(tag)}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              title="Cliquer pour supprimer"
            >
              {tag}
              <span aria-hidden>✕</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Aucun tag. Tape un tag puis Entrée pour l&apos;ajouter.
        </p>
      )}

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Suggestions :</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_TAGS.filter((t) => !value.includes(t)).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground border border-border px-2.5 py-0.5 text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
