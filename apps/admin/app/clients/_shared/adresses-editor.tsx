'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import { emptyAdresse, type Adresse } from '@/lib/clients';

/**
 * Éditeur du carnet d'adresses du client.
 *
 * Convention :
 * - Chaque adresse a deux flags `usage_facturation` / `usage_livraison` qui
 *   indiquent à quoi elle peut servir (les deux possibles).
 * - Une (et une seule) adresse par usage peut être marquée comme défaut
 *   (`defaut_facturation` / `defaut_livraison`), sélectionnée par radio button.
 * - Quand on coche une case d'usage, l'adresse devient candidate ; quand on
 *   décoche, on retire aussi son flag défaut associé.
 */
export function AdressesEditor({
  value,
  onChange,
}: {
  value: Adresse[];
  onChange: (next: Adresse[]) => void;
}) {
  const update = (i: number, changes: Partial<Adresse>) => {
    const next = [...value];
    next[i] = { ...next[i]!, ...changes };
    onChange(next);
  };

  const setDefaut = (i: number, usage: 'facturation' | 'livraison') => {
    const field = usage === 'facturation' ? 'defaut_facturation' : 'defaut_livraison';
    onChange(value.map((a, j) => ({ ...a, [field]: j === i })));
  };

  const toggleUsage = (i: number, usage: 'facturation' | 'livraison', checked: boolean) => {
    const next = [...value];
    if (usage === 'facturation') {
      next[i] = {
        ...next[i]!,
        usage_facturation: checked,
        // Si on décoche l'usage, on retire aussi le flag "défaut"
        defaut_facturation: checked ? next[i]!.defaut_facturation : false,
      };
    } else {
      next[i] = {
        ...next[i]!,
        usage_livraison: checked,
        defaut_livraison: checked ? next[i]!.defaut_livraison : false,
      };
    }
    onChange(next);
  };

  const add = () => {
    // Si c'est la première adresse, la marquer comme défaut pour les deux usages
    const isFirst = value.length === 0;
    const fresh = emptyAdresse();
    if (isFirst) {
      fresh.defaut_facturation = true;
      fresh.defaut_livraison = true;
    }
    onChange([...value, fresh]);
  };

  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  return (
    <Card>
      <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm">Carnet d&apos;adresses ({value.length})</CardTitle>
            <CardDescription className="text-[11px]">
              Une adresse peut servir à la facturation, à la livraison ou aux deux. Marque
              une adresse par défaut pour chaque usage.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={add}>
            + Ajouter une adresse
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0 space-y-2.5">
        {value.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucune adresse. Ajoute au moins une adresse pour permettre la facturation et la
            livraison sur les devis.
          </p>
        )}
        {value.map((a, i) => (
          <div
            key={a.id}
            className="rounded-md border bg-secondary/20 p-2 space-y-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0"
          >
            {/* En-tête : label + boutons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                value={a.label ?? ''}
                placeholder='Libellé (ex. "Siège", "Entrepôt Lyon")'
                className="flex-1 min-w-48"
                onChange={(e) => update(i, { label: e.target.value || undefined })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => remove(i)}
              >
                ✕ Supprimer
              </Button>
            </div>

            {/* Adresse postale */}
            <div className="space-y-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
              <Field label="Ligne 1">
                <Input
                  value={a.ligne1}
                  onChange={(e) => update(i, { ligne1: e.target.value })}
                />
              </Field>
              <Field label="Ligne 2" hint="Optionnel (complément, bâtiment…)">
                <Input
                  value={a.ligne2 ?? ''}
                  onChange={(e) => update(i, { ligne2: e.target.value || undefined })}
                />
              </Field>
              <div className="grid gap-2.5 md:grid-cols-3">
                <Field label="CP">
                  <Input
                    value={a.cp}
                    onChange={(e) => update(i, { cp: e.target.value })}
                  />
                </Field>
                <Field label="Ville" className="md:col-span-2">
                  <Input
                    value={a.ville}
                    onChange={(e) => update(i, { ville: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Pays">
                <Select
                  value={a.pays ?? 'France'}
                  onChange={(e) => update(i, { pays: e.target.value })}
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Autre">Autre</option>
                </Select>
              </Field>
            </div>

            {/* Usages + défauts */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {/* Colonne Facturation */}
              <div className="rounded-md border bg-background p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!a.usage_facturation}
                    onChange={(e) => toggleUsage(i, 'facturation', e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span>📄 Facturation</span>
                </label>
                <label
                  className={`flex items-center gap-2 text-xs cursor-pointer pl-6 ${
                    !a.usage_facturation ? 'opacity-40' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="defaut-facturation"
                    checked={!!a.defaut_facturation && !!a.usage_facturation}
                    disabled={!a.usage_facturation}
                    onChange={() => setDefaut(i, 'facturation')}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  <span className={a.defaut_facturation ? 'font-medium text-primary' : ''}>
                    {a.defaut_facturation ? '★ Adresse par défaut' : 'Définir par défaut'}
                  </span>
                </label>
              </div>

              {/* Colonne Livraison */}
              <div className="rounded-md border bg-background p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!a.usage_livraison}
                    onChange={(e) => toggleUsage(i, 'livraison', e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span>📦 Livraison</span>
                </label>
                <label
                  className={`flex items-center gap-2 text-xs cursor-pointer pl-6 ${
                    !a.usage_livraison ? 'opacity-40' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="defaut-livraison"
                    checked={!!a.defaut_livraison && !!a.usage_livraison}
                    disabled={!a.usage_livraison}
                    onChange={() => setDefaut(i, 'livraison')}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  <span className={a.defaut_livraison ? 'font-medium text-primary' : ''}>
                    {a.defaut_livraison ? '★ Adresse par défaut' : 'Définir par défaut'}
                  </span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="[&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
              <Field label="Notes" hint="ex. Quai 3, accès camion uniquement…">
                <Input
                  value={a.notes ?? ''}
                  onChange={(e) => update(i, { notes: e.target.value || undefined })}
                />
              </Field>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-1">
          💡 Une adresse de siège peut être à la fois facturation et livraison. Pour un client
          B2B avec entrepôts, ajoute une adresse par site avec uniquement « Livraison » coché.
        </p>
      </CardContent>
    </Card>
  );
}
