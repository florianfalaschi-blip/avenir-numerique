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
  type DevisStatut,
} from '@/lib/devis';
import {
  useCommandes,
  buildEtapesFor,
  newCommandeId,
  type Commande,
} from '@/lib/commandes';
import { CALC_LABELS } from '@/lib/default-params';

const STATUTS: DevisStatut[] = ['brouillon', 'envoye', 'accepte', 'refuse', 'archive'];

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
      snapshot_recap: devis.recap,
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

          {/* Snapshot du calcul */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">
                Calculateur {CALC_LABELS[devis.calculateur]} · quantité {devis.quantite}
              </CardTitle>
              <CardDescription className="text-[11px]">
                Snapshot du calcul figé au moment de l&apos;enregistrement.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              {devis.recap ? (
                <pre className="text-xs whitespace-pre-wrap bg-secondary/30 p-2 rounded font-mono">
                  {devis.recap}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground">Pas de récapitulatif.</p>
              )}
            </CardContent>
          </Card>

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
