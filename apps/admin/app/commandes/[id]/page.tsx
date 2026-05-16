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
  useCommandes,
  STATUT_LABELS,
  STATUT_COLORS,
  ETAPE_LABELS,
  etapesProgress,
  getCommandeLignes,
  type CommandeStatut,
  type EtapeStatut,
  type EtapeProduction,
} from '@/lib/commandes';
import {
  useFactures,
  newFactureId,
  type Facture,
} from '@/lib/factures';
import { useDevis } from '@/lib/devis';
import { CALC_LABELS } from '@/lib/default-params';

const STATUTS_CMD: CommandeStatut[] = [
  'en_preparation',
  'bat_attente',
  'en_production',
  'finitions',
  'expedie',
  'livre',
  'annule',
];

const STATUTS_ETAPE: EtapeStatut[] = ['todo', 'en_cours', 'done'];

export default function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getCommande, updateCommande, deleteCommande, hydrated } = useCommandes();
  const { getClient } = useClients();

  const { addFacture, factureForCommande, nextNumero: nextFactureNumero } =
    useFactures();
  const { getDevis } = useDevis();

  const commande = getCommande(id);
  const factureLiee = commande ? factureForCommande(commande.id) : undefined;
  const [notes, setNotes] = useState(commande?.notes_production ?? '');

  if (!hydrated) {
    return <p className="text-muted-foreground text-sm">Chargement…</p>;
  }
  if (!commande) {
    return (
      <div className="space-y-4">
        <div className="text-sm">
          <Link href="/commandes" className="text-muted-foreground hover:text-primary">
            ← Commandes
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Commande introuvable</CardTitle>
            <CardDescription>
              Cette commande n&apos;existe pas (ou plus).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const client = getClient(commande.client_id);
  const date = new Date(commande.date_creation);
  const progress = etapesProgress(commande);

  const handleStatutChange = (statut: CommandeStatut) => {
    const changes: Partial<typeof commande> = { statut };
    if (statut === 'livre' && !commande.date_livraison_reelle) {
      changes.date_livraison_reelle = Date.now();
    }
    updateCommande(commande.id, changes);
  };

  const handleEtapeChange = (etapeId: string, statut: EtapeStatut) => {
    const newEtapes = commande.etapes.map((e) =>
      e.id === etapeId
        ? {
            ...e,
            statut,
            date_done: statut === 'done' ? Date.now() : undefined,
          }
        : e
    );
    updateCommande(commande.id, { etapes: newEtapes });
  };

  const handleEtapeField = (
    etapeId: string,
    field: 'operateur' | 'notes',
    value: string
  ) => {
    const newEtapes = commande.etapes.map((e) =>
      e.id === etapeId ? { ...e, [field]: value || undefined } : e
    );
    updateCommande(commande.id, { etapes: newEtapes });
  };

  const handleSaveNotes = () => {
    updateCommande(commande.id, { notes_production: notes.trim() || undefined });
  };

  const handleDateLivraison = (raw: string) => {
    updateCommande(commande.id, {
      date_livraison_prevue: raw === '' ? undefined : new Date(raw).getTime(),
    });
  };

  const handleSetSuivi = (suivi: string, transporteur: string) => {
    updateCommande(commande.id, {
      numero_suivi: suivi.trim() || undefined,
      transporteur: transporteur.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (!confirm(`Supprimer définitivement la commande ${commande.numero} ?`)) return;
    deleteCommande(commande.id);
    router.push('/commandes');
  };

  const handleGenererFacture = () => {
    // Source devis pour récupérer le TVA et autre meta du calcul
    const devis = getDevis(commande.devis_id);
    const tvaPct =
      (devis?.result as { tva_pct?: number } | null | undefined)?.tva_pct ?? 20;
    // Propage les lignes (multi ou implicite legacy) à la facture pour que le
    // PDF facture liste fidèlement les mêmes produits que le devis/commande.
    const lignes = getCommandeLignes(commande);
    const snapshotRecapAggregated =
      lignes.length > 1
        ? lignes
            .map((l) => l.recap ?? l.designation)
            .filter(Boolean)
            .join('\n---\n')
        : commande.snapshot_recap;
    const newFct: Facture = {
      id: newFactureId(),
      numero: nextFactureNumero(),
      commande_id: commande.id,
      commande_numero: commande.numero,
      devis_numero: commande.devis_numero,
      client_id: commande.client_id,
      calculateur: commande.calculateur,
      date_creation: Date.now(),
      statut: 'brouillon',
      montant_ht: commande.snapshot_prix_ht,
      montant_ttc: commande.snapshot_prix_ttc,
      tva_pct: tvaPct,
      quantite: commande.snapshot_quantite,
      paiements: [],
      snapshot_recap: snapshotRecapAggregated,
      lignes,
    };
    addFacture(newFct);
    router.push(`/factures/${newFct.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/commandes" className="text-muted-foreground hover:text-primary">
          ← Commandes
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight font-mono">
              {commande.numero}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUT_COLORS[commande.statut]}`}
            >
              {STATUT_LABELS[commande.statut]}
            </span>
            <span className="text-xs text-muted-foreground">
              Issue du devis{' '}
              <Link
                href={`/devis/${commande.devis_id}`}
                className="font-mono text-primary hover:underline"
              >
                {commande.devis_numero}
              </Link>
            </span>
            {factureLiee && (
              <span className="text-xs text-muted-foreground">
                · Facture{' '}
                <Link
                  href={`/factures/${factureLiee.id}`}
                  className="font-mono text-primary hover:underline"
                >
                  {factureLiee.numero}
                </Link>
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Créée le {date.toLocaleDateString('fr-FR')} à{' '}
            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {factureLiee ? (
            <Link href={`/factures/${factureLiee.id}`}>
              <Button variant="accent">💰 Voir la facture {factureLiee.numero}</Button>
            </Link>
          ) : commande.statut === 'livre' ? (
            <Button variant="accent" onClick={handleGenererFacture}>
              💰 Générer la facture
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche : workflow */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-sm">
                    Workflow de production — {CALC_LABELS[commande.calculateur]}
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    {progress.done} / {progress.total} étapes terminées ({progress.pct} %).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              <ol className="space-y-1.5">
                {commande.etapes.map((etape, i) => (
                  <EtapeRow
                    key={etape.id}
                    etape={etape}
                    numero={i + 1}
                    onStatutChange={(s) => handleEtapeChange(etape.id, s)}
                    onFieldChange={(f, v) => handleEtapeField(etape.id, f, v)}
                  />
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Notes production */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Notes de production</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              <textarea
                className="flex w-full min-h-16 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={notes}
                placeholder="Spécificités production, contraintes, points d'attention…"
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
              />
            </CardContent>
          </Card>

          {/* Snapshot */}
          {commande.snapshot_recap && (
            <Card>
              <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
                <CardTitle className="text-sm">
                  Détail commande (snapshot du devis)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2.5 pt-0">
                <pre className="text-xs whitespace-pre-wrap bg-secondary/30 p-2 rounded font-mono">
                  {commande.snapshot_recap}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne droite : sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
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
                    <p className="font-medium truncate text-sm">{clientLabel(client)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {client.email}
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="text-destructive text-sm">⚠️ Client supprimé</p>
              )}
            </CardContent>
          </Card>

          {/* Statut commande */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Statut commande</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0">
              <Select
                value={commande.statut}
                onChange={(e) =>
                  handleStatutChange(e.target.value as CommandeStatut)
                }
              >
                {STATUTS_CMD.map((s) => (
                  <option key={s} value={s}>
                    {STATUT_LABELS[s]}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Livraison */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Livraison</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0 space-y-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
              <Field label="Date prévue">
                <Input
                  type="date"
                  value={
                    commande.date_livraison_prevue
                      ? new Date(commande.date_livraison_prevue)
                          .toISOString()
                          .slice(0, 10)
                      : ''
                  }
                  onChange={(e) => handleDateLivraison(e.target.value)}
                />
              </Field>
              {commande.date_livraison_reelle && (
                <p className="text-xs text-green-700">
                  ✓ Livrée le{' '}
                  {new Date(commande.date_livraison_reelle).toLocaleDateString('fr-FR')}
                </p>
              )}
              <SuiviTransporteur
                suivi={commande.numero_suivi ?? ''}
                transporteur={commande.transporteur ?? ''}
                onChange={handleSetSuivi}
              />
            </CardContent>
          </Card>

          {/* Montant */}
          <Card className="border-accent/30">
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Montant</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0 space-y-2">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-sm text-muted-foreground">HT</span>
                <span className="text-lg font-bold">
                  {fmtEur(commande.snapshot_prix_ht)}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-sm text-muted-foreground">TTC</span>
                <span className="text-sm">{fmtEur(commande.snapshot_prix_ttc)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Documents PDF */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Documents PDF</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              <ul className="space-y-1.5">
                {/* Devis */}
                <li>
                  <Link
                    href={`/devis/${commande.devis_id}/imprimer`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-primary-soft transition-colors group"
                    title="Ouvrir le devis en mode impression"
                  >
                    <span aria-hidden className="text-base">📄</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">Devis</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        {commande.devis_numero}
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="text-[11px] text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition"
                    >
                      ↗
                    </span>
                  </Link>
                </li>
                {/* Proforma — variante du devis */}
                <li>
                  <Link
                    href={`/devis/${commande.devis_id}/imprimer?proforma=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-primary-soft transition-colors group"
                    title="Ouvrir la facture proforma (document non comptable)"
                  >
                    <span aria-hidden className="text-base">📋</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">Facture proforma</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        Non comptable · variante du devis
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="text-[11px] text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition"
                    >
                      ↗
                    </span>
                  </Link>
                </li>
                {/* Facture (si émise) */}
                {factureLiee ? (
                  <li>
                    <Link
                      href={`/factures/${factureLiee.id}/imprimer`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-primary-soft transition-colors group"
                      title="Ouvrir la facture en mode impression"
                    >
                      <span aria-hidden className="text-base">🧾</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">Facture</div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">
                          {factureLiee.numero}
                        </div>
                      </div>
                      <span
                        aria-hidden
                        className="text-[11px] text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition"
                      >
                        ↗
                      </span>
                    </Link>
                  </li>
                ) : (
                  <li className="flex items-center gap-2 px-2 py-1.5 rounded opacity-50 cursor-not-allowed">
                    <span aria-hidden className="text-base">🧾</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">Facture</div>
                      <div className="text-[10px] text-muted-foreground italic truncate">
                        Pas encore générée
                      </div>
                    </div>
                  </li>
                )}
              </ul>
              <p className="text-[10px] text-muted-foreground/80 mt-2 pt-2 border-t">
                💡 Dans l&apos;aperçu, utilise « Imprimer → Enregistrer comme PDF » pour sauvegarder sur ton ordinateur.
              </p>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm text-destructive">Supprimer</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="w-full h-7 text-xs"
              >
                Supprimer cette commande
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function EtapeRow({
  etape,
  numero,
  onStatutChange,
  onFieldChange,
}: {
  etape: EtapeProduction;
  numero: number;
  onStatutChange: (s: EtapeStatut) => void;
  onFieldChange: (field: 'operateur' | 'notes', value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li className="rounded-md border bg-secondary/10 px-3 py-2">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono w-6 shrink-0">
          {String(numero).padStart(2, '0')}
        </span>
        <button
          onClick={() => {
            const nextStatut: EtapeStatut =
              etape.statut === 'todo'
                ? 'en_cours'
                : etape.statut === 'en_cours'
                  ? 'done'
                  : 'todo';
            onStatutChange(nextStatut);
          }}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
            etape.statut === 'done'
              ? 'bg-green-500 border-green-500 text-white'
              : etape.statut === 'en_cours'
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground/40 hover:border-primary'
          }`}
          aria-label={`Cycle statut étape : ${ETAPE_LABELS[etape.statut]}`}
          title={`Statut : ${ETAPE_LABELS[etape.statut]} — cliquer pour avancer`}
        >
          {etape.statut === 'done' ? '✓' : etape.statut === 'en_cours' ? '…' : ''}
        </button>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${etape.statut === 'done' ? 'line-through text-muted-foreground' : ''}`}
          >
            {etape.nom}
          </p>
          {etape.operateur && (
            <p className="text-xs text-muted-foreground">
              par {etape.operateur}
              {etape.date_done && (
                <> · {new Date(etape.date_done).toLocaleDateString('fr-FR')}</>
              )}
            </p>
          )}
        </div>
        <Select
          value={etape.statut}
          onChange={(e) => onStatutChange(e.target.value as EtapeStatut)}
          className="w-auto text-xs"
        >
          {STATUTS_ETAPE.map((s) => (
            <option key={s} value={s}>
              {ETAPE_LABELS[s]}
            </option>
          ))}
        </Select>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground text-xs shrink-0"
          aria-label={expanded ? 'Replier' : 'Détailler'}
        >
          {expanded ? '▾' : '▸'}
        </button>
      </div>
      {expanded && (
        <div className="mt-2 pl-9 grid gap-2 md:grid-cols-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
          <Field label="Opérateur">
            <Input
              value={etape.operateur ?? ''}
              placeholder="Nom de l'opérateur"
              onChange={(e) => onFieldChange('operateur', e.target.value)}
            />
          </Field>
          <Field label="Notes">
            <Input
              value={etape.notes ?? ''}
              placeholder="ex. anomalie, ajustement"
              onChange={(e) => onFieldChange('notes', e.target.value)}
            />
          </Field>
        </div>
      )}
    </li>
  );
}

function SuiviTransporteur({
  suivi,
  transporteur,
  onChange,
}: {
  suivi: string;
  transporteur: string;
  onChange: (suivi: string, transporteur: string) => void;
}) {
  const [s, setS] = useState(suivi);
  const [t, setT] = useState(transporteur);
  return (
    <>
      <Field label="Transporteur">
        <Input
          value={t}
          placeholder="ex. DPD, Chronopost"
          onChange={(e) => setT(e.target.value)}
          onBlur={() => onChange(s, t)}
        />
      </Field>
      <Field label="Numéro de suivi">
        <Input
          value={s}
          placeholder="ex. 1234567890"
          onChange={(e) => setS(e.target.value)}
          onBlur={() => onChange(s, t)}
        />
      </Field>
    </>
  );
}
