# 🔄 Workflows utilisateurs — Avenir Numérique

> **Document de référence — Parcours client e-commerce et parcours interne**  
> Version 1.0 — Mai 2026  
> Préparé pour la refonte technique du back-office et du site e-commerce

---

## Table des matières

1. [Acteurs](#1-acteurs)
2. [Parcours client e-commerce](#2-parcours-client-e-commerce)
3. [Parcours interne back-office](#3-parcours-interne-back-office)
4. [Workflows de production par produit](#4-workflows-de-production-par-produit)
5. [Notifications et communication](#5-notifications-et-communication)
6. [Permissions et rôles](#6-permissions-et-rôles)

---

## 1. Acteurs

### Côté client (site e-commerce public)

| Acteur | Description |
|---|---|
| **Visiteur** | Personne non connectée qui découvre le catalogue (prix de base visibles) |
| **Client B2C** | Compte particulier (validation auto à l'inscription) |
| **Client B2B** | Compte entreprise (SIRET demandé, validation manuelle Avenir, accès aux remises) |

### Côté Avenir Numérique (back-office)

| Acteur | Description |
|---|---|
| **Admin** | Florian — Accès total, gère utilisateurs, paramètres, marges, tarifs |
| **Commercial** | Maxime — Suit ses clients et commandes, calcule devis, valide BAT |
| **Opérateur prod** | Lance les impressions, marque les étapes terminées |
| **Façonneur** | Reliure, découpe, finitions |
| **Expédition** | Préparation colis, étiquettes, suivi transporteur |
| **Compta** | Factura, relances, exports comptables |

> Permissions **ultra-granulaires** : chaque action est protégée par une permission Supabase configurable par admin.

---

## 2. Parcours client e-commerce

### 2.1 Inscription / Connexion

```mermaid
flowchart TD
    Visit[Visiteur arrive sur le site] --> Browse[Parcourt le catalogue]
    Browse --> SeePrice[Voit prix de base public]
    Browse --> WantOrder[Veut commander]
    WantOrder --> HasAccount{A un compte ?}
    HasAccount -->|Non| Signup[Page inscription]
    HasAccount -->|Oui| Login[Se connecte]
    Signup --> ChooseType{Particulier ou Pro ?}
    ChooseType -->|Particulier| B2CAuto[Compte B2C actif immédiatement]
    ChooseType -->|Pro| B2BPending[Compte B2B en attente validation]
    B2BPending --> AvenirValid[Admin Avenir valide manuellement]
    AvenirValid --> B2BActive[Compte B2B actif + remises débloquées]
```

**Champs inscription** :
- Particulier : email, mot de passe, nom, prénom
- Pro : + raison sociale, SIRET, TVA intra, contact, adresse facturation

### 2.2 Sélection produit

```mermaid
flowchart TD
    Cat[Catalogue produits] --> Pick[Sélectionne un produit]
    Pick --> Config{Mode configuration}
    Config -->|Standard| Grid[Grille pré-calculée<br/>quantité × papier × options]
    Config -->|Avancé| Configurator[Configurateur dynamique<br/>appel moteur calcul live]
    Grid --> ShowPrice[Prix affiché immédiatement]
    Configurator --> ShowPrice
    ShowPrice --> AddCart[Ajoute au panier]
    AddCart --> Continue{Continue ?}
    Continue -->|Autre produit| Cat
    Continue -->|Checkout| Checkout
```

**Niveau d'autonomie** : grille pré-calculée pour 80% des cas (rapide), configurateur sur-mesure pour configurations atypiques (signal, format spécial).

### 2.3 Checkout / Commande

```mermaid
flowchart TD
    Cart[Panier] --> Checkout[Checkout]
    Checkout --> Addr[Sélection adresses fact + liv]
    Addr --> Ship[Choix livraison<br/>Standard transporteur OU retrait sur place]
    Ship --> ShipCost[Calcul frais port<br/>selon poids/volume]
    ShipCost --> Files[Upload fichiers impression<br/>+ gabarit téléchargeable]
    Files --> BAT{Option BAT ?}
    BAT -->|Oui| BATAdd[BAT payant ajouté au panier]
    BAT -->|Non| Pay[Choix paiement]
    BATAdd --> Pay
    Pay --> PayMethod{Méthode}
    PayMethod -->|CB Stripe| StripePay[Paiement immédiat]
    PayMethod -->|PayPal| PayPalPay[Paiement immédiat]
    PayMethod -->|Virement| TransferPay[Commande en attente paiement]
    PayMethod -->|30j fin de mois B2B| B2BPay[Commande validée<br/>facture à échéance]
    StripePay --> Confirm[Commande confirmée]
    PayPalPay --> Confirm
    TransferPay --> AwaitPayment[Production déclenchée<br/>seulement après réception virement]
    B2BPay --> Confirm
    Confirm --> Email[Email de confirmation envoyé]
```

**Règles de paiement** :
- **CB + PayPal** : paiement immédiat obligatoire pour B2C et B2B sans compte spécial
- **Virement** : disponible pour B2B uniquement, production déclenchée à réception
- **30j fin de mois** : disponible pour B2B validés et configurés en backoffice

### 2.4 Suivi de commande client

```mermaid
flowchart TD
    Order[Commande passée] --> Track[Espace client - Suivi commande]
    Track --> Timeline[Timeline visuelle des étapes]
    Timeline --> S1[✅ Reçue]
    Timeline --> S2[✅ Paiement validé]
    Timeline --> S3[⏳ Vérification fichiers / BAT]
    Timeline --> S4[⏳ En production]
    Timeline --> S5[⏳ Finitions / Façonnage]
    Timeline --> S6[⏳ Préparation expédition]
    Timeline --> S7[⏳ Expédiée]
    Timeline --> S8[⏳ Livrée]
    
    S3 -->|BAT à valider| BATValidate[Page validation BAT<br/>avec preview fichier]
    BATValidate -->|OK| BATok[BAT validé → recalcul date livraison]
    BATValidate -->|Refus avec commentaire| BATretry[Avenir reprend le BAT]
```

### 2.5 Espace client (fonctionnalités)

- ✅ Historique des commandes + re-commande en 1 clic
- ✅ Carnet d'adresses (fact / liv) sauvegardées
- ✅ Téléchargement factures PDF
- ✅ Gestion BAT en cours
- ✅ Suivi temps réel avec timeline
- ✅ Téléchargement des gabarits

### 2.6 Fonctionnalités marketing prévues

- 🎯 Module avis clients (étoiles + commentaires)
- 🎯 Programme de fidélité / parrainage
- 🎯 Codes promo / bons de réduction
- 🎯 Chat / support en ligne
- 🎯 Newsletter

---

## 3. Parcours interne back-office

### 3.1 Réception d'une commande web

```mermaid
flowchart TD
    OrderArrive[Commande web reçue<br/>Stripe payment OK + fichiers uploadés] --> CheckBAT{Option BAT ?}
    CheckBAT -->|Non| AutoProd[Direct en planning production]
    CheckBAT -->|Oui| BATCheck[Contrôle fichier interne ≤ 24h]
    BATCheck --> BATSend[Envoi BAT électronique au client]
    BATSend --> WaitClient[Attente validation client]
    WaitClient -->|Validé| InternalCheck[Validation interne par équipe Avenir]
    WaitClient -->|Pas de réponse 24h| Relance[Email de relance auto]
    Relance -->|Pas de réponse X jours| AutoValidate[Validation auto + recalcul date livraison]
    Relance -->|Validé| InternalCheck
    AutoValidate --> InternalCheck
    InternalCheck --> AutoProd
```

**Règle BAT clé** : à chaque validation tardive, la **date de livraison est recalculée** automatiquement à partir de la date de validation effective.

### 3.2 Création manuelle d'un devis (commande hors site)

```mermaid
flowchart TD
    PhoneEmail[Demande téléphone / email / déplacement] --> CommercialCreate[Commercial crée un devis<br/>dans le back-office]
    CommercialCreate --> ChooseCalc[Sélectionne calculateur<br/>Flyers / Brochures / etc.]
    ChooseCalc --> FillSpecs[Configure spécifications]
    FillSpecs --> CalcPrice[Calcul du prix]
    CalcPrice --> SaveDraft[Sauvegarde brouillon]
    SaveDraft --> SendQuote[Envoie devis PDF au client]
    SendQuote --> WaitClient[Attente acceptation]
    WaitClient -->|Refusé| Archive[Devis archivé]
    WaitClient -->|Accepté| ConvertOrder[Conversion en commande]
    ConvertOrder --> Production[Direction production<br/>BAT optionnel]
```

### 3.3 Workflow production (orchestration)

```mermaid
flowchart TD
    NewOrder[Nouvelle commande en prod] --> Assignment[Assignation auto au commercial]
    Assignment --> Prio[Priorisation]
    Prio --> Tags[Tags catégorie : urgent / standard / complexe]
    Prio --> SLA[SLA selon type produit]
    Prio --> ManualPrio[Possibilité override manuel par admin]
    Tags & SLA & ManualPrio --> Steps[Workflow d'étapes personnalisé par produit]
    Steps --> AssignOperator[Chaque étape assignée à un opérateur]
    AssignOperator --> Track[Tracking en temps réel]
    Track --> Done[Toutes étapes OK → préparation expédition]
```

**Priorisation** : combinaison des 3 méthodes (tags + SLA + override manuel).

### 3.4 Expédition

```mermaid
flowchart TD
    Ready[Commande prête] --> Type{Mode livraison}
    Type -->|Livraison transporteur| ChooseTransporter{Quel transporteur ?}
    Type -->|Retrait sur place| NotifyClient[Email client : commande prête]
    ChooseTransporter -->|Principal API| AutoLabel[Étiquette générée auto via API]
    ChooseTransporter -->|Autre| ManualLabel[Saisie manuelle n° de suivi]
    AutoLabel --> Tracking[Numéro de suivi enregistré]
    ManualLabel --> Tracking
    Tracking --> EmailClient[Email expédition + lien suivi]
    EmailClient --> ClientView[Visible dans espace client]
```

### 3.5 Facturation interne (module dédié)

```mermaid
flowchart TD
    Order[Commande payée] --> AutoInvoice[Génération facture PDF auto]
    AutoInvoice --> SaveSupa[Stockage Supabase]
    SaveSupa --> ClientEmail[Email client + lien téléchargement]
    SaveSupa --> Compta[Disponible pour compta]
    Compta --> Exports[Exports comptables<br/>Pennylane / Sage / format générique]
    Compta --> Refund{Avoir / remboursement ?}
    Refund -->|Oui| StripeRefund[Refund via Stripe API]
    StripeRefund --> CreditNote[Génération avoir PDF]
    AutoInvoice --> Reminder{Paiement en attente ?}
    Reminder -->|Virement non reçu| AutoRelance[Relance auto à J+7, J+14, J+30]
    Reminder -->|30j fin de mois| ScheduledReminder[Relance auto à échéance]
```

### 3.6 Reporting / statistiques

**Tableaux de bord disponibles** :
- 📊 **Ventes & CA** : par jour / semaine / mois / année
- 📊 **Produits** : top vendus, panier moyen, taux conversion configurateur
- 📊 **Commercial** : ventes par commercial, taux validation devis, temps moyen de réponse
- 📊 **Client** : nouveaux vs récurrents, top clients par CA, taux d'attrition
- 📊 **Compta** : TVA collectée, CA HT, exports formats standards
- 📊 **Production** : délais moyens, retards, capacité utilisée par machine

---

## 4. Workflows de production par produit

Chaque type de produit a son **workflow d'étapes personnalisable**. Voici les workflows types :

### 4.1 Roll-up

```
1. Réception fichier client
2. Préparation BAT électronique (si option)
3. Validation BAT (client + interne)
4. Impression Epson solvant
5. Assemblage structure
6. Conditionnement (sac + scratchs inclus)
7. Préparation expédition
8. Expédition / retrait
```

### 4.2 Plaques

```
1. Réception fichier client + BAT
2. Validation BAT
3. Impression Mutoh UV LED
4. Découpe Zund (forme ou pleine plaque)
5. Pose finitions (œillets, supports, vernis, etc.)
6. Conditionnement
7. Expédition
```

### 4.3 Flyers / Affiches

```
1. Réception fichier client + BAT
2. Validation BAT
3. Impression (offset ou numérique selon quantité)
4. Massicotage (coupe au format)
5. Finitions (pelliculage, vernis, dorure...)
   → Si sous-traitance : envoi fournisseur + suivi retour
6. Conditionnement
7. Expédition
```

### 4.4 Bobines / Étiquettes

```
1. Réception fichier client + BAT
2. Validation BAT
3. Impression solvant/éco-solvant
4. Découpe Zund/Summa (forme ou simple)
5. Conditionnement (planches à plat OU rouleau applicateur)
6. Expédition
```

### 4.5 Brochures

```
1. Réception fichier client + BAT
2. Validation BAT
3. Impression intérieur (offset ou numérique)
4. Impression couverture (offset ou numérique, peut être ≠ intérieur)
5. Massicotage feuilles
6. Pliage (si nécessaire)
7. Reliure (agrafage / dos carré collé / cousu / spirale / wire-o)
   → Si dos carré cousu : peut être sous-traité
8. Finitions couverture (pelliculage, vernis...)
9. Massicotage final brochure
10. Conditionnement
11. Expédition
```

> Le workflow est **stocké en JSONB** dans la commande, permettant des variations / étapes additionnelles sans modifier le code.

---

## 5. Notifications et communication

### 5.1 Emails envoyés au client

| Événement | Email | Contenu |
|---|---|---|
| Commande passée | ✅ Confirmation commande | Récap, n° commande, lien suivi |
| Paiement validé | ✅ Confirmation paiement | Facture PDF en pièce jointe |
| BAT à valider | ✅ Notification BAT | Lien direct vers BAT |
| BAT validé | ✅ Confirmation BAT | Date de livraison estimée |
| Expédition | ✅ Notification expédition | N° de suivi + lien transporteur |
| Livraison | ✅ Confirmation livraison | Demande d'avis |

### 5.2 Emails internes Avenir

| Événement | Destinataire | Action |
|---|---|---|
| Nouvelle commande | Commercial assigné | Notification + lien commande |
| BAT validé par client | Équipe production | Lancer la production |
| Retour transporteur | Commercial assigné | Suivi |
| Paiement impayé | Compta | Lancer relance |

---

## 6. Permissions et rôles

### Rôles standards (à enrichir)

| Rôle | Permissions principales |
|---|---|
| **Admin** | `*` (toutes) |
| **Commercial** | view_clients, edit_own_clients, create_devis, manage_own_production, view_orders |
| **Opérateur prod** | view_production, mark_step_done, view_files |
| **Façonneur** | view_production (étapes façonnage), mark_step_done |
| **Expédition** | view_orders_ready_to_ship, generate_labels, mark_shipped |
| **Compta** | view_invoices, manage_invoices, exports, view_payments |

> Système actuel basé sur permissions Supabase **ultra-granulaires** (cases à cocher dans la modale).

### Règles spécifiques

- Un commercial voit **uniquement ses clients** (filtré par `owner_id`)
- Un admin voit **tout**
- Les **opérateurs prod / façonneurs / expé / compta** voient uniquement ce qui les concerne (étapes affectées à leur rôle)

---

## 📌 Points laissés à compléter ultérieurement

- ✋ Définir le délai exact avant validation auto BAT (24h, 48h, 72h ?)
- ✋ Définir SLA par type de produit (Roll-up = J+3, Flyers = J+5, Brochures = J+7, etc.)
- ✋ Définir transporteur principal (DPD ? Chronopost ?)
- ✋ Configurer les seuils de relance compta (J+7, J+14, J+30, J+45)
- ✋ Définir taux de remise B2B par défaut
- ✋ Décider si workflow étapes peut être modifié par un commercial ou seul admin
- ✋ Liste précise des règles de calcul frais de port (par poids/volume/destination)

---

*Fin du document — Workflows version 1.0 — Mai 2026*
