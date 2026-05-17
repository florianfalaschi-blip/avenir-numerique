'use client';

import { use, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@avenir/ui';
import { archivePdfFromElement } from '@/lib/pdf-archive';
import {
  clientLabel,
  delaiPaiementLabel,
  getAdresseFacturationDefaut,
  getAdresseLivraisonDefaut,
  modePaiementLabel,
  principalContact,
  useClients,
} from '@/lib/clients';
import {
  useFactures,
  getFactureLignes,
  montantPaye,
  montantRestant,
  STATUT_LABELS as FACTURE_STATUT_LABELS,
} from '@/lib/factures';
import { useEntreprise, formatEntrepriseAdresse } from '@/lib/entreprise';
import { CALC_LABELS } from '@/lib/default-params';
import { fmtEur } from '../../../calculateurs/_shared/format';

export default function FactureImprimerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getFacture, updateFacture, hydrated: facturesHydrated } = useFactures();
  const articleRef = useRef<HTMLElement | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [justArchived, setJustArchived] = useState(false);
  const { getClient, hydrated: clientsHydrated } = useClients();
  const { value: entreprise, hydrated: entrepriseHydrated } = useEntreprise();

  const hydrated = facturesHydrated && clientsHydrated && entrepriseHydrated;
  const facture = getFacture(id);

  if (!hydrated) {
    return <p className="text-muted-foreground text-sm p-6">Chargement…</p>;
  }

  if (!facture) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-destructive">Facture introuvable.</p>
        <Link href="/factures" className="text-sm text-primary hover:underline">
          ← Retour aux factures
        </Link>
      </div>
    );
  }

  const client = getClient(facture.client_id);
  const dateEmission = facture.date_emission
    ? new Date(facture.date_emission)
    : new Date(facture.date_creation);
  const dateEcheance = facture.date_echeance ? new Date(facture.date_echeance) : null;

  const paye = montantPaye(facture);
  const restant = montantRestant(facture);

  // Lignes facturées (multi ou implicite legacy)
  const lignes = getFactureLignes(facture);

  const adresseFact = client ? getAdresseFacturationDefaut(client) : undefined;
  const adresseLivr = client ? getAdresseLivraisonDefaut(client) : undefined;
  const adresseDifferente =
    adresseFact && adresseLivr && adresseFact.id !== adresseLivr.id;

  const contactPrincipal = client ? principalContact(client) : undefined;

  return (
    <div>
      {/* === BARRE DE CONTRÔLE (cachée à l'impression) === */}
      <div className="print:hidden mb-6 flex items-center justify-between gap-2 flex-wrap pb-4 border-b">
        <Link
          href={`/factures/${facture.id}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Retour à la facture
        </Link>
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          <span>
            Aperçu impression — utilise{' '}
            <kbd className="border rounded px-1.5 py-0.5 text-xs">
              Imprimer → Enregistrer comme PDF
            </kbd>
          </span>
          <Button
            variant="outline"
            onClick={async () => {
              if (!articleRef.current) return;
              if (archiving) return;
              setArchiving(true);
              try {
                const result = await archivePdfFromElement(
                  articleRef.current,
                  'facture',
                  facture.id
                );
                updateFacture(facture.id, {
                  pdf_archive_path: result.path,
                  pdf_archive_date: Date.now(),
                });
                setJustArchived(true);
                setTimeout(() => setJustArchived(false), 3500);
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Erreur archivage PDF');
              } finally {
                setArchiving(false);
              }
            }}
            disabled={archiving}
            title="Capture la facture actuelle et l'archive dans Supabase Storage"
          >
            {archiving
              ? '⏳ Archivage…'
              : justArchived
                ? '✓ Archivé'
                : '📸 Archiver PDF'}
          </Button>
          <Button
            variant="accent"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
          >
            🖨️ Imprimer / PDF
          </Button>
        </div>
      </div>

      {/* === DOCUMENT IMPRIMABLE === */}
      <article ref={articleRef} className="space-y-6 text-[11pt] leading-relaxed text-black">
        {/* En-tête */}
        <header className="flex justify-between items-start gap-6 pb-4 border-b-2 border-primary">
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entreprise.logo_url ?? '/logo.png'}
              alt={entreprise.raison_sociale}
              className="max-h-20 max-w-48 mb-2"
            />
            {entreprise.forme_juridique && (
              <p className="text-xs text-muted-foreground">
                {entreprise.forme_juridique}
                {entreprise.capital_social
                  ? ` au capital de ${entreprise.capital_social}`
                  : ''}
              </p>
            )}
            <address className="text-xs not-italic mt-2 space-y-0.5">
              {entreprise.adresse_ligne1 && <div>{entreprise.adresse_ligne1}</div>}
              {entreprise.adresse_ligne2 && <div>{entreprise.adresse_ligne2}</div>}
              {(entreprise.adresse_cp || entreprise.adresse_ville) && (
                <div>
                  {entreprise.adresse_cp} {entreprise.adresse_ville}
                </div>
              )}
              {entreprise.adresse_pays && entreprise.adresse_pays !== 'France' && (
                <div>{entreprise.adresse_pays}</div>
              )}
            </address>
            <div className="text-xs mt-2 space-y-0.5">
              {entreprise.telephone && <div>Tél. {entreprise.telephone}</div>}
              {entreprise.email && <div>{entreprise.email}</div>}
              {entreprise.site_web && <div>{entreprise.site_web}</div>}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-3xl font-bold tracking-tight">FACTURE</p>
            <p className="text-xl font-mono mt-1">{facture.numero}</p>
            <table className="text-xs mt-3 ml-auto">
              <tbody>
                <tr>
                  <td className="text-muted-foreground pr-3">Date d&apos;émission</td>
                  <td className="font-medium">
                    {dateEmission.toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                {dateEcheance && (
                  <tr>
                    <td className="text-muted-foreground pr-3">Échéance</td>
                    <td className="font-medium">
                      {dateEcheance.toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="text-muted-foreground pr-3">Référence commande</td>
                  <td className="font-mono">{facture.commande_numero}</td>
                </tr>
                {facture.devis_numero && (
                  <tr>
                    <td className="text-muted-foreground pr-3">Référence devis</td>
                    <td className="font-mono">{facture.devis_numero}</td>
                  </tr>
                )}
                <tr>
                  <td className="text-muted-foreground pr-3">Statut</td>
                  <td className="font-medium">{FACTURE_STATUT_LABELS[facture.statut]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </header>

        {/* Client & adresses */}
        <section className="grid grid-cols-2 gap-6 print-keep">
          <div>
            <h2 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
              Adresse de facturation
            </h2>
            {client ? (
              <div className="text-sm space-y-0.5">
                <p className="font-medium">{clientLabel(client)}</p>
                {client.type === 'b2b' && client.siret && (
                  <p className="text-xs text-muted-foreground">SIRET : {client.siret}</p>
                )}
                {client.type === 'b2b' && client.tva_intra && (
                  <p className="text-xs text-muted-foreground">TVA : {client.tva_intra}</p>
                )}
                {adresseFact ? (
                  <div className="mt-1">
                    <p>{adresseFact.ligne1}</p>
                    {adresseFact.ligne2 && <p>{adresseFact.ligne2}</p>}
                    <p>
                      {adresseFact.cp} {adresseFact.ville}
                    </p>
                    {adresseFact.pays && adresseFact.pays !== 'France' && (
                      <p>{adresseFact.pays}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    Aucune adresse de facturation enregistrée.
                  </p>
                )}
                {contactPrincipal && (
                  <p className="text-xs mt-2">
                    Contact :{' '}
                    {`${contactPrincipal.prenom} ${contactPrincipal.nom}`.trim()}
                    {contactPrincipal.fonction ? ` (${contactPrincipal.fonction})` : ''}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-destructive text-sm">
                ⚠️ Client supprimé (ID : {facture.client_id})
              </p>
            )}
          </div>

          {adresseDifferente && adresseLivr && (
            <div>
              <h2 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                Adresse de livraison
              </h2>
              <div className="text-sm space-y-0.5">
                <p>{adresseLivr.ligne1}</p>
                {adresseLivr.ligne2 && <p>{adresseLivr.ligne2}</p>}
                <p>
                  {adresseLivr.cp} {adresseLivr.ville}
                </p>
                {adresseLivr.pays && adresseLivr.pays !== 'France' && (
                  <p>{adresseLivr.pays}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Tableau — N lignes (multi-produits ou ligne unique implicite) */}
        <section className="print-keep">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-2 font-semibold">Description</th>
                <th className="text-right py-2 px-2 font-semibold w-20">Qté</th>
                <th className="text-right py-2 px-2 font-semibold w-28">PU HT</th>
                <th className="text-right py-2 px-2 font-semibold w-28">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => {
                const totalLigneHt = l.prix_ht_override ?? l.prix_ht;
                const puHt = totalLigneHt / Math.max(1, l.quantite);
                return (
                  <tr key={l.id} className="border-b align-top">
                    <td className="py-2 px-2">
                      <p className="font-medium">
                        {l.designation || CALC_LABELS[l.calculateur]}
                      </p>
                      <p className="text-[10px] text-muted-foreground italic">
                        {CALC_LABELS[l.calculateur]}
                      </p>
                      {l.recap && (
                        <pre className="whitespace-pre-wrap text-[10px] text-muted-foreground mt-1 font-sans">
                          {extractDescription(l.recap)}
                        </pre>
                      )}
                      {l.notes && (
                        <p className="text-[10px] text-muted-foreground italic mt-1">
                          {l.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">{l.quantite}</td>
                    <td className="py-2 px-2 text-right tabular">{fmtEur(puHt)}</td>
                    <td className="py-2 px-2 text-right font-medium tabular">
                      {fmtEur(totalLigneHt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Totaux */}
        <section className="flex justify-end print-keep">
          <table className="text-sm min-w-72">
            <tbody>
              <tr>
                <td className="py-1 pr-6 text-right text-muted-foreground">Total HT</td>
                <td className="py-1 text-right font-medium">
                  {fmtEur(facture.montant_ht)}
                </td>
              </tr>
              <tr>
                <td className="py-1 pr-6 text-right text-muted-foreground">
                  TVA {facture.tva_pct} %
                </td>
                <td className="py-1 text-right">
                  {fmtEur(facture.montant_ttc - facture.montant_ht)}
                </td>
              </tr>
              <tr className="border-t-2 border-black">
                <td className="py-2 pr-6 text-right font-bold text-base">Total TTC</td>
                <td className="py-2 text-right font-bold text-base">
                  {fmtEur(facture.montant_ttc)}
                </td>
              </tr>
              {paye > 0.01 && (
                <>
                  <tr>
                    <td className="py-1 pr-6 text-right text-muted-foreground">
                      Déjà payé
                    </td>
                    <td className="py-1 text-right font-medium text-green-700">
                      − {fmtEur(paye)}
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 pr-6 text-right font-bold">Reste à payer</td>
                    <td className="py-2 text-right font-bold">
                      {fmtEur(Math.max(0, restant))}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </section>

        {/* Paiements */}
        {facture.paiements.length > 0 && (
          <section className="print-keep">
            <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
              Historique des paiements
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 px-2 font-semibold">Date</th>
                  <th className="text-left py-1 px-2 font-semibold">Mode</th>
                  <th className="text-left py-1 px-2 font-semibold">Référence</th>
                  <th className="text-right py-1 px-2 font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody>
                {facture.paiements.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-1 px-2">
                      {new Date(p.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-1 px-2">{modePaiementLabel(p.mode)}</td>
                    <td className="py-1 px-2 font-mono">{p.reference ?? '—'}</td>
                    <td className="py-1 px-2 text-right">{fmtEur(p.montant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Notes */}
        {facture.notes && (
          <section className="border-l-4 border-primary pl-3 print-keep">
            <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
              Notes
            </h3>
            <p className="text-sm whitespace-pre-wrap">{facture.notes}</p>
          </section>
        )}

        {/* Conditions de paiement */}
        {client && (client.delai_paiement || client.mode_paiement_prefere) && (
          <section className="print-keep">
            <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
              Conditions de paiement
            </h3>
            <div className="text-sm space-y-0.5">
              {client.delai_paiement && (
                <p>
                  <span className="text-muted-foreground">Délai :</span>{' '}
                  {delaiPaiementLabel(
                    client.delai_paiement,
                    client.delai_paiement_autre
                  )}
                </p>
              )}
              {client.mode_paiement_prefere && (
                <p>
                  <span className="text-muted-foreground">Mode :</span>{' '}
                  {modePaiementLabel(client.mode_paiement_prefere)}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Coordonnées bancaires */}
        {entreprise.iban && (
          <section className="rounded border bg-secondary/30 p-3 print-no-bg print-keep text-xs">
            <h3 className="font-semibold mb-1">Paiement par virement</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {entreprise.banque && (
                <p>
                  <span className="text-muted-foreground">Banque :</span>{' '}
                  {entreprise.banque}
                </p>
              )}
              <p className="col-span-2 font-mono">
                <span className="text-muted-foreground">IBAN :</span> {entreprise.iban}
              </p>
              {entreprise.bic && (
                <p>
                  <span className="text-muted-foreground">BIC :</span> {entreprise.bic}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Mentions légales */}
        <footer className="pt-6 border-t text-xs text-muted-foreground space-y-2">
          <p className="font-medium">
            En cas de retard de paiement, des pénalités de retard au taux légal en vigueur
            seront appliquées (Art. L.441-10 du Code de Commerce), ainsi qu&apos;une
            indemnité forfaitaire pour frais de recouvrement de 40 € (Art. D.441-5).
          </p>
          {entreprise.mentions_devis && (
            <p className="whitespace-pre-wrap">{entreprise.mentions_devis}</p>
          )}
          <p className="text-[10px]">
            {entreprise.raison_sociale}
            {entreprise.siret ? ` — SIRET : ${entreprise.siret}` : ''}
            {entreprise.rcs ? ` — RCS ${entreprise.rcs}` : ''}
            {entreprise.tva_intra ? ` — TVA : ${entreprise.tva_intra}` : ''}
            {entreprise.ape ? ` — APE : ${entreprise.ape}` : ''}
            {formatEntrepriseAdresse(entreprise)
              ? ` — ${formatEntrepriseAdresse(entreprise)}`
              : ''}
          </p>
        </footer>
      </article>
    </div>
  );
}

function extractDescription(recap: string): string {
  return recap.split('\n').slice(0, 4).join('\n');
}
