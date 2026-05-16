'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Pill,
} from '@avenir/ui';
import { fmtInt } from '../calculateurs/_shared/format';
import { useClients, clientLabel } from '@/lib/clients';
import { KpiTile } from '../_components/kpi-tile';

export default function ClientsListPage() {
  const { clients, hydrated } = useClients();
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const b2c = clients.filter((c) => c.type === 'b2c').length;
    const b2b = clients.filter((c) => c.type === 'b2b').length;
    const avecContacts = clients.filter((c) => c.contacts.length > 0).length;
    const vips = clients.filter((c) => c.tags.includes('vip')).length;
    return { total: clients.length, b2c, b2b, avecContacts, vips };
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const label = clientLabel(c).toLowerCase();
      const email = c.email.toLowerCase();
      const tel = (c.telephone ?? '').toLowerCase();
      const tags = c.tags.join(' ').toLowerCase();
      return label.includes(q) || email.includes(q) || tel.includes(q) || tags.includes(q);
    });
  }, [clients, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Carnet d&apos;adresses partagé. {clients.length} client
            {clients.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <Link href="/clients/nouveau">
          <Button variant="accent">+ Nouveau client</Button>
        </Link>
      </div>

      {clients.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Total clients" value={fmtInt(stats.total)} accent="primary" />
          <KpiTile
            label="B2C — Particuliers"
            value={fmtInt(stats.b2c)}
            accent="muted"
          />
          <KpiTile label="B2B — Entreprises" value={fmtInt(stats.b2b)} accent="primary" />
          <KpiTile
            label="VIP"
            value={fmtInt(stats.vips)}
            accent="accent"
            sub={`${fmtInt(stats.avecContacts)} avec contacts détaillés`}
          />
        </div>
      )}

      <Card>
        <CardHeader className="px-3 pt-2.5 pb-2.5 space-y-0">
          <Input
            type="search"
            placeholder="Rechercher (nom, raison sociale, email, tag…)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md h-9 text-sm"
          />
        </CardHeader>
        <CardContent className="p-0">
          {!hydrated ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">Chargement…</p>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {clients.length === 0
                  ? 'Aucun client encore enregistré.'
                  : 'Aucun client ne correspond à ta recherche.'}
              </p>
              {clients.length === 0 && (
                <Link href="/clients/nouveau">
                  <Button variant="outline" size="sm">
                    Créer le premier client
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/clients/${c.id}`}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-primary-soft transition-colors"
                  >
                    <Pill
                      variant={c.type === 'b2c' ? 'muted' : 'primary'}
                      size="sm"
                      className="shrink-0"
                    >
                      {c.type.toUpperCase()}
                    </Pill>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate text-sm">
                          {clientLabel(c)}
                        </p>
                        {c.tags.slice(0, 3).map((tag) => (
                          <Pill key={tag} variant="primary" size="sm">
                            {tag}
                          </Pill>
                        ))}
                        {c.tags.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{c.tags.length - 3}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {c.email}
                        {c.telephone ? ` · ${c.telephone}` : ''}
                        {c.contacts.length > 0
                          ? ` · ${c.contacts.length} contact${c.contacts.length > 1 ? 's' : ''}`
                          : ''}
                      </p>
                    </div>
                    <span aria-hidden className="text-muted-foreground shrink-0 text-sm">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {clients.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💡 Conseil</CardTitle>
            <CardDescription>
              Tu peux aussi créer un client à la volée depuis la page « Nouveau devis ».
              Inutile de pré-saisir tous tes clients avant de commencer.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
