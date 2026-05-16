'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { useClients, clientLabel } from '@/lib/clients';
import { useDevis, newDevisId, type Devis } from '@/lib/devis';
import type { CalcSlug } from '@/lib/default-params';

/**
 * Carte "Enregistrer comme devis" affichée sur les pages calc quand
 * la query param `?devis_pour=<client_id>` est présente.
 *
 * Lit le client cible, capture le snapshot du calcul courant, crée
 * le devis et redirige vers sa page de détails.
 */
export function SaveAsDevisCard({
  calculateur,
  input,
  result,
  recap,
  prixHt,
  prixTtc,
  quantite,
  hasError,
}: {
  calculateur: CalcSlug;
  input: unknown;
  result: unknown;
  recap?: string;
  /** Prix HT final (figé). */
  prixHt: number;
  prixTtc: number;
  /** Quantité figée (pour tri ultérieur). */
  quantite: number;
  /** Si true, désactive le bouton save (résultat invalide). */
  hasError?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('devis_pour');
  const { getClient } = useClients();
  const { addDevis, nextNumero } = useDevis();
  const [notes, setNotes] = useState('');

  if (!clientId) return null;
  const client = getClient(clientId);
  if (!client) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Client introuvable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Le client (ID <code>{clientId}</code>) n&apos;existe plus.
          </p>
          <Link href="/devis/nouveau">
            <Button variant="outline" size="sm">
              Choisir un autre client
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    if (hasError) return;
    const devis: Devis = {
      id: newDevisId(),
      numero: nextNumero(),
      client_id: client.id,
      calculateur,
      input,
      result,
      recap,
      prix_ht: prixHt,
      prix_ttc: prixTtc,
      quantite,
      statut: 'brouillon',
      date_creation: Date.now(),
      notes: notes.trim() || undefined,
      // Pré-remplit la remise habituelle du client (modifiable ensuite
      // sur la page détail devis).
      remise_manuelle_pct:
        client.remise_habituelle_pct && client.remise_habituelle_pct > 0
          ? client.remise_habituelle_pct
          : undefined,
    };
    addDevis(devis);
    router.push(`/devis/${devis.id}`);
  };

  const remiseHabituelle = client.remise_habituelle_pct ?? 0;

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader>
        <CardTitle className="text-base">
          Devis en cours pour {clientLabel(client)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {remiseHabituelle > 0 && (
          <p className="text-xs text-muted-foreground bg-background/50 rounded px-2 py-1.5 border">
            💡 Remise habituelle du client : <strong>-{remiseHabituelle} %</strong> — sera
            pré-appliquée au devis (modifiable ensuite).
          </p>
        )}
        <div className="space-y-1.5">
          <label
            htmlFor="devis-notes"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Notes (optionnel)
          </label>
          <Input
            id="devis-notes"
            type="text"
            placeholder="Ex. Livraison urgente, BAT à valider..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="accent"
            onClick={handleSave}
            disabled={hasError}
            className="flex-1"
          >
            Enregistrer comme devis
          </Button>
          <Link href="/devis/nouveau">
            <Button variant="outline">Changer de client</Button>
          </Link>
        </div>
        {hasError && (
          <p className="text-xs text-destructive">
            ⚠️ Corrige le calcul avant d&apos;enregistrer.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
