import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Ajout de DatePipe
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Demande } from '../models/Demande.model';
import { DemandeService } from '../services/demande/demande.service';
import { AuthService } from '../services/auth/auth.service';
import { Observable } from 'rxjs'; 

// Interfaces simplifiées
interface User {
  service: string | null;
  matricule?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    DatePipe 
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit {
  calendarOptions!: CalendarOptions;
  demandes: Demande[] = [];
  filteredDemandes: Demande[] = [];
  selectedEvent: any = null;
  showEventModal: boolean = false;
  loading: boolean = true;
  
  // Les valeurs doivent correspondre aux filtres du HTML (en minuscules pour la comparaison)
  selectedStatus: string = 'all'; 
  selectedType: string = 'all';
  selectedDateRange: string = 'all';
  searchQuery: string = '';
  currentView: string = 'dayGridMonth';
  
  dateRanges = [
    { value: 'all', label: 'Toutes les périodes' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois-ci' }
  ];

  @Input() serviceName: string | null = null; 
  
  private currentUserServiceName: string | null = null; 

  constructor(
    private demandeService: DemandeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.serviceName) {
      this.authService.getCurrentUser().subscribe((user: User | null) => {
        if (user && user.service) {
          this.currentUserServiceName = user.service;
        }
        this.loadDemandes();
      });
    } else {
      this.loadDemandes();
    }
  }

  /**
   * Détermine la date/heure de début réelle en fonction du type de demande (Enum Java).
   */
  private getEventStartDate(d: Demande): string | Date {
    const type = d.typeDemande; 
    
    if (type && type.startsWith('CONGE_')) {
      return d.congeDateDebut || d.dateCreation || new Date();
    }
    if (type && type.startsWith('AUTORISATION_')) {
      return d.autoDateDebut || d.dateCreation || new Date();
    }
    return d.dateCreation || new Date();
  }

  /**
   * Détermine la date/heure de fin réelle en fonction du type de demande (Enum Java).
   */
  private getEventEndDate(d: Demande): string | Date | undefined {
    const type = d.typeDemande;
    let endDate: string | undefined;

    if (type && type.startsWith('CONGE_')) {
      endDate = d.congeDateFin;
    }
    
    if (type && type.startsWith('AUTORISATION_')) {
      endDate = d.autoDateFin;
    }

    if (endDate) {
      const date = new Date(endDate);
      return new Date(date.getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    }
    return undefined;
  }

  loadDemandes(): void {
    this.loading = true;

    const serviceToFilter = this.serviceName || this.currentUserServiceName;
    let observable: Observable<Demande[]>;

    if (serviceToFilter && serviceToFilter !== 'all') {
      observable = this.demandeService.getDemandesByService(serviceToFilter); 
    } else {
      observable = this.demandeService.getAllDemandes();
    }

    observable.subscribe({
      next: (demandes: Demande[]) => {
        this.demandes = demandes;
        this.filteredDemandes = [...demandes];
        this.initializeCalendar(demandes);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => { 
        console.error('Erreur lors du chargement des demandes :', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  initializeCalendar(demandes: Demande[]): void {
    const events = demandes.map(d => {
      const startDate = this.getEventStartDate(d);
      const endDate = this.getEventEndDate(d);

      return {
        id: d.id?.toString(),
        title: `${d.typeDemande || 'Sans type'} - ${d.employe?.matricule || 'Employé Inconnu'}`,
        start: startDate,
        end: endDate,
        allDay: !!endDate, 
        extendedProps: {
          status: d.statut,
          type: d.typeDemande, 
          employe: d.employe,
          dateCreation: d.dateCreation,
        },
        className: `fc-event-status-${this.getStatusClass(d.statut || 'EN_COURS')}`
      }
    });

    this.calendarOptions = {
      initialView: this.currentView,
      plugins: [dayGridPlugin, interactionPlugin, listPlugin],
      events: events,
      selectable: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek'
      },
      eventClick: this.handleEventClick.bind(this),
      eventClassNames: (arg) => ['fc-event-custom'],
      dayMaxEvents: 3,
      height: 'auto',
      views: {
        listWeek: {
          eventLimit: 10
        }
      }
    };
  }

  handleEventClick(clickInfo: EventClickArg): void {
    this.selectedEvent = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      status: clickInfo.event.extendedProps['status'],
      type: clickInfo.event.extendedProps['type'],
      employe: clickInfo.event.extendedProps['employe'],
      dateCreation: clickInfo.event.extendedProps['dateCreation'],
    };
    this.showEventModal = true;
    this.cdr.detectChanges();
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedEvent = null;
    this.cdr.detectChanges();
  }

  /**
   * Nettoie le statut de l'enum Java (ex: EN_COURS) en format CSS (ex: encours).
   */
  getStatusClass(status: string): string {
    if (!status) return 'pending';
    return status.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
  }

  /**
   * Applique tous les filtres actifs (Statut, Type, Plage de dates, Recherche).
   */
  filterEvents(): void {
    let filtered = [...this.demandes];
    const selectedStatusClean = this.selectedStatus.toLowerCase();
    const selectedTypeClean = this.selectedType.toLowerCase();

    // 1. Filtre par statut
    if (this.selectedStatus !== 'all') {
      const selected = selectedStatusClean.replace(/\s+/g, '').replace(/_/g, '');
      filtered = filtered.filter(demande => {
          const currentStatus = this.getStatusClass(demande.statut || '');
          return currentStatus === selected;
      });
    }

    // 2. Filtre par type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(demande => {
          return demande.typeDemande?.toLowerCase().replace(/\s+/g, '').replace(/_/g, '') === selectedTypeClean.replace(/\s+/g, '').replace(/_/g, '');
      });
    }

    // 3. Filtre par plage de dates
    if (this.selectedDateRange !== 'all') {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (this.selectedDateRange) {
        case 'today':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = new Date(0);
          endDate = new Date();
      }

      filtered = filtered.filter(demande => {
        const dateDebutString = this.getEventStartDate(demande);
        if (!dateDebutString) return false;
        const dateDebut = new Date(dateDebutString);
        return dateDebut >= startDate && dateDebut <= endDate;
      });
    }

    // 4. Filtre par recherche de matricule
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(demande => 
        demande.employe?.matricule?.toLowerCase().includes(query)
      );
    }

    this.filteredDemandes = filtered;
    this.initializeCalendar(filtered);
    this.cdr.detectChanges();
  }

  changeView(view: string): void {
    this.currentView = view;
    if (this.calendarOptions) {
      this.initializeCalendar(this.filteredDemandes); 
    }
    this.cdr.detectChanges();
  }

  handleSearch(): void {
    // Appelle le filtre combiné pour mettre à jour la recherche instantanément
    this.filterEvents(); 
  }

  createNewDemande(): void {
    console.log('Création d’une nouvelle demande');
  }
}