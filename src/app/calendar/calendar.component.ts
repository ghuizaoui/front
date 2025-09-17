// calendar.component.ts
import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Demande } from '../models/Demande.model';
import { DemandeService } from '../services/demande/demande.service';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule
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
  
  // Filter options
  selectedStatus: string = 'all';
  selectedType: string = 'all';
  selectedDateRange: string = 'all';
  searchQuery: string = '';
  currentView: string = 'dayGridMonth';
  
  // Date ranges
  dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  constructor(
    private demandeService: DemandeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes: Demande[]) => {
        this.demandes = demandes;
        this.filteredDemandes = [...demandes];
        this.initializeCalendar(demandes);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading demandes:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initializeCalendar(demandes: Demande[]): void {
    const events = demandes.map(d => ({
      id: d.id?.toString(),
      title: `${d.typeDemande || 'No Type'}`,
      start: d.dateCreation || new Date(),
      extendedProps: {
        status: d.statut,
        type: d.typeDemande,
        employe: d.employe,
        dateCreation: d.dateCreation,
      },
      className: `fc-event-status-${d.statut?.toLowerCase().replace(/\s+/g, '') || 'pending'}`
    }));

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

  getStatusClass(status: string): string {
    return status?.toLowerCase().replace(/\s+/g, '') || 'pending';
  }

  getDemandesByStatus(status: string): Demande[] {
    return this.filteredDemandes.filter(demande => 
      status === 'all' ? true : demande.statut?.toLowerCase() === status.toLowerCase()
    );
  }

  filterEvents(): void {
    let filtered = [...this.demandes];

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(demande => 
        demande.statut?.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }

    // Type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(demande => 
        demande.typeDemande?.toLowerCase() === this.selectedType.toLowerCase()
      );
    }

    // Date range filter
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
        if (!demande.dateCreation) return false;
        const dateCreation = new Date(demande.dateCreation);
        return dateCreation >= startDate && dateCreation <= endDate;
      });
    }

    // Search filter
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
      this.calendarOptions.initialView = view;
      this.initializeCalendar(this.filteredDemandes);
    }
    this.cdr.detectChanges();
  }

  handleSearch(): void {
    this.filterEvents();
  }

  // Method to use your specific APIs
  filterByEmployeAndStatut(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const matricule = user.matricule; // Adjust this based on your user object structure
        
        if (matricule && this.selectedStatus !== 'all') {
          this.loading = true;
          this.demandeService.findByEmployeAndStatut(matricule, this.selectedStatus).subscribe({
            next: (demandes: Demande[]) => {
              this.filteredDemandes = demandes;
              this.initializeCalendar(demandes);
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error filtering by employe and status:', error);
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.filterEvents();
        }
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.filterEvents();
      }
    });
  }

  filterByTypeDemande(): void {
    if (this.selectedType !== 'all') {
      this.loading = true;
      this.demandeService.findByTypeDemande(this.selectedType).subscribe({
        next: (demandes: Demande[]) => {
          console.log("load by type demande ",demandes)
          this.filteredDemandes = demandes;
          this.initializeCalendar(demandes);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error filtering by type:', error);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.filterEvents();
    }
  }

  filterByDateRange(): void {
    if (this.selectedDateRange !== 'all') {
      const today = new Date();
      let start: string;
      let end: string;

      switch (this.selectedDateRange) {
        case 'today':
          start = today.toISOString().split('T')[0];
          end = today.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          start = weekStart.toISOString().split('T')[0];
          end = weekEnd.toISOString().split('T')[0];
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          start = monthStart.toISOString().split('T')[0];
          end = monthEnd.toISOString().split('T')[0];
          break;
        default:
          return;
      }

      this.loading = true;
      this.demandeService.findByDateCreationBetween(start, end).subscribe({
        next: (demandes: Demande[]) => {
          this.filteredDemandes = demandes;
          this.initializeCalendar(demandes);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error filtering by date range:', error);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.filterEvents();
    }
  }

  createNewDemande(): void {
    // Implement navigation or modal opening for new demande creation
    console.log('Creating new demande');
  }
}