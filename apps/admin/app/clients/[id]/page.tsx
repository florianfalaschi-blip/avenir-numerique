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
  Input,
} from '@avenir/ui';
import {
  clientLabel,
  clientTypeBadge,
  useClients,
  type Client,
} from '@/lib/clients';
import { useDevis, STATUT_LABELS, STATUT_COLORS, effectivePrixHt } from '@/lib/devis';
import { fmtEur } from '../../calculateurs/_shared/format';

const CALC_LABELS = {
  rollup: 'Roll-up',
  plaques: 'Plaques',
  flyers: 'Flyers',
  bobines: 'Bobines',
  brochures: 'Brochures',
} as const;

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
  const [draft, setDraft] = useState<Client | null>(client ?? null);

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
              Ce client n&apos;existe pas (ou plus). Il a peut-être été supprimé.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const badge = clientTypeBadge(client.type);
  const d = draft ?? client;

  const handleSave = () => {
    if (!draft) return;
    updateClient(draft.id, draft);
    setEditing(false);
  };

  const handleDelete = () => {
    if (devis.length > 0) {
      if (
        !confirm(
          `Ce client a ${devis.length} devis associé(s). Supprimer le client supprimera aussi ses devis. Continuer ?`
        )
      ) {
        return;
      }
      // Note: pour cette MVP on supprime juste le client. Les devis restent
      // mais orphelins (référence cassée). Phase ultérieure : décision UX
      // (cascade ou conservation).
    } else if (!confirm('Supprimer définitivement ce client ?')) {
      return;
    }
    deleteClient(client.id);
    router.push('/clients');
  };

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/clients" className="text-muted-foreground hover:text-primary">
          ← Clients
        </Link>
      </div>

      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
          <h1 className="text-3xl font-bold tracking-tight">{clientLabel(client)}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/devis/nouveau?client=${client.id}`}>
            <Button variant="accent">+ Nouveau devis</Button>
          </Link>
          {editing ? (
            <>
              <Button variant="outline" onClick={() => {
                setDraft(client);
                setEditing(false);
              }}>
                Annuler
              </Button>
              <Button variant="default" onClick={handleSave}>
                Enregistrer
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setDraft(client);
                setEditing(true);
              }}
            >
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Identité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {d.type === 'b2c' ? (
                <>
                  <Row label="Prénom" value={d.prenom} editing={editing} onChange={(v) =>
                    draft && setDraft({ ...(draft as typeof d), prenom: v })
                  } />
                  <Row label="Nom" value={d.nom} editing={editing} onChange={(v) =>
                    draft && setDraft({ ...(draft as typeof d), nom: v })
                  } />
                </>
              ) : (
                <>
                  <Row
                    label="Raison sociale"
                    value={d.raison_sociale}
                    editing={editing}
                    onChange={(v) =>
                      draft && setDraft({ ...(draft as typeof d), raison_sociale: v })
                    }
                  />
                  <Row label="SIRET" value={d.siret ?? ''} editing={editing} onChange={(v) =>
                    draft && setDraft({ ...(draft as typeof d), siret: v })
                  } />
                  <Row label="TVA intra" value={d.tva_intra ?? ''} editing={editing} onChange={(v) =>
                    draft && setDraft({ ...(draft as typeof d), tva_intra: v })
                  } />
                  <Row
                    label="Contact"
                    value={`${d.contact_prenom ?? ''} ${d.contact_nom ?? ''}`.trim() || '—'}
                  />
                </>
              )}
              <Row label="Email" value={d.email} editing={editing} onChange={(v) =>
                draft && setDraft({ ...(draft as typeof d), email: v })
              } />
              <Row label="Téléphone" value={d.telephone ?? ''} editing={editing} onChange={(v) =>
                draft && setDraft({ ...(draft as typeof d), telephone: v })
              } />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Adresse de facturation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {d.adresse_facturation ? (
                <>
                  <p>{d.adresse_facturation.ligne1}</p>
                  {d.adresse_facturation.ligne2 && (
                    <p>{d.adresse_facturation.ligne2}</p>
                  )}
                  <p>
                    {d.adresse_facturation.cp} {d.adresse_facturation.ville}
                  </p>
                  <p className="text-muted-foreground">
                    {d.adresse_facturation.pays ?? 'France'}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Aucune adresse renseignée.</p>
              )}
              {editing && (
                <p className="text-xs text-muted-foreground pt-2">
                  💡 L&apos;édition d&apos;adresse complète sera ajoutée dans une prochaine
                  version.
                </p>
              )}
            </CardContent>
          </Card>

          {d.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{d.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
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
                          <span className="text-sm">{CALC_LABELS[dv.calculateur]}</span>
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
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wide w-32 shrink-0">
        {label}
      </span>
      {editing && onChange ? (
        <Input
          className="flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <span className="text-sm flex-1">{value || '—'}</span>
      )}
    </div>
  );
}
