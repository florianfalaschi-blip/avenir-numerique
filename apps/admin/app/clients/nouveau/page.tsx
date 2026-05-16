'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@avenir/ui';
import { emptyClientB2C, useClients, type Client } from '@/lib/clients';
import { ClientForm } from '../_shared/client-form';

export default function NouveauClientPage() {
  const router = useRouter();
  const { addClient } = useClients();
  const [client, setClient] = useState<Client>(emptyClientB2C());

  const valid =
    client.email.trim() !== '' &&
    (client.type === 'b2c'
      ? client.prenom.trim() !== '' || client.nom.trim() !== ''
      : client.raison_sociale.trim() !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addClient(client);
    router.push(`/clients/${client.id}`);
  };

  return (
    <div className="space-y-6 max-w-3xl pb-8">
      <div className="text-sm">
        <Link href="/clients" className="text-muted-foreground hover:text-primary">
          ← Clients
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau client</h1>
        <p className="text-muted-foreground mt-2">
          Crée un client B2C (particulier) ou B2B (entreprise) avec ses contacts,
          conditions commerciales et documents associés.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <ClientForm value={client} onChange={setClient} />

        <div className="flex justify-end gap-2 pt-6 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t -mx-4 px-4 py-3 mt-6">
          <Link href="/clients">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" variant="accent" disabled={!valid}>
            Créer le client
          </Button>
        </div>
      </form>
    </div>
  );
}
