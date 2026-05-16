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
} from '@avenir/ui';
import { useClients, clientLabel, clientTypeBadge } from '@/lib/clients';

export default function ClientsListPage() {
  const { clients, hydrated } = useClients();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const label = clientLabel(c).toLowerCase();
      const email = c.email.toLowerCase();
      const tel = (c.telephone ?? '').toLowerCase();
      return label.includes(q) || email.includes(q) || tel.includes(q);
    });
  }, [clients, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Carnet d&apos;adresses partagé entre commerciaux. {clients.length} client
            {clients.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <Link href="/clients/nouveau">
          <Button variant="accent">+ Nouveau client</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <Input
            type="search"
            placeholder="Rechercher un client (nom, raison sociale, email, téléphone…)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </CardHeader>
        <CardContent className="p-0">
          {!hydrated ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">Chargement…</p>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {clients.length === 0
                  ? "Aucun client encore enregistré."
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
              {filtered.map((c) => {
                const badge = clientTypeBadge(c.type);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/clients/${c.id}`}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-secondary/40 transition-colors"
                    >
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className} shrink-0`}
                      >
                        {badge.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{clientLabel(c)}</p>
                          {c.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/30 px-1.5 py-0 text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {c.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{c.tags.length - 3}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.email}
                          {c.telephone ? ` · ${c.telephone}` : ''}
                          {c.contacts.length > 0
                            ? ` · ${c.contacts.length} contact${c.contacts.length > 1 ? 's' : ''}`
                            : ''}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="text-muted-foreground shrink-0 text-sm"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {clients.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💡 Conseil</CardTitle>
            <CardDescription>
              Tu peux aussi créer un client à la volée depuis la page « Nouveau devis ». Inutile
              de pré-saisir tous tes clients avant de commencer.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
