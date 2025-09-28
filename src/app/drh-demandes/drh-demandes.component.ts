import {
  Component, OnInit, OnDestroy,
  ElementRef, ViewChild, AfterViewInit,
  NgZone, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandeListDTO } from '../models/DemandeListDTO';
import { DemandeDetailDTO } from '../models/DemandeDetailDTO';
import { DemandeService } from '../services/demande/demande.service';
import { CATEGORIE_LABELS, CategorieDemande } from '../models/Categoriedemande.model';
import { TYPE_DEMANDE_LABELS, TypeDemande } from '../models/TypeDemande.model';
import { STATUT_LABELS, StatutDemande } from '../models/StatutDemande.model';

import { interval, of, Subscription, forkJoin } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { EmployeService } from '../services/employe/employe.service';

declare const bootstrap: any;

@Component({
  selector: 'app-drh-demandes',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './drh-demandes.component.html'
})
export class DrhDemandesComponent implements OnInit, AfterViewInit, OnDestroy {
  rows: DemandeListDTO[] = [];
  dgRows: DemandeListDTO[] = []; // Demandes du DG
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private pendingOpenId: number | null = null;
  isSuper: boolean = true;
  
  @ViewChild('detailModal') detailModal!: ElementRef<HTMLDivElement>;
  private bsModal!: any;

  selected: DemandeDetailDTO | null = null;
  refuseComment = '';

  // Recherche globale (live)
  searchTerm = '';

  // Filtres d'en-tête
  hfMatricule = '';
  hfNom = '';
  hfPrenom = '';
  hfCategorie: '' | CategorieDemande = '';
  hfType: '' | TypeDemande = '';
  hfStatut: '' | StatutDemande = '';
  hfDateDebut = ''; // yyyy-MM-dd
  hfDateFin   = ''; // yyyy-MM-dd

  // Tri
  sortCol: string = 'dateCreation';
  sortDir: 'asc' | 'desc' = 'desc';

  // Pagination
  page = 1;
  pageSize = 10;
  pageSizes = [5, 10, 20, 50];

  // Offcanvas (UI) -> appliqué via Apply
  uiFilterStatus: '' | StatutDemande = '';
  uiFilterType: '' | TypeDemande = '';
  uiFilterCategorie: '' | CategorieDemande = '';
  uiSortBy: 'recent' | 'ancien' | 'nomAZ' | 'nomZA' = 'recent';

  // ---- Auto refresh (polling) ----
  refreshIntervalMs = 10_000; // ← ajuste l'intervalle (ms)
  private pollSub?: Subscription;

  constructor(
    private demandeService: DemandeService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private employeService: EmployeService
  ) {}

  loadisSuperDrh() {
    this.employeService.estSuper().subscribe({
      next: (req) => {
        this.isSuper = req;
        console.log('isSuper:', this.isSuper);
        // Recharger les données après avoir déterminé le statut
        this.fetchRows();
      },
      error: (err) => {
        console.log("Error when load isSuperDrh:", err);
        this.isSuper = false;
      }
    });
  }

  ngOnInit(): void {
    // D'abord charger le statut super, puis les demandes
    this.loadisSuperDrh();
    
    // Démarrer le rafraîchissement périodique
    this.startAutoRefresh();
    
    // Ouvrir si ?open=ID présent
    this.route.queryParamMap.subscribe(pm => {
      const raw = pm.get('open');
      const id = raw ? Number(raw) : NaN;
      if (!isNaN(id) && id > 0) {
        if (this.bsModal) this.openDetail(id);
        else this.pendingOpenId = id;
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.detailModal?.nativeElement) {
      this.bsModal = bootstrap.Modal.getOrCreateInstance(this.detailModal.nativeElement);
    }
    if (this.pendingOpenId) {
      const id = this.pendingOpenId; 
      this.pendingOpenId = null;
      this.openDetail(id);
    }
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  // --- API ---
  /**
   * Charge les demandes.
   * @param keepPage rester sur la page courante (true pour ne pas reset la pagination)
   * @param silent ne pas afficher le spinner (pour le polling)
   */
  fetchRows(keepPage = false, silent = false): void {
    if (!silent) this.loading = true;
    this.errorMessage = null;

    const previousPage = this.page;

    // Si c'est un super DRH, charger aussi les demandes du DG
    if (!this.isSuper) {
      forkJoin({
        drhDemandes: this.demandeService.getDemandesForDrh(),
        dgDemandes: this.demandeService.getDemandesDG()
      }).subscribe({
        next: (data) => {
          this.ngZone.run(() => {
            // Convertir les demandes DG en DemandeListDTO si nécessaire
            const dgDemandesListDTO = this.convertDemandesToDTO(data.dgDemandes || []);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",dgDemandesListDTO);
            
            
            // Fusionner les deux listes
            this.rows = [...(data.drhDemandes || []), ...dgDemandesListDTO];
            this.page = keepPage ? previousPage : 1;
            if (!silent) this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.errorMessage = err?.error?.message || err?.message || 'Erreur de chargement.';
            if (!silent) this.loading = false;
            this.cdr.detectChanges();
          });
        }
      });
    } else {
      // DRH normal - seulement les demandes DRH
      this.demandeService.getDemandesForDrh().subscribe({
        next: (data) => {
          this.ngZone.run(() => {
            this.rows = data ?? [];
            this.page = keepPage ? previousPage : 1;
            if (!silent) this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.errorMessage = err?.error?.message || err?.message || 'Erreur de chargement.';
            if (!silent) this.loading = false;
            this.cdr.detectChanges();
          });
        }
      });
    }
  }

  /** Convertit les Demandes en DemandeListDTO */
  private convertDemandesToDTO(demandes: any[]): DemandeListDTO[] {
    return demandes.map(demande => ({
      id: demande.id,
      employeMatricule: demande.employe?.matricule || null,
      employeNom: demande.employe?.nom || null,
      employePrenom: demande.employe?.prenom || null,
      categorie: demande.categorie,
      typeDemande: demande.typeDemande || null,
      dateDebut: this.getDateDebut(demande),
      dateFin: this.getDateFin(demande),
      statut: demande.statut,
      dateCreation: demande.dateCreation || null
    }));
  }

  /** Récupère la date de début selon la catégorie */
  private getDateDebut(demande: any): string | null {
    switch (demande.categorie) {
      case 'CONGE_STANDARD':
      case 'CONGE_EXCEPTIONNEL':
        return demande.congeDateDebut || null;
      case 'AUTORISATION':
        return demande.autoDate || null;
      case 'ORDRE_MISSION':
        return demande.missionDateDebut || null;
      default:
        return null;
    }
  }

  /** Récupère la date de fin selon la catégorie */
  private getDateFin(demande: any): string | null {
    switch (demande.categorie) {
      case 'CONGE_STANDARD':
      case 'CONGE_EXCEPTIONNEL':
        return demande.congeDateFin || null;
      case 'AUTORISATION':
        return demande.autoDate || null; // Même date pour autorisation
      case 'ORDRE_MISSION':
        return demande.missionDateFin || null;
      default:
        return null;
    }
  }

  /** Démarre le rafraîchissement périodique (temps réel "like"). */
  private startAutoRefresh(): void {
    this.ngZone.runOutsideAngular(() => {
      this.pollSub = interval(this.refreshIntervalMs)
        .pipe(
          switchMap(() => {
            if (this.isSuper) {
              return forkJoin({
                drhDemandes: this.demandeService.getDemandesForDrh().pipe(catchError(() => of([]))),
                dgDemandes: this.demandeService.getDemandesDG().pipe(catchError(() => of([])))
              });
            } else {
              return this.demandeService.getDemandesForDrh().pipe(
                catchError(() => of([])),
                switchMap(drhDemandes => of({ drhDemandes, dgDemandes: [] }))
              );
            }
          })
        )
        .subscribe((data: any) => {
          if (!data) return;
          this.ngZone.run(() => {
            if (this.isSuper) {
              const dgDemandesListDTO = this.convertDemandesToDTO(data.dgDemandes || []);
              this.rows = [...(data.drhDemandes || []), ...dgDemandesListDTO];
            } else {
              this.rows = data.drhDemandes || [];
            }
            this.cdr.detectChanges();
          });
        });
    });
  }

  openDetail(id: number): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.refuseComment = '';
    this.demandeService.getDemandeDetail(id).subscribe({
      next: (d) => {
        this.ngZone.run(() => {
          this.selected = d;
          this.cdr.detectChanges();
          this.bsModal?.show();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.errorMessage = err?.error?.message || err?.message || 'Erreur lors du chargement des détails.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  closeDetail(): void { 
    if (this.bsModal) this.bsModal.hide(); 
  }

  approve(): void {
    if (!this.selected) return;
    this.errorMessage = null;
    this.successMessage = null;
    this.demandeService.validerDemande(this.selected.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = 'Demande validée.';
          // Reload immédiat (silencieux + conserve la page)
          this.fetchRows(true, true);
          // Optionnel: recharger le détail
          this.demandeService.getDemandeDetail(this.selected!.id).subscribe(d => {
            this.ngZone.run(() => { this.selected = d; this.cdr.detectChanges(); });
          });
        });
      },
      error: (err) => this.ngZone.run(() => {
        this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de la validation.';
        this.cdr.detectChanges();
      })
    });
  }

  confirmRefuse(): void {
    if (!this.selected) return;
    const motif = (this.refuseComment || '').trim();
    if (!motif) { this.errorMessage = 'Veuillez saisir un motif de refus.'; return; }

    this.errorMessage = null;
    this.successMessage = null;
    this.demandeService.refuserDemande(this.selected.id, motif).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = 'Demande refusée.';
          // Reload immédiat (silencieux + conserve la page)
          this.fetchRows(true, true);
          // Optionnel: recharger le détail
          this.demandeService.getDemandeDetail(this.selected!.id).subscribe(d => {
            this.ngZone.run(() => { this.selected = d; this.cdr.detectChanges(); });
          });
          this.refuseComment = '';
        });
      },
      error: (err) => this.ngZone.run(() => {
        this.errorMessage = err?.error?.message || err?.message || 'Erreur lors du refus.';
        this.cdr.detectChanges();
      })
    });
  }

  // --- Libellés & dates ---
  labelType(td: TypeDemande | null | undefined): string {
    if (!td) return '-';
    return (TYPE_DEMANDE_LABELS as any)[td] ?? td;
  }

  labelCategorie(cat: CategorieDemande | null | undefined): string {
    if (!cat) return '-';
    return (CATEGORIE_LABELS as any)[cat] ?? cat;
  }

  labelStatut(s: StatutDemande | null | undefined): string {
    if (!s) return '-';
    return (STATUT_LABELS as any)[s] ?? s;
  }

  fmtDate(d: string | null | undefined): string {
    if (!d) return '-';
    if (d.includes('T')) return d;
    const [y, m, dd] = d.split('-');
    return `${dd}/${m}/${y}`;
  }

  // --- Normalisation texte pour la recherche ---
  private norm(s: any): string {
    return ('' + (s ?? ''))
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim();
  }

  private fmtFrDateForSearch(d: string | null | undefined): string {
    if (!d) return '';
    if (d.includes('T')) {
      const date = new Date(d);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } else {
      const [y, m, dd] = d.split('-');
      return `${dd}/${m}/${y}`;
    }
  }

  // --- Tri ---
  onSort(col: string): void {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = (col.includes('date')) ? 'desc' : 'asc';
    }
    this.page = 1;
  }

  sortIcon(col: string): string {
    if (this.sortCol !== col) return 'bi bi-arrow-down-up text-muted';
    return this.sortDir === 'asc' ? 'bi bi-sort-down text-primary' : 'bi bi-sort-up text-primary';
  }

  resetToFirstPage(): void { this.page = 1; }

  // --- Jeu filtré/trié ---
  get filteredRows(): DemandeListDTO[] {
    let list = [...(this.rows || [])];

    const q = this.norm(this.searchTerm);
    if (q) {
      list = list.filter(r => {
        const hay = [
          r.employeMatricule, r.employeNom, r.employePrenom,
          `${r.employeNom || ''} ${r.employePrenom || ''}`,
          this.labelCategorie(r.categorie),
          this.labelType(r.typeDemande),
          this.labelStatut(r.statut),
          this.fmtFrDateForSearch(r.dateDebut),
          this.fmtFrDateForSearch(r.dateFin)
        ].map(v => this.norm(v)).join(' ');
        return hay.includes(q);
      });
    }

    if (this.hfMatricule) list = list.filter(r => this.norm(r.employeMatricule).includes(this.norm(this.hfMatricule)));
    if (this.hfNom)       list = list.filter(r => this.norm(r.employeNom).includes(this.norm(this.hfNom)));
    if (this.hfPrenom)    list = list.filter(r => this.norm(r.employePrenom).includes(this.norm(this.hfPrenom)));
    if (this.hfCategorie) list = list.filter(r => r.categorie === this.hfCategorie);
    if (this.hfType)      list = list.filter(r => r.typeDemande === this.hfType);
    if (this.hfStatut)    list = list.filter(r => r.statut === this.hfStatut);
    if (this.hfDateDebut) list = list.filter(r => (r.dateDebut || '') === this.hfDateDebut);
    if (this.hfDateFin)   list = list.filter(r => (r.dateFin || '')   === this.hfDateFin);

    const parse = (s?: string | null) => (s ? Date.parse(s as string) : 0);
    list.sort((a, b) => {
      let va: any = '', vb: any = '';
      switch (this.sortCol) {
        case 'matricule': va = this.norm(a.employeMatricule); vb = this.norm(b.employeMatricule); break;
        case 'nom':       va = this.norm(a.employeNom);       vb = this.norm(b.employeNom);       break;
        case 'prenom':    va = this.norm(a.employePrenom);    vb = this.norm(b.employePrenom);    break;
        case 'categorie': va = this.norm(this.labelCategorie(a.categorie)); vb = this.norm(this.labelCategorie(b.categorie)); break;
        case 'type':      va = this.norm(this.labelType(a.typeDemande));    vb = this.norm(this.labelType(b.typeDemande));    break;
        case 'statut':    va = this.norm(this.labelStatut(a.statut));       vb = this.norm(this.labelStatut(b.statut));       break;
        case 'dateDebut': va = parse(a.dateDebut); vb = parse(b.dateDebut); break;
        case 'dateFin':   va = parse(a.dateFin);   vb = parse(b.dateFin);   break;
        case 'dateCreation': default:
          va = parse(a.dateCreation); vb = parse(b.dateCreation);
      }
      const cmp = (va < vb ? -1 : va > vb ? 1 : 0);
      return this.sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }

  // --- Pagination ---
  get totalFiltered(): number { return this.filteredRows.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalFiltered / this.pageSize)); }
  get pagedRows(): DemandeListDTO[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.page = p; }
  prev(): void { this.goToPage(this.page - 1); }
  next(): void { this.goToPage(this.page + 1); }

  // --- Offcanvas (options + actions) ---
  typeOptionsView = Object.entries(TYPE_DEMANDE_LABELS)
    .map(([value, label]) => ({ value: value as TypeDemande, label }));
  statutOptionsView = Object.entries(STATUT_LABELS)
    .map(([value, label]) => ({ value: value as StatutDemande, label }));
  categorieOptionsView = [
    { value: 'CONGE_STANDARD'     as CategorieDemande, label: CATEGORIE_LABELS['CONGE_STANDARD']     || 'Congé standard' },
    { value: 'CONGE_EXCEPTIONNEL' as CategorieDemande, label: CATEGORIE_LABELS['CONGE_EXCEPTIONNEL'] || 'Congé exceptionnel' },
    { value: 'AUTORISATION'       as CategorieDemande, label: CATEGORIE_LABELS['AUTORISATION']       || 'Autorisation' },
    { value: 'ORDRE_MISSION'      as CategorieDemande, label: CATEGORIE_LABELS['ORDRE_MISSION']      || 'Ordre de mission' },
  ];

  resetFiltersUI(): void {
    this.uiFilterStatus = '';
    this.uiFilterType = '';
    this.uiFilterCategorie = '';
    this.uiSortBy = 'recent';
  }

  applyFilters(): void {
    this.hfStatut = this.uiFilterStatus;
    this.hfType = this.uiFilterType;
    this.hfCategorie = this.uiFilterCategorie;

    switch (this.uiSortBy) {
      case 'recent': this.sortCol = 'dateCreation'; this.sortDir = 'desc'; break;
      case 'ancien': this.sortCol = 'dateCreation'; this.sortDir = 'asc';  break;
      case 'nomAZ' : this.sortCol = 'nom';          this.sortDir = 'asc';  break;
      case 'nomZA' : this.sortCol = 'nom';          this.sortDir = 'desc'; break;
    }
    this.page = 1;
  }

  protected readonly Math = Math;
}