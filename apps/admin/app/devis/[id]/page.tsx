'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import { fmtEur } from '../../calculateurs/_shared/format';
import { useClients, clientLabel, clientTypeBadge } from '@/lib/clients';
import {
  useDevis,
  STATUT_LABELS,
  STATUT_COLORS,
  effectivePrixHt,
  getDevisLignes,
  updateLigneInDevis,
  removeLigneFromDevis,
  type Devis,
  type DevisLigne,
  type DevisStatut,
} from '@/lib/devis';
import {
  useCommandes,
  buildEtapesFor,
  newCommandeId,
  type Commande,
} from '@/lib/commandes';
import { CALC_LABELS, CALC_SLUGS, type CalcSlug } from '@/lib/default-params';

const STATUTS: DevisStatut[] = ['brouillon', 'envoye', 'accepte', 'refuse', 'archive'];

const CALC_ICONS: Record<CalcSlug, string> = {
  rollup: '🎯',
  plaques: '🟦',
  flyers: '📰',
  bobines: '🏷️',
  brochures: '📖',
};

export default function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getDevis, updateDevis, deleteDevis, hydrated } = useDevis();
  const { getClient } = useClients();

  const { addCommande, commandeForDevis, nextNumero: nextCommandeNumero } =
    useCommandes();

  const devis = getDevis(id);
  const commandeLiee = devis ? commandeForDevis(devis.id) : undefined;
  const [notes, setNotes] = useState(devis?.notes ?? '');
  const [overrideEnabled, setOverrideEnabled] = useState(
    devis?.prix_ht_override !== undefined
  );
  const [overrideValue, setOverrideValue] = useState(
    devis?.prix_ht_override ?? devis?.prix_ht ?? 0
  );
  const [remisePct, setRemisePct] = useState(devis?.remise_manuelle_pct ?? 0);

  if (!hydrated) {
    return <p className="text-muted-foreground text-sm">Chargement…</p>;
  }
  if (!devis) {
    return (
      <div className="space-y-4">
        <div className="text-sm">
          <Link href="/devis" className="text-muted-foreground hover:text-primary">
            ← Devis
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Devis introuvable</CardTitle>
            <CardDescription>
              Ce devis n&apos;existe pas (ou plus).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const client = getClient(devis.client_id);
  const date = new Date(devis.date_creation);

  const handleStatutChange = (statut: DevisStatut) => {
    const changes: Partial<typeof devis> = { statut };
    if (statut === 'envoye' && !devis.date_envoi) {
      changes.date_envoi = Date.now();
    }
    updateDevis(devis.id, changes);
  };

  const handleSaveNotes = () => {
    updateDevis(devis.id, { notes: notes.trim() || undefined });
  };

  const handleSavePriceOverride = () => {
    updateDevis(devis.id, {
      prix_ht_override: overrideEnabled ? overrideValue : undefined,
      remise_manuelle_pct: !overrideEnabled && remisePct > 0 ? remisePct : undefined,
    });
  };

  const handleDelete = () => {
    if (!confirm(`Supprimer définitivement le devis ${devis.numero} ?`)) return;
    deleteDevis(devis.id);
    router.push('/devis');
  };

  const handleCreerCommande = () => {
    // Récupère toutes les lignes (multi ou implicite legacy) et propage à la
    // commande pour que les snapshots (PDF, facture, etc.) restent fidèles.
    const lignes = getDevisLignes(devis);
    const snapshotRecapAggregated =
      lignes.length > 1
        ? lignes
            .map((l) => l.recap ?? l.designation)
            .filter(Boolean)
            .join('\n---\n')
        : devis.recap;
    const newCmd: Commande = {
      id: newCommandeId(),
      numero: nextCommandeNumero(),
      devis_id: devis.id,
      devis_numero: devis.numero,
      client_id: devis.client_id,
      calculateur: devis.calculateur,
      date_creation: Date.now(),
      statut: 'en_preparation',
      etapes: buildEtapesFor(devis.calculateur),
      snapshot_prix_ht: effectivePrixHt(devis),
      snapshot_prix_ttc: devis.prix_ttc,
      snapshot_quantite: devis.quantite,
      snapshot_recap: snapshotRecapAggregated,
      lignes,
    };
    addCommande(newCmd);
    router.push(`/commandes/${newCmd.id}`);
  };

  const effectivePrice = effectivePrixHt(devis);

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/devis" className="text-muted-foreground hover:text-primary">
          ← Devis
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight font-mono">
              {devis.numero}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUT_COLORS[devis.statut]}`}
            >
              {STATUT_LABELS[devis.statut]}
            </span>
          </div>
          <p className="text-muted-foreground">
            Créé le {date.toLocaleDateString('fr-FR')} à{' '}
            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {commandeLiee ? (
            <Link href={`/commandes/${commandeLiee.id}`}>
              <Button variant="accent">📦 Voir la commande {commandeLiee.numero}</Button>
            </Link>
          ) : devis.statut === 'accepte' ? (
            <Button variant="accent" onClick={handleCreerCommande}>
              📦 Créer la commande de production
            </Button>
          ) : null}
          <Link href={`/devis/${devis.id}/imprimer`}>
            <Button variant="outline">🖨️ Imprimer / PDF</Button>
          </Link>
          {client && (
            <Link href={`/calculateurs/${devis.calculateur}?devis_pour=${client.id}`}>
              <Button variant="outline">Re-calculer →</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Client</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              {client ? (
                <Link
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 hover:bg-secondary/40 -mx-2 px-2 py-1.5 rounded transition-colors"
                >
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      clientTypeBadge(client.type).className
                    }`}
                  >
                    {clientTypeBadge(client.type).label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{clientLabel(client)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {client.email}
                    </p>
                  </div>
                  <span aria-hidden className="text-muted-foreground text-sm">
                    →
                  </span>
                </Link>
              ) : (
                <p className="text-destructive text-sm">
                  ⚠️ Client supprimé (ID: <code>{devis.client_id}</code>)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lignes du devis */}
          <LignesCard
            devis={devis}
            onUpdateLigne={(ligneId, changes) => {
              const updated = updateLigneInDevis(devis, ligneId, changes);
              updateDevis(devis.id, {
                lignes: updated.lignes,
                prix_ht: updated.prix_ht,
                prix_ttc: updated.prix_ttc,
                quantite: updated.quantite,
                calculateur: updated.calculateur,
              });
            }}
            onDeleteLigne={(ligneId) => {
              try {
                const updated = removeLigneFromDevis(devis, ligneId);
                updateDevis(devis.id, {
                  lignes: updated.lignes,
                  prix_ht: updated.prix_ht,
                  prix_ttc: updated.prix_ttc,
                  quantite: updated.quantite,
                  calculateur: updated.calculateur,
                });
              } catch (e) {
                alert(e instanceof Error ? e.message : String(e));
              }
            }}
            onAddLigne={(calc) => {
              // Lance le calculateur choisi en mode "ajouter au devis"
              router.push(
                `/calculateurs/${calc}?devis_pour=${devis.client_id}&add_to_devis=${devis.id}`
              );
            }}
          />


          {/* Personnalisations prix */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Ajustement du prix</CardTitle>
              <CardDescription className="text-[11px]">
                Override manuel ou remise commerciale supplémentaire.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0 space-y-2.5 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="override-enabled"
                  checked={overrideEnabled}
                  onChange={(e) => setOverrideEnabled(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-input accent-primary"
                />
                <label htmlFor="override-enabled" className="text-xs cursor-pointer normal-case tracking-normal text-foreground">
                  Override manuel du prix HT
                </label>
              </div>
              {overrideEnabled ? (
                <Field label="Prix HT manuel (€)">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(Number(e.target.value) || 0)}
                  />
                </Field>
              ) : (
                <Field
                  label="Remise commerciale supplémentaire (%)"
                  hint="Appliquée au prix HT calculé"
                >
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={remisePct}
                    onChange={(e) => setRemisePct(Number(e.target.value) || 0)}
                  />
                </Field>
              )}
              <div className="rounded-md bg-accent/10 p-2 text-xs space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Prix HT initial</span>
                  <span>{fmtEur(devis.prix_ht)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Prix HT effectif</span>
                  <span>{fmtEur(
                    overrideEnabled
                      ? overrideValue
                      : remisePct > 0
                        ? devis.prix_ht * (1 - remisePct / 100)
                        : devis.prix_ht
                  )}</span>
                </div>
              </div>
              <Button onClick={handleSavePriceOverride} variant="default" size="sm" className="h-7 px-2 text-xs">
                Appliquer l&apos;ajustement
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              <textarea
                className="flex w-full min-h-16 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={notes}
                placeholder="Spécificités client, conditions, etc."
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
              />
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Prix HT/TTC */}
          <Card className="border-accent/30">
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Montant</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0 space-y-2">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-sm text-muted-foreground">HT effectif</span>
                <span className="text-xl font-bold">{fmtEur(effectivePrice)}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-sm text-muted-foreground">TTC initial</span>
                <span className="text-sm">{fmtEur(devis.prix_ttc)}</span>
              </div>
              {devis.prix_ht_override !== undefined && (
                <p className="text-xs text-accent font-medium pt-1">
                  ⚠ Prix overridé manuellement
                </p>
              )}
              {devis.remise_manuelle_pct !== undefined && devis.remise_manuelle_pct > 0 && (
                <p className="text-xs text-accent font-medium pt-1">
                  Remise commerciale : {devis.remise_manuelle_pct} %
                </p>
              )}
            </CardContent>
          </Card>

          {/* Statut */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Statut</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0 space-y-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0">
              <Select
                value={devis.statut}
                onChange={(e) => handleStatutChange(e.target.value as DevisStatut)}
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {STATUT_LABELS[s]}
                  </option>
                ))}
              </Select>
              {devis.date_envoi && (
                <p className="text-xs text-muted-foreground">
                  Envoyé le{' '}
                  {new Date(devis.date_envoi).toLocaleDateString('fr-FR')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm text-destructive">
                Supprimer
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="w-full h-7 text-xs"
              >
                Supprimer ce devis
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/**
 * Affiche les lignes du devis avec édition inline (désignation, quantité,
 * prix override) et possibilité de supprimer / ajouter une ligne.
 *
 * Gère aussi les devis legacy 1-ligne via getDevisLignes() — la 1re modif
 * "matérialise" la ligne implicite en ligne explicite.
 */
function LignesCard({
  devis,
  onUpdateLigne,
  onDeleteLigne,
  onAddLigne,
}: {
  devis: Devis;
  onUpdateLigne: (ligneId: string, changes: Partial<DevisLigne>) => void;
  onDeleteLigne: (ligneId: string) => void;
  onAddLigne: (calc: CalcSlug) => void;
}) {
  const lignes = getDevisLignes(devis);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm">
              Produits commandés ({lignes.length})
            </CardTitle>
            <CardDescription className="text-[11px]">
              {lignes.length === 1
                ? '1 produit. Ajoute une autre ligne pour grouper plusieurs produits.'
                : `${lignes.length} produits sur ce devis. Total HT recalculé automatiquement.`}
            </CardDescription>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() => setAddMenuOpen((v) => !v)}
            >
              + Ajouter une ligne ▾
            </Button>
            {addMenuOpen && (
              <>
                {/* Backdrop click pour fermer */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setAddMenuOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-52 rounded-md border border-border bg-card shadow-lg py-1">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground/80 font-medium px-3 py-1.5 border-b border-border/60 mb-0.5">
                    Choisir un calculateur
                  </p>
                  {CALC_SLUGS.map((calc) => (
                    <button
                      key={calc}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors flex items-center gap-2 text-foreground"
                      onClick={() => {
                        setAddMenuOpen(false);
                        onAddLigne(calc);
                      }}
                    >
                      <span aria-hidden className="text-sm">
                        {CALC_ICONS[calc]}
                      </span>
                      {CALC_LABELS[calc]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0">
        <ul className="space-y-1.5">
          {lignes.map((ligne, idx) => {
            const isExpanded = expandedId === ligne.id;
            const prixEff = ligne.prix_ht_override ?? ligne.prix_ht;
            return (
              <li
                key={ligne.id}
                className="rounded-md border bg-secondary/20 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2"
              >
                {/* Row principale */}
                <div className="grid grid-cols-12 gap-1.5 items-center p-2">
                  <span className="col-span-1 text-[10px] text-muted-foreground/80 font-mono">
                    #{idx + 1}
                  </span>
                  <Input
                    className="col-span-5"
                    value={ligne.designation}
                    placeholder="Désignation"
                    onChange={(e) =>
                      onUpdateLigne(ligne.id, { designation: e.target.value })
                    }
                  />
                  <div className="col-span-2 flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={ligne.quantite}
                      onChange={(e) =>
                        onUpdateLigne(ligne.id, {
                          quantite: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                    <span className="text-[10px] text-muted-foreground">u</span>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="text-sm font-semibold tabular">
                      {fmtEur(prixEff)}
                    </div>
                    {ligne.prix_ht_override !== undefined && (
                      <div className="text-[9px] text-accent">
                        modifié (orig. {fmtEur(ligne.prix_ht)})
                      </div>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      title={isExpanded ? 'Replier' : 'Voir le détail'}
                      onClick={() => setExpandedId(isExpanded ? null : ligne.id)}
                    >
                      {isExpanded ? '−' : '+'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteLigne(ligne.id)}
                      disabled={lignes.length === 1}
                      title={
                        lignes.length === 1
                          ? 'Un devis doit avoir au moins une ligne'
                          : 'Supprimer cette ligne'
                      }
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                {/* Détail expandable */}
                {isExpanded && (
                  <div className="border-t px-2 pt-2 pb-2 space-y-2 bg-background/50">
                    <div className="grid grid-cols-2 gap-1.5 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
                      <Field label="Calculateur">
                        <Input value={CALC_LABELS[ligne.calculateur]} readOnly />
                      </Field>
                      <Field
                        label="Prix HT override (€)"
                        hint="Vide = utiliser le prix calculé"
                      >
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={ligne.prix_ht_override ?? ''}
                          placeholder={ligne.prix_ht.toFixed(2)}
                          onChange={(e) => {
                            const v = e.target.value;
                            onUpdateLigne(ligne.id, {
                              prix_ht_override:
                                v === '' ? undefined : Number(v) || 0,
                            });
                          }}
                        />
                      </Field>
                    </div>
                    <Field label="Notes ligne">
                      <Input
                        value={ligne.notes ?? ''}
                        placeholder="Précisions, options, etc."
                        onChange={(e) =>
                          onUpdateLigne(ligne.id, {
                            notes: e.target.value || undefined,
                          })
                        }
                      />
                    </Field>
                    {ligne.recap && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-[11px] text-muted-foreground/80 font-medium uppercase tracking-wide">
                          Snapshot calcul
                        </summary>
                        <pre className="mt-1 text-[11px] whitespace-pre-wrap bg-secondary/30 p-2 rounded font-mono">
                          {ligne.recap}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
