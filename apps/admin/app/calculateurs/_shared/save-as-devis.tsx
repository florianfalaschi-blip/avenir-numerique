'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@avenir/ui';
import { useClients, clientLabel } from '@/lib/clients';
import {
  useDevis,
  newDevisId,
  newLigneId,
  addLigneToDevis,
  type Devis,
  type DevisLigne,
} from '@/lib/devis';
import type { CalcSlug } from '@/lib/default-params';

/**
 * Carte "Enregistrer comme devis" / "Ajouter au devis" affichée sur les
 * pages calc.
 *
 * Deux modes selon les query params :
 * - `?devis_pour=<client_id>` → crée un nouveau devis (1 ligne)
 * - `?add_to_devis=<devis_id>` → ajoute une ligne au devis existant
 *
 * Le snapshot du calcul courant (input/result/recap/prix/qté) devient
 * la ligne sauvegardée.
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
  const addToDevisId = searchParams.get('add_to_devis');
  const { getClient } = useClients();
  const { addDevis, updateDevis, getDevis, nextNumero } = useDevis();
  const [notes, setNotes] = useState('');

  // === MODE 2 : ajout d'une ligne à un devis existant ===
  if (addToDevisId) {
    const devis = getDevis(addToDevisId);
    if (!devis) {
      return (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Devis introuvable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Le devis (ID <code>{addToDevisId}</code>) n&apos;existe plus ou
              n&apos;est pas encore chargé.
            </p>
            <Link href="/devis">
              <Button variant="outline" size="sm">
                Retour aux devis
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }
    const client = getClient(devis.client_id);

    const handleAddLigne = () => {
      if (hasError) return;
      const designationAuto =
        recap?.split('\n')[0]?.slice(0, 80) ??
        `${calculateur} × ${quantite}`;
      const ligne: DevisLigne = {
        id: newLigneId(),
        calculateur,
        designation: designationAuto,
        quantite,
        input,
        result,
        recap,
        prix_ht: prixHt,
        prix_ttc: prixTtc,
        notes: notes.trim() || undefined,
        date_ajout: Date.now(),
      };
      const updated = addLigneToDevis(devis, ligne);
      updateDevis(devis.id, {
        lignes: updated.lignes,
        prix_ht: updated.prix_ht,
        prix_ttc: updated.prix_ttc,
        quantite: updated.quantite,
        calculateur: updated.calculateur,
      });
      router.push(`/devis/${devis.id}`);
    };

    return (
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-base">
            Ajouter au devis {devis.numero}
          </CardTitle>
          {client && (
            <p className="text-xs text-muted-foreground mt-1">
              Client : {clientLabel(client)} ·{' '}
              {(devis.lignes?.length ?? 1)} ligne(s) actuellement
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="ligne-notes"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Notes ligne (optionnel)
            </label>
            <Input
              id="ligne-notes"
              type="text"
              placeholder="Ex. Vernis sélectif, BAT validé, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="accent"
              onClick={handleAddLigne}
              disabled={hasError}
              className="flex-1"
            >
              ➕ Ajouter cette ligne au devis
            </Button>
            <Link href={`/devis/${devis.id}`}>
              <Button variant="outline">Annuler</Button>
            </Link>
          </div>
          {hasError && (
            <p className="text-xs text-destructive">
              ⚠️ Corrige le calcul avant d&apos;ajouter la ligne.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // === MODE 1 : création d'un nouveau devis ===
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
    // On crée le devis directement en mode multi-lignes (1 ligne pour ce
    // premier produit). Les top-level champs sont dénormalisés pour compat.
    const designationAuto =
      recap?.split('\n')[0]?.slice(0, 80) ?? `${calculateur} × ${quantite}`;
    const ligneInitiale: DevisLigne = {
      id: newLigneId(),
      calculateur,
      designation: designationAuto,
      quantite,
      input,
      result,
      recap,
      prix_ht: prixHt,
      prix_ttc: prixTtc,
      date_ajout: Date.now(),
    };
    const devis: Devis = {
      id: newDevisId(),
      numero: nextNumero(),
      client_id: client.id,
      lignes: [ligneInitiale],
      // Dénormalisations top-level (cohérentes avec la ligne unique)
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
