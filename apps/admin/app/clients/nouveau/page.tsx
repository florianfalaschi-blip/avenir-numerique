'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@avenir/ui';
import { Field, Select } from '../../calculateurs/_shared/components';
import {
  emptyClientB2B,
  emptyClientB2C,
  useClients,
  type Client,
  type ClientType,
} from '@/lib/clients';

export default function NouveauClientPage() {
  const router = useRouter();
  const { addClient } = useClients();
  const [type, setType] = useState<ClientType>('b2c');
  const [client, setClient] = useState<Client>(emptyClientB2C());

  const switchType = (t: ClientType) => {
    setType(t);
    setClient(t === 'b2c' ? emptyClientB2C() : emptyClientB2B());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient(client);
    router.push(`/clients/${client.id}`);
  };

  const valid =
    client.email.trim() !== '' &&
    (client.type === 'b2c'
      ? client.prenom.trim() !== '' || client.nom.trim() !== ''
      : client.raison_sociale.trim() !== '');

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="text-sm">
        <Link href="/clients" className="text-muted-foreground hover:text-primary">
          ← Clients
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau client</h1>
        <p className="text-muted-foreground mt-2">
          Crée un client B2C (particulier) ou B2B (entreprise).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Type de client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'b2c' ? 'default' : 'outline'}
                onClick={() => switchType('b2c')}
              >
                B2C — Particulier
              </Button>
              <Button
                type="button"
                variant={type === 'b2b' ? 'default' : 'outline'}
                onClick={() => switchType('b2b')}
              >
                B2B — Entreprise
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Identité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.type === 'b2c' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Prénom">
                  <Input
                    value={client.prenom}
                    onChange={(e) => setClient({ ...client, prenom: e.target.value })}
                  />
                </Field>
                <Field label="Nom">
                  <Input
                    value={client.nom}
                    onChange={(e) => setClient({ ...client, nom: e.target.value })}
                  />
                </Field>
              </div>
            ) : (
              <>
                <Field label="Raison sociale">
                  <Input
                    value={client.raison_sociale}
                    onChange={(e) =>
                      setClient({ ...client, raison_sociale: e.target.value })
                    }
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="SIRET" hint="14 chiffres (optionnel)">
                    <Input
                      value={client.siret ?? ''}
                      placeholder="123 456 789 00012"
                      onChange={(e) => setClient({ ...client, siret: e.target.value })}
                    />
                  </Field>
                  <Field label="TVA intracommunautaire" hint="Optionnel">
                    <Input
                      value={client.tva_intra ?? ''}
                      placeholder="FR12345678901"
                      onChange={(e) =>
                        setClient({ ...client, tva_intra: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Contact prénom">
                    <Input
                      value={client.contact_prenom ?? ''}
                      onChange={(e) =>
                        setClient({ ...client, contact_prenom: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Contact nom">
                    <Input
                      value={client.contact_nom ?? ''}
                      onChange={(e) =>
                        setClient({ ...client, contact_nom: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email">
                <Input
                  type="email"
                  required
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                />
              </Field>
              <Field label="Téléphone">
                <Input
                  type="tel"
                  value={client.telephone ?? ''}
                  onChange={(e) =>
                    setClient({ ...client, telephone: e.target.value })
                  }
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Adresse de facturation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Ligne 1">
              <Input
                value={client.adresse_facturation?.ligne1 ?? ''}
                onChange={(e) =>
                  setClient({
                    ...client,
                    adresse_facturation: {
                      ligne2: client.adresse_facturation?.ligne2 ?? '',
                      cp: client.adresse_facturation?.cp ?? '',
                      ville: client.adresse_facturation?.ville ?? '',
                      pays: client.adresse_facturation?.pays ?? 'France',
                      ligne1: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <Field label="Ligne 2" hint="Optionnel">
              <Input
                value={client.adresse_facturation?.ligne2 ?? ''}
                onChange={(e) =>
                  setClient({
                    ...client,
                    adresse_facturation: {
                      ligne1: client.adresse_facturation?.ligne1 ?? '',
                      cp: client.adresse_facturation?.cp ?? '',
                      ville: client.adresse_facturation?.ville ?? '',
                      pays: client.adresse_facturation?.pays ?? 'France',
                      ligne2: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="CP">
                <Input
                  value={client.adresse_facturation?.cp ?? ''}
                  onChange={(e) =>
                    setClient({
                      ...client,
                      adresse_facturation: {
                        ligne1: client.adresse_facturation?.ligne1 ?? '',
                        ligne2: client.adresse_facturation?.ligne2 ?? '',
                        ville: client.adresse_facturation?.ville ?? '',
                        pays: client.adresse_facturation?.pays ?? 'France',
                        cp: e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Ville" className="md:col-span-2">
                <Input
                  value={client.adresse_facturation?.ville ?? ''}
                  onChange={(e) =>
                    setClient({
                      ...client,
                      adresse_facturation: {
                        ligne1: client.adresse_facturation?.ligne1 ?? '',
                        ligne2: client.adresse_facturation?.ligne2 ?? '',
                        cp: client.adresse_facturation?.cp ?? '',
                        pays: client.adresse_facturation?.pays ?? 'France',
                        ville: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Pays">
              <Select
                value={client.adresse_facturation?.pays ?? 'France'}
                onChange={(e) =>
                  setClient({
                    ...client,
                    adresse_facturation: {
                      ligne1: client.adresse_facturation?.ligne1 ?? '',
                      ligne2: client.adresse_facturation?.ligne2 ?? '',
                      cp: client.adresse_facturation?.cp ?? '',
                      ville: client.adresse_facturation?.ville ?? '',
                      pays: e.target.value,
                    },
                  })
                }
              >
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Suisse">Suisse</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Autre">Autre</option>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Notes internes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="flex w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={client.notes ?? ''}
              placeholder="Spécificités, préférences, historique commercial…"
              onChange={(e) => setClient({ ...client, notes: e.target.value })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-2 pb-8">
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
