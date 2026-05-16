'use client';

import { Button } from '@avenir/ui';

export function ActionBar({
  dirty,
  isCustom,
  savedAt,
  onSave,
  onCancel,
  onReset,
}: {
  dirty: boolean;
  isCustom: boolean;
  savedAt: number | null;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  const showSavedFlash = savedAt !== null && Date.now() - savedAt < 4000;
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-10">
      <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-muted-foreground">
          {dirty ? (
            <span className="text-accent font-medium">● Modifications non enregistrées</span>
          ) : showSavedFlash ? (
            <span className="text-green-600 font-medium">✓ Enregistré</span>
          ) : isCustom ? (
            <span>Paramètres personnalisés actifs (synchronisés dans le cloud)</span>
          ) : (
            <span>Paramètres par défaut</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Réinitialiser
          </Button>
          {dirty && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button variant="accent" size="sm" onClick={onSave} disabled={!dirty}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
