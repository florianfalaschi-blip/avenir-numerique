/**
 * Module de calepinage : optimisation du nombre de poses
 * tirées d'un grand format imprimable.
 *
 * Réutilisable par plusieurs calculateurs (Plaques, Flyers...).
 */

export interface CalepinageInput {
  /** Largeur d'un élément à imprimer (cm) */
  piece_largeur_cm: number;
  /** Hauteur d'un élément à imprimer (cm) */
  piece_hauteur_cm: number;
  /** Largeur du grand format disponible (cm) */
  format_largeur_cm: number;
  /** Hauteur du grand format disponible (cm) */
  format_hauteur_cm: number;
  /** Marge de sécurité entre pièces (cm), défaut 0 */
  espace_cm?: number;
}

export interface CalepinageOutput {
  /** Nombre de poses tirées d'un grand format */
  nb_poses: number;
  /** Vrai si rotation 90° appliquée */
  rotation_appliquee: boolean;
  /** Poses horizontales (sans rotation) */
  nb_poses_horiz: number;
  /** Poses verticales (sans rotation) */
  nb_poses_vert: number;
  /** Idem en rotation 90° */
  nb_poses_horiz_rot: number;
  nb_poses_vert_rot: number;
}

/**
 * Calcule le calepinage optimal :
 * teste l'orientation standard ET la rotation 90°,
 * garde la combinaison maximisant le nombre de poses.
 */
export function calepiner(input: CalepinageInput): CalepinageOutput {
  const espace = input.espace_cm ?? 0;

  // Orientation standard
  const piece_l = input.piece_largeur_cm + espace;
  const piece_h = input.piece_hauteur_cm + espace;
  const nb_horiz = Math.floor((input.format_largeur_cm + espace) / piece_l);
  const nb_vert = Math.floor((input.format_hauteur_cm + espace) / piece_h);
  const total_normal = nb_horiz * nb_vert;

  // Rotation 90°
  const nb_horiz_rot = Math.floor((input.format_largeur_cm + espace) / piece_h);
  const nb_vert_rot = Math.floor((input.format_hauteur_cm + espace) / piece_l);
  const total_rot = nb_horiz_rot * nb_vert_rot;

  const rotation = total_rot > total_normal;
  const nb_poses = Math.max(total_normal, total_rot);

  return {
    nb_poses,
    rotation_appliquee: rotation,
    nb_poses_horiz: nb_horiz,
    nb_poses_vert: nb_vert,
    nb_poses_horiz_rot: nb_horiz_rot,
    nb_poses_vert_rot: nb_vert_rot,
  };
}