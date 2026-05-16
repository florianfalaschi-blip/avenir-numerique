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
  useSettingsDraft,
} from '../_shared';
import { fmtModifiedAt } from '../../calculateurs/_shared/format';

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
  const { draft, patch, save, cancel, reset, dirty, savedAt, isCustom } = useSettingsDraft<
    SharedPapierConfig[]
  >('shared.papiers', defaultSharedPapiers, {
    resetConfirmMessage: 'Réinitialiser le catalogue papiers aux valeurs par défaut ?',
  });

  return (
    <SettingsPageContainer>
      <SettingsHeader
        title="Catalogue Papiers"
        subtitle="Catalogue partagé utilisé par les calculateurs Flyers et Brochures. Chaque papier garde l'horodatage de sa dernière modification."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-xl">Papiers ({draft.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
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
        <CardContent className="space-y-4">
          {draft.map((p, pi) => (
            <div key={p.id} className="rounded-md border bg-secondary/20 p-3 space-y-3">
              {/* Entête papier : nom, grammage, techno, modif */}
              <div className="grid grid-cols-12 gap-2 items-center">
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
                  <span className="text-xs text-muted-foreground">g</span>
                </div>
                <div className="col-span-2 flex gap-3 items-center text-xs">
                  {TECHNOS.map((t) => (
                    <label key={t} className="flex items-center gap-1 cursor-pointer">
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
                        className="h-3.5 w-3.5 rounded border-input accent-primary"
                      />
                      {t === 'numerique' ? 'Num' : 'Off'}
                    </label>
                  ))}
                </div>
                <div
                  className="col-span-2 text-xs text-muted-foreground"
                  title={
                    p.lastModifiedAt
                      ? new Date(p.lastModifiedAt).toLocaleString('fr-FR')
                      : 'Jamais modifié'
                  }
                >
                  Modifié : {fmtModifiedAt(p.lastModifiedAt)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 text-muted-foreground hover:text-destructive justify-self-end"
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

              {/* Formats d'achat */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Formats d&apos;achat
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
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
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                  <div className="col-span-3">Largeur (mm)</div>
                  <div className="col-span-3">Hauteur (mm)</div>
                  <div className="col-span-2">Feuilles/paquet</div>
                  <div className="col-span-3">Prix paquet HT (€)</div>
                  <div className="col-span-1" />
                </div>
                {p.formats_achat.map((f, fi) => (
                  <div key={fi} className="grid grid-cols-12 gap-2 items-center">
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
                      className="col-span-1 text-muted-foreground hover:text-destructive"
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

          <p className="text-xs text-muted-foreground pt-2">
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

