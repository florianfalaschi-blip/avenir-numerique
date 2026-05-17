'use client';

/**
 * Helpers pour capturer le DOM d'une page d'impression et l'archiver en PDF
 * dans Supabase Storage (bucket pdf-archives).
 *
 * Stratégie :
 * 1. html2canvas → screenshot HTMLCanvasElement du DOM cible
 * 2. jsPDF → convertit le canvas en page(s) A4
 * 3. uploadFile → push vers Supabase bucket pdf-archives
 *
 * Le PDF résultant est une "image PDF" (DOM rastérisé), pas un PDF avec texte
 * sélectionnable — c'est suffisant pour l'archivage légal d'un snapshot WYSIWYG.
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { uploadFile, type UploadResult } from './storage';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Convertit un élément DOM en PDF A4 (potentiellement multi-pages si l'élément
 * est plus haut qu'une page) et retourne un Blob `application/pdf`.
 *
 * `scale=2` rend le PDF 2× plus précis pour l'impression (au prix de taille).
 */
export async function captureElementToPdfBlob(
  element: HTMLElement,
  options: { scale?: number } = {}
): Promise<Blob> {
  const scale = options.scale ?? 2;

  // 1. Rastérise le DOM en canvas
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    // Background white pour éviter les fonds transparents → noir en PDF
    backgroundColor: '#ffffff',
  });

  // 2. Crée le PDF A4 portrait
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // 3. Calcule les dimensions image / PDF
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const imgWidthMm = A4_WIDTH_MM;
  const imgHeightMm = (canvas.height / canvas.width) * imgWidthMm;

  // 4. Si l'image tient sur une page → 1 seule page
  if (imgHeightMm <= A4_HEIGHT_MM) {
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
  } else {
    // Sinon multi-pages : on découpe l'image avec offset négatif
    let yOffsetMm = 0;
    while (yOffsetMm < imgHeightMm) {
      pdf.addImage(imgData, 'JPEG', 0, -yOffsetMm, imgWidthMm, imgHeightMm);
      yOffsetMm += A4_HEIGHT_MM;
      if (yOffsetMm < imgHeightMm) pdf.addPage();
    }
  }

  return pdf.output('blob');
}

/**
 * Capture le DOM cible, génère un PDF, et upload dans Supabase Storage
 * (bucket pdf-archives) avec un nom dérivé de l'entité.
 *
 * Pattern de nom : `<entityType>_<entityId>_<timestamp>.pdf`
 * Ex: `devis_devis_1234_5678_1747508234.pdf`
 *
 * Retourne le UploadResult (path + URL signée 1h).
 */
export async function archivePdfFromElement(
  element: HTMLElement,
  entityType: 'devis' | 'facture' | 'proforma',
  entityId: string,
  options: { scale?: number; upsert?: boolean } = {}
): Promise<UploadResult> {
  const blob = await captureElementToPdfBlob(element, options);
  // Convertit Blob en File (uploadFile attend un File)
  const file = new File([blob], `${entityType}_${entityId}.pdf`, {
    type: 'application/pdf',
  });
  return uploadFile('pdf-archives', file, {
    prefix: `${entityType}_${entityId}`,
    upsert: options.upsert ?? false,
  });
}
