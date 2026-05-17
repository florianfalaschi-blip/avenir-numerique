'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import {
  defaultSharedPapiers,
  type SharedPapierConfig,
} from '@/lib/shared-catalogues/papiers';
import {
  ActionBar,
  SettingsHeader,
  SettingsPageContainer,
  fmtModifiedShort,
  useSettingsDraft,
} from '../_shared';

const TECHNOS = ['offset', 'numerique'] as const;

/** Mette à jour un papier de la liste et marque son lastModifiedAt. */
function updatePapier(
  list: SharedPapierConfig[],
  index: number,
  changes: Partial<SharedPapierConfig>
): SharedPapierConfig[] {
  const next = [...list];
  next[index] = { ...next[index]!, ...changes, lastModifiedAt: Date.now() };
  return next;
}

export default function ParametresPapiersPage() {
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom, updatedAt } = useSettingsDraft<
    SharedPapierConfig[]
  >('shared.papiers', defaultSharedPapiers, {
    resetConfirmMessage: 'Réinitialiser le catalogue papiers aux valeurs par défaut ?',
  });

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Catalogue Papiers"
        subtitle="Catalogue partagé utilisé par les calculateurs Flyers et Brochures. Chaque papier garde l'horodatage de sa dernière modification."
        updatedAt={updatedAt}
      />

      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">Papiers ({draft.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() =>
                patch((d) => [
                  ...d,
                  {
                    id: `papier_${Date.now()}`,
                    nom: 'Nouveau papier',
                    grammage: 135,
                    formats_achat: [
                      {
                        largeur_mm: 320,
                        hauteur_mm: 450,
                        prix_paquet_ht: 0,
                        feuilles_par_paquet: 500,
                      },
                    ],
                    compatible_techno: ['numerique', 'offset'],
                    lastModifiedAt: Date.now(),
                  },
                ])
              }
            >
              + Ajouter un papier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0 space-y-2">
          {draft.map((p, pi) => (
            <div
              key={p.id}
              className="rounded-md border bg-secondary/20 p-2.5 space-y-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80"
            >
              {/* Entête papier : nom, grammage, techno, modif */}
              <div className="grid grid-cols-12 gap-1.5 items-center">
                <Input
                  className="col-span-5"
                  value={p.nom}
                  placeholder="Nom du papier"
                  onChange={(e) =>
                    patch((d) => updatePapier(d, pi, { nom: e.target.value }))
                  }
                />
                <div className="col-span-2 flex gap-1 items-center">
                  <Input
                    type="number"
                    min={1}
                    step={5}
                    value={p.grammage}
                    onChange={(e) =>
                      patch((d) =>
                        updatePapier(d, pi, { grammage: Number(e.target.value) || 0 })
                      )
                    }
                  />
                  <span className="text-[10px] text-muted-foreground">g</span>
                </div>
                <div className="col-span-2 flex gap-2 items-center">
                  {TECHNOS.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-1 cursor-pointer normal-case tracking-normal"
                    >
                      <input
                        type="checkbox"
                        checked={p.compatible_techno.includes(t)}
                        onChange={(e) =>
                          patch((d) => {
                            const set = new Set(d[pi]!.compatible_techno);
                            if (e.target.checked) set.add(t);
                            else set.delete(t);
                            return updatePapier(d, pi, { compatible_techno: [...set] });
                          })
                        }
                        className="h-3 w-3 rounded border-input accent-primary"
                      />
                      {t === 'numerique' ? 'Num' : 'Off'}
                    </label>
                  ))}
                </div>
                <span
                  className="col-span-2 text-[10px] text-muted-foreground/70 whitespace-nowrap tabular-nums"
                  title={
                    p.lastModifiedAt
                      ? new Date(p.lastModifiedAt).toLocaleString('fr-FR')
                      : 'Jamais modifié'
                  }
                >
                  {fmtModifiedShort(p.lastModifiedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 h-7 w-7 text-muted-foreground hover:text-destructive justify-self-end"
                  onClick={() => patch((d) => d.filter((_, j) => j !== pi))}
                  aria-label={`Supprimer ${p.nom}`}
                  disabled={draft.length === 1}
                  title={
                    draft.length === 1 ? 'Au moins un papier requis' : 'Supprimer le papier'
                  }
                >
                  ✕
                </Button>
              </div>

              {/* Fournisseur + Main (sub-line) */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-60">
                  <label className="shrink-0 w-24">Fournisseur</label>
                  <Input
                    className="flex-1 max-w-md"
                    value={p.fournisseur ?? ''}
                    placeholder="ex. Antalis, Inapa, Igepa…"
                    onChange={(e) =>
                      patch((d) =>
                        updatePapier(d, pi, {
                          fournisseur: e.target.value === '' ? undefined : e.target.value,
                        })
                      )
                    }
                  />
                </div>
                <div
                  className="flex items-center gap-2"
                  title="Main = épaisseur réelle du papier en µm par g/m². 1.0 (couché brillant) → 1.7 (bouffant épais). Sert au calcul d'épaisseur des brochures."
                >
                  <label className="shrink-0">Main</label>
                  <Input
                    className="w-16"
                    type="number"
                    min={0.5}
                    max={3}
                    step={0.05}
                    value={p.main ?? ''}
                    placeholder="1.3"
                    onChange={(e) => {
                      const v = e.target.value;
                      patch((d) =>
                        updatePapier(d, pi, {
                          main: v === '' ? undefined : Number(v) || undefined,
                        })
                      );
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">µm/g</span>
                </div>
              </div>

              {/* Formats d'achat */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                    Formats d&apos;achat
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() =>
                      patch((d) =>
                        updatePapier(d, pi, {
                          formats_achat: [
                            ...d[pi]!.formats_achat,
                            {
                              largeur_mm: 320,
                              hauteur_mm: 450,
                              prix_paquet_ht: 0,
                              feuilles_par_paquet: 500,
                            },
                          ],
                        })
                      )
                    }
                  >
                    + Format
                  </Button>
                </div>
                <div className="grid grid-cols-12 gap-1.5 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide px-1">
                  <div className="col-span-3">Largeur (mm)</div>
                  <div className="col-span-3">Hauteur (mm)</div>
                  <div className="col-span-2">Feuilles/paquet</div>
                  <div className="col-span-3">Prix paquet HT (€)</div>
                  <div className="col-span-1" />
                </div>
                {p.formats_achat.map((f, fi) => (
                  <div key={fi} className="grid grid-cols-12 gap-1.5 items-center">
                    <Input
                      className="col-span-3"
                      type="number"
                      min={1}
                      step={10}
                      value={f.largeur_mm}
                      onChange={(e) =>
                        patch((d) => {
                          const fmts = [...d[pi]!.formats_achat];
                          fmts[fi] = { ...fmts[fi]!, largeur_mm: Number(e.target.value) || 0 };
                          return updatePapier(d, pi, { formats_achat: fmts });
                        })
                      }
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      min={1}
                      step={10}
                      value={f.hauteur_mm}
                      onChange={(e) =>
                        patch((d) => {
                          const fmts = [...d[pi]!.formats_achat];
                          fmts[fi] = { ...fmts[fi]!, hauteur_mm: Number(e.target.value) || 0 };
                          return updatePapier(d, pi, { formats_achat: fmts });
                        })
                      }
                    />
                    <Input
                      className="col-span-2"
                      type="number"
                      min={1}
                      step={50}
                      value={f.feuilles_par_paquet}
                      onChange={(e) =>
                        patch((d) => {
                          const fmts = [...d[pi]!.formats_achat];
                          fmts[fi] = {
                            ...fmts[fi]!,
                            feuilles_par_paquet: Number(e.target.value) || 0,
                          };
                          return updatePapier(d, pi, { formats_achat: fmts });
                        })
                      }
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      min={0}
                      step={0.5}
                      value={f.prix_paquet_ht}
                      onChange={(e) =>
                        patch((d) => {
                          const fmts = [...d[pi]!.formats_achat];
                          fmts[fi] = {
                            ...fmts[fi]!,
                            prix_paquet_ht: Number(e.target.value) || 0,
                          };
                          return updatePapier(d, pi, { formats_achat: fmts });
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="col-span-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        patch((d) =>
                          updatePapier(d, pi, {
                            formats_achat: d[pi]!.formats_achat.filter((_, j) => j !== fi),
                          })
                        )
                      }
                      aria-label="Supprimer ce format"
                      disabled={p.formats_achat.length === 1}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-[11px] text-muted-foreground pt-1">
            💡 Le timestamp <em>Modifié</em> se met à jour automatiquement quand tu changes un
            champ. Il n&apos;est persisté qu&apos;après <strong>Enregistrer</strong>. Le bouton
            <em>Annuler</em> revient à la version sauvegardée.
          </p>
        </CardContent>
      </Card>

      <ActionBar
        dirty={dirty}
        isCustom={isCustom}
        savedAt={savedAt}
        onSave={save}
        onCancel={cancel}
        onReset={reset}
      />
    </SettingsPageContainer>
  );
}
