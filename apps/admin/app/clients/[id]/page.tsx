'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@avenir/ui';
import {
  clientLabel,
  clientTypeBadge,
  delaiPaiementLabel,
  modePaiementLabel,
  principalContact,
  useClients,
  type Client,
} from '@/lib/clients';
import { useDevis, STATUT_LABELS, STATUT_COLORS, effectivePrixHt } from '@/lib/devis';
import { fmtEur, fmtModifiedAt } from '../../calculateurs/_shared/format';
import { CALC_LABELS } from '@/lib/default-params';
import { ClientForm } from '../_shared/client-form';

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getClient, updateClient, deleteClient, hydrated } = useClients();
  const { devisForClient } = useDevis();

  const client = getClient(id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Client | null>(null);

  const devis = useMemo(() => (client ? devisForClient(client.id) : []), [
    client,
    devisForClient,
  ]);

  if (!hydrated) {
    return <p className="text-muted-foreground text-sm">Chargement…</p>;
  }
  if (!client) {
    return (
      <div className="space-y-4">
        <div className="text-sm">
          <Link href="/clients" className="text-muted-foreground hover:text-primary">
            ← Clients
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Client introuvable</CardTitle>
            <CardDescription>
              Ce client n&apos;existe pas (ou plus).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const badge = clientTypeBadge(client.type);
  const principal = principalContact(client);

  const handleStartEdit = () => {
    setDraft(client);
    setEditing(true);
  };
  const handleSave = () => {
    if (!draft) return;
    updateClient(draft.id, draft);
    setDraft(null);
    setEditing(false);
  };
  const handleCancel = () => {
    setDraft(null);
    setEditing(false);
  };
  const handleDelete = () => {
    if (devis.length > 0) {
      if (
        !confirm(
          `Ce client a ${devis.length} devis associé(s). Supprimer le client laissera les devis orphelins (référence cassée). Continuer ?`
        )
      ) {
        return;
      }
    } else if (!confirm('Supprimer définitivement ce client ?')) {
      return;
    }
    deleteClient(client.id);
    router.push('/clients');
  };

  // === MODE ÉDITION ===
  if (editing && draft) {
    return (
      <div className="space-y-6 max-w-3xl pb-8">
        <div className="text-sm">
          <Link href="/clients" className="text-muted-foreground hover:text-primary">
            ← Clients
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Éditer — {clientLabel(client)}
          </h1>
        </div>

        <ClientForm value={draft} onChange={setDraft} />

        <div className="flex justify-end gap-2 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t -mx-4 px-4 py-3 mt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button type="button" variant="accent" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    );
  }

  // === MODE AFFICHAGE ===
  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/clients" className="text-muted-foreground hover:text-primary">
          ← Clients
        </Link>
      </div>

      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
            <h1 className="text-3xl font-bold tracking-tight">
              {clientLabel(client)}
            </h1>
            {client.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {client.reference_interne && (
            <p className="text-xs text-muted-foreground font-mono">
              Réf. interne : {client.reference_interne}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/devis/nouveau?client=${client.id}`}>
            <Button variant="accent">+ Nouveau devis</Button>
          </Link>
          <Button variant="outline" onClick={handleStartEdit}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Identité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identité & coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {client.type === 'b2b' && (
                <>
                  {client.siret && (
                    <Row label="SIRET" value={client.siret} mono />
                  )}
                  {client.tva_intra && (
                    <Row label="TVA intra" value={client.tva_intra} mono />
                  )}
                </>
              )}
              <Row label="Email" value={client.email} />
              {client.telephone && <Row label="Téléphone" value={client.telephone} />}
              {client.date_premier_contact && (
                <Row
                  label="Premier contact"
                  value={new Date(client.date_premier_contact).toLocaleDateString('fr-FR')}
                />
              )}
              {client.commercial_assigne && (
                <Row label="Commercial" value={client.commercial_assigne} />
              )}
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Contacts ({client.contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun contact rattaché.
                </p>
              ) : (
                <ul className="space-y-3">
                  {client.contacts.map((c) => (
                    <li key={c.id} className="rounded-md border bg-secondary/20 p-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-medium">
                            {c.est_principal && (
                              <span className="text-primary mr-1.5" title="Contact principal">
                                ★
                              </span>
                            )}
                            {`${c.prenom} ${c.nom}`.trim() || '—'}
                          </p>
                          {c.fonction && (
                            <p className="text-xs text-muted-foreground">
                              {c.fonction}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                        {c.email && <span>✉ {c.email}</span>}
                        {c.telephone && <span>☎ {c.telephone}</span>}
                        {c.mobile && <span>📱 {c.mobile}</span>}
                      </div>
                      {c.notes && (
                        <p className="text-xs italic text-muted-foreground mt-2">
                          {c.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Carnet d'adresses */}
          {client.adresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Carnet d&apos;adresses ({client.adresses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.adresses.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-md border bg-secondary/20 p-3 text-sm space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.label && (
                          <span className="font-medium">{a.label}</span>
                        )}
                        {a.usage_facturation && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              a.defaut_facturation
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : 'bg-secondary text-muted-foreground border border-border'
                            }`}
                            title={
                              a.defaut_facturation
                                ? 'Adresse de facturation par défaut'
                                : 'Peut servir à la facturation'
                            }
                          >
                            {a.defaut_facturation ? '★ ' : ''}📄 Facturation
                          </span>
                        )}
                        {a.usage_livraison && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              a.defaut_livraison
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : 'bg-secondary text-muted-foreground border border-border'
                            }`}
                            title={
                              a.defaut_livraison
                                ? 'Adresse de livraison par défaut'
                                : 'Peut servir à la livraison'
                            }
                          >
                            {a.defaut_livraison ? '★ ' : ''}📦 Livraison
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs space-y-0.5 text-foreground/80">
                      <p>{a.ligne1}</p>
                      {a.ligne2 && <p>{a.ligne2}</p>}
                      <p>
                        {a.cp} {a.ville}
                      </p>
                      <p className="text-muted-foreground">{a.pays ?? 'France'}</p>
                    </div>
                    {a.notes && (
                      <p className="text-xs italic text-muted-foreground pt-1 border-t">
                        {a.notes}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Conditions commerciales */}
          {(client.delai_paiement ||
            client.mode_paiement_prefere ||
            client.remise_habituelle_pct !== undefined ||
            client.compte_comptable) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conditions commerciales</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {client.delai_paiement && (
                  <Row
                    label="Délai de paiement"
                    value={delaiPaiementLabel(
                      client.delai_paiement,
                      client.delai_paiement_autre
                    )}
                  />
                )}
                {client.mode_paiement_prefere && (
                  <Row
                    label="Mode de paiement"
                    value={modePaiementLabel(client.mode_paiement_prefere)}
                  />
                )}
                {client.remise_habituelle_pct !== undefined &&
                  client.remise_habituelle_pct > 0 && (
                    <Row
                      label="Remise habituelle"
                      value={`${client.remise_habituelle_pct} %`}
                    />
                  )}
                {client.compte_comptable && (
                  <Row label="Compte comptable" value={client.compte_comptable} mono />
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {client.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Documents ({client.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {client.documents.map((doc) => (
                    <li key={doc.id} className="py-2">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="font-medium text-sm">
                          {doc.nom || <span className="text-muted-foreground">Sans nom</span>}
                          {doc.type && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              · {doc.type}
                            </span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {fmtModifiedAt(doc.ajoute_le)}
                        </span>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline break-all"
                        >
                          {doc.url} ↗
                        </a>
                      )}
                      {doc.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          {doc.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {principal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact principal</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">
                  {`${principal.prenom} ${principal.nom}`.trim() || '—'}
                </p>
                {principal.fonction && (
                  <p className="text-xs text-muted-foreground">{principal.fonction}</p>
                )}
                {principal.email && (
                  <p className="text-xs">✉ {principal.email}</p>
                )}
                {(principal.mobile || principal.telephone) && (
                  <p className="text-xs">
                    ☎ {principal.mobile ?? principal.telephone}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Devis ({devis.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {devis.length === 0 ? (
                <p className="px-6 py-6 text-sm text-muted-foreground">
                  Aucun devis pour ce client.
                </p>
              ) : (
                <ul className="divide-y">
                  {devis.map((dv) => (
                    <li key={dv.id}>
                      <Link
                        href={`/devis/${dv.id}`}
                        className="block px-4 py-2 hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono text-muted-foreground">
                            {dv.numero}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 ${STATUT_COLORS[dv.statut]}`}
                          >
                            {STATUT_LABELS[dv.statut]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-sm">
                            {CALC_LABELS[dv.calculateur]}
                          </span>
                          <span className="text-sm font-medium">
                            {fmtEur(effectivePrixHt(dv))}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Zone de danger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="w-full"
              >
                Supprimer ce client
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3 py-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide w-36 shrink-0">
        {label}
      </span>
      <span className={`text-sm flex-1 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
