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
import {
  MODES_PAIEMENT,
  useClients,
  clientLabel,
  clientTypeBadge,
  type ModePaiement,
} from '@/lib/clients';
import {
  useFactures,
  STATUT_LABELS,
  STATUT_COLORS,
  RELANCE_LABELS,
  calculerDateEcheance,
  montantPaye,
  montantRestant,
  newPaiementId,
  newRelanceId,
  newFactureId,
  estPayee,
  estPartiellementPayee,
  aRelancer,
  joursRetard,
  derniereRelance,
  generateFactureNumero,
  type FactureStatut,
  type Facture,
  type Paiement,
  type Relance,
  type RelanceType,
} from '@/lib/factures';
const STATUTS: FactureStatut[] = [
  'brouillon',
  'emise',
  'partiellement_payee',
  'payee',
  'impayee',
  'avoir',
];

export default function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { factures, getFacture, updateFacture, deleteFacture, addFacture, hydrated } = useFactures();
  const { getClient } = useClients();

  const facture = getFacture(id);
  const [notes, setNotes] = useState(facture?.notes ?? '');

  if (!hydrated) {
    return <p className="text-muted-foreground text-sm">Chargement…</p>;
  }
  if (!facture) {
    return (
      <div className="space-y-4">
        <div className="text-sm">
          <Link href="/factures" className="text-muted-foreground hover:text-primary">
            ← Factures
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Facture introuvable</CardTitle>
            <CardDescription>
              Cette facture n&apos;existe pas (ou plus).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const client = getClient(facture.client_id);
  const dateEmission = facture.date_emission ? new Date(facture.date_emission) : null;
  const dateEcheance = facture.date_echeance ? new Date(facture.date_echeance) : null;
  const paye = montantPaye(facture);
  const restant = montantRestant(facture);
  const enRetard =
    dateEcheance &&
    Date.now() > dateEcheance.getTime() &&
    !['payee', 'avoir', 'brouillon'].includes(facture.statut);
  const retardJours = joursRetard(facture);
  const doitRelancer = aRelancer(facture);
  const lastRelance = derniereRelance(facture);

  const handleStatutChange = (statut: FactureStatut) => {
    const changes: Partial<typeof facture> = { statut };
    if (statut === 'emise' && !facture.date_emission) {
      const now = Date.now();
      changes.date_emission = now;
      changes.date_echeance = calculerDateEcheance(now, client?.delai_paiement);
    }
    updateFacture(facture.id, changes);
  };

  const handleEcheanceChange = (raw: string) => {
    updateFacture(facture.id, {
      date_echeance: raw === '' ? undefined : new Date(raw).getTime(),
    });
  };

  const handleAddPaiement = () => {
    const newPaiement: Paiement = {
      id: newPaiementId(),
      date: Date.now(),
      montant: Math.min(restant, facture.montant_ttc),
      mode: client?.mode_paiement_prefere,
    };
    const newPaiements = [...facture.paiements, newPaiement];
    const newStatut: FactureStatut =
      paye + newPaiement.montant >= facture.montant_ttc - 0.01
        ? 'payee'
        : 'partiellement_payee';
    updateFacture(facture.id, {
      paiements: newPaiements,
      statut: facture.statut === 'brouillon' ? facture.statut : newStatut,
    });
  };

  const handleUpdatePaiement = (
    paiementId: string,
    changes: Partial<Paiement>
  ) => {
    const newPaiements = facture.paiements.map((p) =>
      p.id === paiementId ? { ...p, ...changes } : p
    );
    const newPaye = newPaiements.reduce((acc, p) => acc + p.montant, 0);
    const newStatut: FactureStatut | undefined =
      facture.statut === 'brouillon' || facture.statut === 'avoir'
        ? undefined
        : newPaye >= facture.montant_ttc - 0.01
          ? 'payee'
          : newPaye > 0.01
            ? 'partiellement_payee'
            : 'emise';
    updateFacture(facture.id, {
      paiements: newPaiements,
      ...(newStatut ? { statut: newStatut } : {}),
    });
  };

  const handleDeletePaiement = (paiementId: string) => {
    if (!confirm('Supprimer ce paiement ?')) return;
    const newPaiements = facture.paiements.filter((p) => p.id !== paiementId);
    const newPaye = newPaiements.reduce((acc, p) => acc + p.montant, 0);
    const newStatut: FactureStatut | undefined =
      facture.statut === 'brouillon' || facture.statut === 'avoir'
        ? undefined
        : newPaye >= facture.montant_ttc - 0.01
          ? 'payee'
          : newPaye > 0.01
            ? 'partiellement_payee'
            : 'emise';
    updateFacture(facture.id, {
      paiements: newPaiements,
      ...(newStatut ? { statut: newStatut } : {}),
    });
  };

  const handleSaveNotes = () => {
    updateFacture(facture.id, { notes: notes.trim() || undefined });
  };

  const handleDelete = () => {
    if (!confirm(`Supprimer définitivement la facture ${facture.numero} ?`)) return;
    deleteFacture(facture.id);
    router.push('/factures');
  };

  // === RELANCES ===
  const handleAddRelance = (type: RelanceType = 'email') => {
    const newRelance: Relance = {
      id: newRelanceId(),
      date: Date.now(),
      type,
    };
    updateFacture(facture.id, {
      relances: [...(facture.relances ?? []), newRelance],
    });
  };

  const handleUpdateRelance = (relanceId: string, changes: Partial<Relance>) => {
    const newRelances = (facture.relances ?? []).map((r) =>
      r.id === relanceId ? { ...r, ...changes } : r
    );
    updateFacture(facture.id, { relances: newRelances });
  };

  const handleDeleteRelance = (relanceId: string) => {
    if (!confirm('Supprimer cette relance ?')) return;
    const newRelances = (facture.relances ?? []).filter((r) => r.id !== relanceId);
    updateFacture(facture.id, {
      relances: newRelances.length > 0 ? newRelances : undefined,
    });
  };

  // === AVOIR ===
  const handleCreateAvoir = () => {
    const restantAvant = montantRestant(facture);
    const montantAvoirHt = restantAvant > 0 ? -facture.montant_ht : -(facture.montant_ht);
    const montantAvoirTtc = restantAvant > 0 ? -facture.montant_ttc : -(facture.montant_ttc);
    if (
      !confirm(
        `Créer un avoir pour ${facture.numero} ?\n\n` +
          `Montant : ${fmtEur(montantAvoirTtc)} TTC\n\n` +
          `Cela génère une nouvelle facture (statut « Avoir ») liée à celle-ci. ` +
          `Tu pourras ensuite l'ajuster si besoin.`
      )
    )
      return;
    const now = Date.now();
    const newAvoir: Facture = {
      id: newFactureId(),
      numero: generateFactureNumero(factures),
      commande_id: facture.commande_id,
      commande_numero: facture.commande_numero,
      devis_numero: facture.devis_numero,
      client_id: facture.client_id,
      calculateur: facture.calculateur,
      date_creation: now,
      date_emission: now,
      statut: 'avoir',
      montant_ht: montantAvoirHt,
      montant_ttc: montantAvoirTtc,
      tva_pct: facture.tva_pct,
      quantite: facture.quantite,
      paiements: [],
      avoir_de_facture_id: facture.id,
      avoir_de_facture_numero: facture.numero,
      snapshot_recap: facture.snapshot_recap
        ? `AVOIR sur facture ${facture.numero}\n\n${facture.snapshot_recap}`
        : `AVOIR sur facture ${facture.numero}`,
    };
    addFacture(newAvoir);
    router.push(`/factures/${newAvoir.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/factures" className="text-muted-foreground hover:text-primary">
          ← Factures
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight font-mono">
              {facture.numero}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUT_COLORS[facture.statut]}`}
            >
              {STATUT_LABELS[facture.statut]}
            </span>
            {enRetard && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-destructive text-destructive-foreground">
                ⚠ En retard {retardJours > 0 ? `(${retardJours} j)` : ''}
              </span>
            )}
            {doitRelancer && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-warning/15 text-warning border border-warning/30">
                📣 À relancer
              </span>
            )}
            {facture.avoir_de_facture_id && facture.avoir_de_facture_numero && (
              <Link
                href={`/factures/${facture.avoir_de_facture_id}`}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25"
                title="Voir la facture d'origine"
              >
                Avoir sur {facture.avoir_de_facture_numero} →
              </Link>
            )}
            <span className="text-xs text-muted-foreground">
              Commande{' '}
              <Link
                href={`/commandes/${facture.commande_id}`}
                className="font-mono text-primary hover:underline"
              >
                {facture.commande_numero}
              </Link>
            </span>
          </div>
          {dateEmission ? (
            <p className="text-muted-foreground text-sm">
              Émise le {dateEmission.toLocaleDateString('fr-FR')}
              {dateEcheance && ` · échéance ${dateEcheance.toLocaleDateString('fr-FR')}`}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Brouillon — passe au statut « Émise » pour activer l&apos;échéance.
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {facture.pdf_archive_path && (
            <ArchivedPdfButton path={facture.pdf_archive_path} date={facture.pdf_archive_date} />
          )}
          <Link href={`/factures/${facture.id}/imprimer`}>
            <Button variant="accent">🖨️ Imprimer / PDF</Button>
          </Link>
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
                </Link>
              ) : (
                <p className="text-destructive text-sm">⚠️ Client supprimé</p>
              )}
            </CardContent>
          </Card>

          {/* Paiements */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-sm">
                    Paiements ({facture.paiements.length})
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Encaissé : {fmtEur(paye)} sur {fmtEur(facture.montant_ttc)} TTC
                    {restant > 0.01 && (
                      <span className="text-accent font-medium">
                        {' '}
                        — Reste dû {fmtEur(restant)}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={handleAddPaiement}
                  disabled={facture.statut === 'brouillon' || estPayee(facture)}
                  title={
                    facture.statut === 'brouillon'
                      ? "Passe d'abord au statut « Émise »"
                      : undefined
                  }
                >
                  + Ajouter un paiement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              {facture.paiements.length === 0 ? (
                <p className="text-xs text-muted-foreground py-1">
                  Aucun paiement enregistré.
                </p>
              ) : (
                <ul className="space-y-2">
                  {facture.paiements.map((p) => (
                    <PaiementRow
                      key={p.id}
                      paiement={p}
                      onChange={(changes) => handleUpdatePaiement(p.id, changes)}
                      onDelete={() => handleDeletePaiement(p.id)}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Relances — visible sauf si payée/avoir/brouillon */}
          {facture.statut !== 'brouillon' &&
            facture.statut !== 'avoir' &&
            facture.statut !== 'payee' && (
              <Card className={doitRelancer ? 'border-warning/40' : undefined}>
                <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div>
                      <CardTitle className="text-sm">
                        Relances ({facture.relances?.length ?? 0})
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        {doitRelancer
                          ? `À relancer · ${retardJours} jour${retardJours > 1 ? 's' : ''} de retard`
                          : lastRelance
                            ? `Dernière le ${new Date(lastRelance.date).toLocaleDateString('fr-FR')} — ${RELANCE_LABELS[lastRelance.type]}`
                            : enRetard
                              ? `${retardJours} jour${retardJours > 1 ? 's' : ''} de retard`
                              : 'Suivi des relances client'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => handleAddRelance('email')}
                      >
                        + Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => handleAddRelance('telephone')}
                      >
                        + Tél
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-2.5 pt-0">
                  {!facture.relances || facture.relances.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-1">
                      Aucune relance enregistrée.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {[...facture.relances]
                        .sort((a, b) => b.date - a.date)
                        .map((r) => (
                          <RelanceRow
                            key={r.id}
                            relance={r}
                            onChange={(changes) => handleUpdateRelance(r.id, changes)}
                            onDelete={() => handleDeleteRelance(r.id)}
                          />
                        ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Notes */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0">
              <textarea
                className="flex w-full min-h-16 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={notes}
                placeholder="Spécificités, conditions particulières…"
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
              />
            </CardContent>
          </Card>

          {/* Snapshot */}
          {facture.snapshot_recap && (
            <Card>
              <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
                <CardTitle className="text-sm">Détail (snapshot)</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2.5 pt-0">
                <pre className="text-xs whitespace-pre-wrap bg-secondary/30 p-2 rounded font-mono">
                  {facture.snapshot_recap}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne droite */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Montant + barre de progression */}
          <Card className="border-accent/30">
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Montant</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">HT</span>
                <span>{fmtEur(facture.montant_ht)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA {facture.tva_pct} %</span>
                <span>{fmtEur(facture.montant_ttc - facture.montant_ht)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total TTC</span>
                <span>{fmtEur(facture.montant_ttc)}</span>
              </div>
              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Encaissé</span>
                  <span className="text-green-700 font-medium">{fmtEur(paye)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Restant dû</span>
                  <span
                    className={`font-medium ${restant > 0.01 ? 'text-accent' : 'text-green-700'}`}
                  >
                    {fmtEur(Math.max(0, restant))}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all ${
                      estPayee(facture)
                        ? 'bg-green-500'
                        : estPartiellementPayee(facture)
                          ? 'bg-warning'
                          : 'bg-muted'
                    }`}
                    style={{
                      width: `${Math.min(100, (paye / Math.max(1, facture.montant_ttc)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statut */}
          <Card>
            <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
              <CardTitle className="text-sm">Statut</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2.5 pt-0 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0">
              <Select
                value={facture.statut}
                onChange={(e) => handleStatutChange(e.target.value as FactureStatut)}
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {STATUT_LABELS[s]}
                  </option>
                ))}
              </Select>
              {facture.statut === 'brouillon' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Passe à « Émise » pour calculer l&apos;échéance automatiquement
                  selon le délai client.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Échéance */}
          {facture.date_emission && (
            <Card>
              <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
                <CardTitle className="text-sm">Échéance</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2.5 pt-0 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
                <Field label="Date d'échéance">
                  <Input
                    type="date"
                    value={
                      facture.date_echeance
                        ? new Date(facture.date_echeance).toISOString().slice(0, 10)
                        : ''
                    }
                    onChange={(e) => handleEcheanceChange(e.target.value)}
                  />
                </Field>
                {client?.delai_paiement && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Délai client : {client.delai_paiement.replace(/_/g, ' ')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions — Avoir */}
          {facture.statut !== 'brouillon' &&
            facture.statut !== 'avoir' &&
            !facture.avoir_de_facture_id && (
              <Card>
                <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2.5 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateAvoir}
                    className="w-full h-7 text-xs"
                    title="Crée une facture d'avoir (montant négatif) liée à celle-ci"
                  >
                    ↩ Créer un avoir
                  </Button>
                </CardContent>
              </Card>
            )}

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
                Supprimer cette facture
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function PaiementRow({
  paiement,
  onChange,
  onDelete,
}: {
  paiement: Paiement;
  onChange: (changes: Partial<Paiement>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-md border bg-secondary/20 p-2 space-y-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0">
      <div className="grid grid-cols-12 gap-2 items-center">
        <Input
          type="date"
          className="col-span-3"
          value={new Date(paiement.date).toISOString().slice(0, 10)}
          onChange={(e) =>
            onChange({ date: new Date(e.target.value).getTime() })
          }
        />
        <Input
          type="number"
          min={0}
          step={0.01}
          className="col-span-3"
          value={paiement.montant}
          placeholder="Montant TTC"
          onChange={(e) => onChange({ montant: Number(e.target.value) || 0 })}
        />
        <Select
          value={paiement.mode ?? ''}
          onChange={(e) =>
            onChange({ mode: (e.target.value as ModePaiement) || undefined })
          }
          className="col-span-3"
        >
          <option value="">Mode…</option>
          {MODES_PAIEMENT.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
        <Input
          className="col-span-2"
          value={paiement.reference ?? ''}
          placeholder="Réf."
          onChange={(e) => onChange({ reference: e.target.value || undefined })}
        />
        <Button
          variant="ghost"
          size="icon"
          className="col-span-1 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          aria-label="Supprimer ce paiement"
        >
          ✕
        </Button>
      </div>
      <Input
        value={paiement.notes ?? ''}
        placeholder="Notes (optionnel)"
        onChange={(e) => onChange({ notes: e.target.value || undefined })}
      />
    </li>
  );
}

const RELANCE_OPTIONS: { value: RelanceType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'telephone', label: 'Téléphone' },
  { value: 'lettre', label: 'Lettre' },
  { value: 'sms', label: 'SMS' },
  { value: 'autre', label: 'Autre' },
];

function RelanceRow({
  relance,
  onChange,
  onDelete,
}: {
  relance: Relance;
  onChange: (changes: Partial<Relance>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-md border bg-secondary/20 p-2 space-y-2 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_select]:h-7 [&_select]:text-xs [&_select]:px-2 [&_select]:py-0">
      <div className="grid grid-cols-12 gap-2 items-center">
        <Input
          type="date"
          className="col-span-4"
          value={new Date(relance.date).toISOString().slice(0, 10)}
          onChange={(e) =>
            onChange({ date: new Date(e.target.value).getTime() })
          }
        />
        <Select
          className="col-span-4"
          value={relance.type}
          onChange={(e) => onChange({ type: e.target.value as RelanceType })}
        >
          {RELANCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Input
          className="col-span-3"
          value={relance.notes ?? ''}
          placeholder="Notes / réponse client"
          onChange={(e) => onChange({ notes: e.target.value || undefined })}
        />
        <Button
          variant="ghost"
          size="icon"
          className="col-span-1 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          aria-label="Supprimer cette relance"
        >
          ✕
        </Button>
      </div>
    </li>
  );
}

/**
 * Bouton pour ouvrir un PDF archivé dans Supabase Storage (bucket pdf-archives).
 * Régénère une signed URL (10 min) au clic.
 */
function ArchivedPdfButton({
  path,
  date,
}: {
  path: string;
  date?: number;
}) {
  const [loading, setLoading] = useState(false);
  const dateStr = date ? new Date(date).toLocaleDateString('fr-FR') : null;
  return (
    <Button
      variant="outline"
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        try {
          const { getSignedUrl } = await import('@/lib/storage');
          const url = await getSignedUrl('pdf-archives', path, 600);
          window.open(url, '_blank', 'noopener');
        } catch (e) {
          alert(e instanceof Error ? e.message : 'Erreur ouverture archive');
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      title={dateStr ? `Snapshot archivé le ${dateStr}` : 'PDF archivé'}
    >
      {loading ? '⏳' : '📁'} PDF archivé{dateStr ? ` · ${dateStr}` : ''}
    </Button>
  );
}
