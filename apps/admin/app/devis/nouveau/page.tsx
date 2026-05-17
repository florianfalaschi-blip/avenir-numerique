'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@avenir/ui';
import { Field } from '../../calculateurs/_shared/components';
import {
  clientLabel,
  clientTypeBadge,
  emptyClientB2B,
  emptyClientB2C,
  useClients,
  type ClientType,
} from '@/lib/clients';
import { CALC_SLUGS, CALC_LABELS, type CalcSlug } from '@/lib/default-params';

const CALC_DESCRIPTIONS: Record<CalcSlug, string> = {
  rollup: 'Bâche + structure',
  plaques: 'PVC, Forex, Dibond, Plexi…',
  flyers: 'Flyers, affiches, cartes',
  bobines: 'Étiquettes adhésives',
  brochures: 'Catalogues, brochures reliées',
  soustraitance: 'Devis fournisseurs partenaires',
};

export default function NouveauDevisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('client');

  const { clients, addClient, hydrated } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    preselectedClientId
  );
  const [search, setSearch] = useState('');
  const [quickCreate, setQuickCreate] = useState<ClientType | null>(null);
  const [quickB2C, setQuickB2C] = useState(emptyClientB2C());
  const [quickB2B, setQuickB2B] = useState(emptyClientB2B());

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const label = clientLabel(c).toLowerCase();
      const email = c.email.toLowerCase();
      return label.includes(q) || email.includes(q);
    });
  }, [clients, search]);

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  const handleQuickSave = () => {
    const c = quickCreate === 'b2c' ? quickB2C : quickB2B;
    if (!c.email.trim()) {
      alert('Email requis pour créer le client.');
      return;
    }
    addClient(c);
    setSelectedClientId(c.id);
    setQuickCreate(null);
  };

  const handleChooseCalc = (slug: CalcSlug) => {
    if (!selectedClientId) return;
    router.push(`/calculateurs/${slug}?devis_pour=${selectedClientId}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="text-sm">
        <Link href="/devis" className="text-muted-foreground hover:text-primary">
          ← Devis
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau devis</h1>
        <p className="text-muted-foreground mt-2">
          Choisis le client, puis le produit à calculer.
        </p>
      </div>

      {/* === ÉTAPE 1 — CLIENT === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-sm">1. Client</CardTitle>
              <CardDescription className="text-[11px]">
                Sélectionne un client existant ou crée-le en quelques secondes.
              </CardDescription>
            </div>
            {selectedClient && (
              <button
                onClick={() => setSelectedClientId(null)}
                className="text-xs text-primary hover:underline"
              >
                Changer
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0">
          {!hydrated ? (
            <p className="text-xs text-muted-foreground">Chargement…</p>
          ) : selectedClient ? (
            <div className="rounded-md border bg-secondary/20 px-3 py-2 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  clientTypeBadge(selectedClient.type).className
                }`}
              >
                {clientTypeBadge(selectedClient.type).label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{clientLabel(selectedClient)}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedClient.email}
                </p>
              </div>
              <span className="text-sm text-green-600 font-medium">✓ Sélectionné</span>
            </div>
          ) : quickCreate ? (
            <QuickCreateClient
              type={quickCreate}
              b2c={quickB2C}
              b2b={quickB2B}
              setB2C={setQuickB2C}
              setB2B={setQuickB2B}
              onCancel={() => setQuickCreate(null)}
              onSave={handleQuickSave}
            />
          ) : (
            <div className="space-y-2.5">
              <Input
                type="search"
                placeholder="Rechercher un client…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-sm"
              />
              {filteredClients.length > 0 ? (
                <ul className="max-h-72 overflow-y-auto divide-y rounded-md border">
                  {filteredClients.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setSelectedClientId(c.id)}
                        className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-secondary/40 transition-colors"
                      >
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            clientTypeBadge(c.type).className
                          } shrink-0`}
                        >
                          {clientTypeBadge(c.type).label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {clientLabel(c)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.email}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground px-1">
                  {clients.length === 0
                    ? 'Aucun client encore enregistré.'
                    : 'Aucun client ne correspond.'}
                </p>
              )}
              <div className="pt-1 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setQuickCreate('b2c')}
                >
                  + Nouveau B2C
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setQuickCreate('b2b')}
                >
                  + Nouveau B2B
                </Button>
                <Link href="/clients/nouveau">
                  <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[11px]">
                    Création détaillée
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === ÉTAPE 2 — CALCULATEUR === */}
      <Card>
        <CardHeader className="px-3 pt-2.5 pb-1.5 space-y-0">
          <CardTitle className="text-sm">2. Produit / calculateur</CardTitle>
          <CardDescription className="text-[11px]">
            Le calculateur s&apos;ouvrira avec l&apos;ID client en paramètre.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-2.5 pt-0">
          <div
            className={`grid gap-2.5 md:grid-cols-2 lg:grid-cols-3 ${
              !selectedClientId ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {CALC_SLUGS.map((slug) => (
              <button
                key={slug}
                onClick={() => handleChooseCalc(slug)}
                className="rounded-md border p-3 text-left hover:border-primary hover:shadow-sm transition-all"
                disabled={!selectedClientId}
              >
                <p className="font-medium text-sm">{CALC_LABELS[slug]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {CALC_DESCRIPTIONS[slug]}
                </p>
                <p className="text-xs text-primary mt-1.5 font-medium">
                  Ouvrir le calculateur →
                </p>
              </button>
            ))}
          </div>
          {!selectedClientId && (
            <p className="text-xs text-muted-foreground mt-2">
              Sélectionne d&apos;abord un client ci-dessus.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickCreateClient({
  type,
  b2c,
  b2b,
  setB2C,
  setB2B,
  onCancel,
  onSave,
}: {
  type: ClientType;
  b2c: ReturnType<typeof emptyClientB2C>;
  b2b: ReturnType<typeof emptyClientB2B>;
  setB2C: (c: ReturnType<typeof emptyClientB2C>) => void;
  setB2B: (c: ReturnType<typeof emptyClientB2B>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-3 rounded-md border bg-secondary/20 p-3 [&_input]:h-7 [&_input]:text-xs [&_input]:px-2 [&_label]:text-[10px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-muted-foreground/80">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Création rapide — {type === 'b2c' ? 'B2C particulier' : 'B2B entreprise'}
      </div>
      {type === 'b2c' ? (
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Prénom">
            <Input
              value={b2c.prenom}
              onChange={(e) => setB2C({ ...b2c, prenom: e.target.value })}
            />
          </Field>
          <Field label="Nom">
            <Input
              value={b2c.nom}
              onChange={(e) => setB2C({ ...b2c, nom: e.target.value })}
            />
          </Field>
          <Field label="Email" className="md:col-span-2">
            <Input
              type="email"
              value={b2c.email}
              onChange={(e) => setB2C({ ...b2c, email: e.target.value })}
            />
          </Field>
        </div>
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Raison sociale" className="md:col-span-2">
            <Input
              value={b2b.raison_sociale}
              onChange={(e) => setB2B({ ...b2b, raison_sociale: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={b2b.email}
              onChange={(e) => setB2B({ ...b2b, email: e.target.value })}
            />
          </Field>
          <Field label="SIRET (optionnel)">
            <Input
              value={b2b.siret ?? ''}
              onChange={(e) => setB2B({ ...b2b, siret: e.target.value })}
            />
          </Field>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="button" variant="accent" size="sm" className="h-7 px-2 text-xs" onClick={onSave}>
          Créer le client
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Tu pourras compléter le profil (adresse, téléphone, etc.) plus tard via la
        page Clients.
      </p>
    </div>
  );
}
