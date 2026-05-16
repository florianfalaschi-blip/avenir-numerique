'use client';

import { use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@avenir/ui';
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
  effectivePrixHt,
  getDevisLignes,
  STATUT_LABELS,
  useDevis,
} from '@/lib/devis';
import { useEntreprise, formatEntrepriseAdresse } from '@/lib/entreprise';
import { fmtEur } from '../../../calculateurs/_shared/format';

export default function DevisImprimerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isProforma = searchParams.get('proforma') === '1';
  const docTitle = isProforma ? 'FACTURE PROFORMA' : 'DEVIS';
  const { getDevis, hydrated: devisHydrated } = useDevis();
  const { getClient, hydrated: clientsHydrated } = useClients();
  const { value: entreprise, hydrated: entrepriseHydrated } = useEntreprise();

  const hydrated = devisHydrated && clientsHydrated && entrepriseHydrated;
  const devis = getDevis(id);

  if (!hydrated) {
    return <p className="text-muted-foreground text-sm p-6">Chargement…</p>;
  }

  if (!devis) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-destructive">Devis introuvable.</p>
        <Link href="/devis" className="text-sm text-primary hover:underline">
          ← Retour aux devis
        </Link>
      </div>
    );
  }

  const client = getClient(devis.client_id);
  const dateCreation = new Date(devis.date_creation);
  const dateValidite = devis.date_validite
    ? new Date(devis.date_validite)
    : new Date(devis.date_creation + 30 * 24 * 3600 * 1000);

  // Lignes (multi ou implicite legacy)
  const lignes = getDevisLignes(devis);

  // Prix
  const prixHtBase = devis.prix_ht;
  const prixHtEffectif = effectivePrixHt(devis);
  const remiseAppliquee = prixHtEffectif < prixHtBase;
  const tvaPct = (devis.result as { tva_pct?: number } | null)?.tva_pct ?? 20;
  const prixTtcEffectif = prixHtEffectif * (1 + tvaPct / 100);
  const remiseMontant = prixHtBase - prixHtEffectif;

  // Adresses du client
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
          href={`/devis/${devis.id}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Retour au devis
        </Link>
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          {/* Toggle Devis / Proforma */}
          <div className="inline-flex rounded-md border bg-secondary/30 p-0.5 text-xs">
            <Link
              href={`/devis/${devis.id}/imprimer`}
              className={`px-2.5 py-1 rounded transition-colors ${
                !isProforma ? 'bg-background shadow-sm font-medium' : 'hover:bg-secondary'
              }`}
            >
              Devis
            </Link>
            <Link
              href={`/devis/${devis.id}/imprimer?proforma=1`}
              className={`px-2.5 py-1 rounded transition-colors ${
                isProforma ? 'bg-background shadow-sm font-medium' : 'hover:bg-secondary'
              }`}
            >
              Proforma
            </Link>
          </div>
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
      <article className="space-y-6 text-[11pt] leading-relaxed text-black">
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
                {entreprise.capital_social ? ` au capital de ${entreprise.capital_social}` : ''}
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
            <p className="text-3xl font-bold tracking-tight">{docTitle}</p>
            {isProforma && (
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                Document non comptable · Valeur informative
              </p>
            )}
            <p className="text-xl font-mono mt-1">{devis.numero}</p>
            <table className="text-xs mt-3 ml-auto">
              <tbody>
                <tr>
                  <td className="text-muted-foreground pr-3">Date d&apos;émission</td>
                  <td className="font-medium">
                    {dateCreation.toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted-foreground pr-3">Valable jusqu&apos;au</td>
                  <td className="font-medium">{dateValidite.toLocaleDateString('fr-FR')}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground pr-3">Statut</td>
                  <td className="font-medium">{STATUT_LABELS[devis.statut]}</td>
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
                ⚠️ Client supprimé (ID : {devis.client_id})
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

        {/* Tableau des lignes */}
        <section className="print-keep">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-2 font-semibold w-8">#</th>
                <th className="text-left py-2 px-2 font-semibold">Désignation</th>
                <th className="text-right py-2 px-2 font-semibold w-20">Qté</th>
                <th className="text-right py-2 px-2 font-semibold w-32">PU HT</th>
                <th className="text-right py-2 px-2 font-semibold w-32">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne, idx) => {
                const totalHt = ligne.prix_ht_override ?? ligne.prix_ht;
                const qte = Math.max(1, ligne.quantite);
                const puHt = totalHt / qte;
                return (
                  <tr key={ligne.id} className="border-b align-top">
                    <td className="py-3 px-2 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <p className="font-medium">{ligne.designation}</p>
                      {ligne.recap && (
                        <pre className="whitespace-pre-wrap text-[10px] italic text-muted-foreground mt-1 font-sans">
                          {extractDescription(ligne.recap)}
                        </pre>
                      )}
                      {ligne.notes && (
                        <p className="text-[10px] italic text-muted-foreground mt-1">
                          {ligne.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">{ligne.quantite}</td>
                    <td className="py-3 px-2 text-right">{fmtEur(puHt)}</td>
                    <td className="py-3 px-2 text-right">{fmtEur(totalHt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Récap totaux */}
        <section className="flex justify-end print-keep">
          <table className="text-sm min-w-72">
            <tbody>
              <tr>
                <td className="py-1 pr-6 text-right text-muted-foreground">Total HT</td>
                <td className="py-1 text-right font-medium">{fmtEur(prixHtBase)}</td>
              </tr>
              {remiseAppliquee && (
                <tr>
                  <td className="py-1 pr-6 text-right text-muted-foreground">
                    {devis.prix_ht_override !== undefined
                      ? 'Ajustement commercial'
                      : `Remise ${devis.remise_manuelle_pct ?? 0} %`}
                  </td>
                  <td className="py-1 text-right font-medium text-destructive">
                    − {fmtEur(remiseMontant)}
                  </td>
                </tr>
              )}
              {remiseAppliquee && (
                <tr className="border-t">
                  <td className="py-1 pr-6 text-right">Total HT net</td>
                  <td className="py-1 text-right font-semibold">
                    {fmtEur(prixHtEffectif)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-1 pr-6 text-right text-muted-foreground">
                  TVA {tvaPct} %
                </td>
                <td className="py-1 text-right">
                  {fmtEur(prixTtcEffectif - prixHtEffectif)}
                </td>
              </tr>
              <tr className="border-t-2 border-black">
                <td className="py-2 pr-6 text-right font-bold text-base">Total TTC</td>
                <td className="py-2 text-right font-bold text-base">
                  {fmtEur(prixTtcEffectif)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Notes du devis */}
        {devis.notes && (
          <section className="border-l-4 border-primary pl-3 print-keep">
            <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">
              Notes
            </h3>
            <p className="text-sm whitespace-pre-wrap">{devis.notes}</p>
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

        {/* Coordonnées bancaires (si virement défini ou IBAN configuré) */}
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
        {entreprise.mentions_devis && (
          <footer className="pt-6 border-t text-xs text-muted-foreground space-y-2">
            <p className="whitespace-pre-wrap">{entreprise.mentions_devis}</p>
            <p className="text-[10px]">
              {entreprise.raison_sociale}
              {entreprise.siret ? ` — SIRET : ${entreprise.siret}` : ''}
              {entreprise.rcs ? ` — RCS ${entreprise.rcs}` : ''}
              {entreprise.tva_intra ? ` — TVA : ${entreprise.tva_intra}` : ''}
              {entreprise.ape ? ` — APE : ${entreprise.ape}` : ''}
              {formatEntrepriseAdresse(entreprise) ? ` — ${formatEntrepriseAdresse(entreprise)}` : ''}
            </p>
          </footer>
        )}
      </article>
    </div>
  );
}

/**
 * Extrait une description courte du recap calcul pour le tableau (4 premières
 * lignes max + tronqué à 200 caractères). Évite d'imprimer le détail complet
 * sous chaque ligne tout en gardant assez d'info pour le lecteur.
 */
function extractDescription(recap: string): string {
  const short = recap.split('\n').slice(0, 4).join('\n');
  return short.length > 200 ? short.slice(0, 200).trimEnd() + '…' : short;
}
