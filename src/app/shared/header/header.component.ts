import { Component, OnInit, HostListener, OnDestroy, Renderer2, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { DatePipe, NgClass, NgIf, TitleCasePipe, NgFor } from '@angular/common';
import { Employe } from '../../models/Employe.model';
import { AuthService } from '../../services/auth/auth.service';
import { Role } from '../../models/Role.model';
import { Subscription, filter } from 'rxjs';
import {WsNotificationService} from '../../services/WsNotification/ws-notification.service';
import {NotificationService, NotificationFilter, NotifStatut} from '../../services/notification/notification.service';
import {NotificationPayload} from '../../models/NotificationPayload';
import { EmployeService } from '../../services/employe/employe.service';

declare const bootstrap: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
    FormsModule,
    NgClass,
    NgIf,
    NgFor,
    TitleCasePipe,
    DatePipe,
    RouterLink,
    RouterLinkActive
  ],
  styleUrls: ['./header.component.css'],
  standalone: true
})
export class HeaderComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;
  isDashboardOpen = true;
  isNotificationDropdownOpen = false;
  isNotificationActionsOpen = false;
  isLanguageDropdownOpen = false;
  isThemeDropdownOpen = false;
  isUserDropdownOpen = false;
  isSearchDropdownOpen = false;
  isLeaveOpen = false;
  isRequestsOpen = false;
  private _wsStarted = false;

  issuper: boolean = false;

  searchQuery = '';
  currentRoute = '';
  currentTheme: string = 'light';
  currentUser?: Employe;
  userRole?: string;

  private userSubscription?: Subscription;
  private navSub?: Subscription;

  // Mock notifications (fallback)
  notifications = [
    { message: 'New message from Angela', time: 'Just now', read: false },
    { message: 'Project update available', time: '10 min ago', read: true },
    { message: 'Meeting scheduled at 2 PM', time: '1 hour ago', read: false }
  ];
  selectedNotifications: number[] = [];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private employeService: EmployeService,
    private ws: WsNotificationService,
    private notifApi: NotificationService,
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url.split('/').pop() || '';
    this.loadEstSuper();
    this.loadThemePreference();
    window.addEventListener('scroll', this.toggleBackToTop);

    if (this.authService.isAuthenticated()) {
      this.loadCurrentUser();
      this.bootstrapNotificationsLayer();
    }
    
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user || undefined;
      this.userRole = user?.role || undefined;
      // Refresh notifications when user changes
      if (user) {
        this.refreshNotifications();
      }
    });

    // Re-init Bootstrap on navigation
    this.navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.reinitBootstrapUI());
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.toggleBackToTop);
    this.userSubscription?.unsubscribe();
    this.navSub?.unsubscribe();
    try { this._subs.forEach(s => s.unsubscribe()); } catch {}
    try { this.ws.disconnect(); } catch {}
  }

  // ============================================================
  // ================== ENHANCED NOTIFICATIONS ==================
  // ============================================================

  private _subs: Subscription[] = [];
  notifs: NotificationPayload[] = [];
  unreadCount = 0;
  pageIndex = 0;
  pageSize = 10;
  totalPages = 1;
  
  // DRH-specific notification filters
  currentFilter: NotificationFilter = {};
  notificationStats = {
    total: 0,
    unread: 0,
    read: 0
  };

  // Initialize notifications layer
  private bootstrapNotificationsLayer(): void {
    if (this._wsStarted) return;
    this._wsStarted = true;

    this.refreshNotifications();
    this.refreshUnreadCount();
    this.loadNotificationStats();

    const token =
      (this.authService as any).getAccessToken?.() ||
      localStorage.getItem('access_token') ||
      '';

    this.ws.ensureConnected(token);

    const sub = this.ws.incoming$.subscribe(n => {
      this.ngZone.run(() => {
        this.handleIncomingNotification(n);
      });
    });
    this._subs.push(sub);
  }

  // Handle incoming real-time notification
  private handleIncomingNotification(n: NotificationPayload): void {
    // Prevent duplicates
    if (!this.notifs.some(x => x.id === n.id)) {
      this.notifs = [n, ...this.notifs];
      if (n.statut === 'NON_LU') {
        this.unreadCount++;
        this.notificationStats.unread++;
        this.notificationStats.total++;
      }
      this.cdr.detectChanges();
    }
  }

  // Enhanced notification refresh with filters
  private refreshNotifications(): void {
    if (this.userRole === 'DRH') {
      // DRH gets all notifications with enhanced filtering
      this.loadDrhNotifications();
    } else {
      // Other roles get standard notifications
      this.loadStandardNotifications();
    }
  }

  // Load standard notifications for non-DRH roles
  private loadStandardNotifications(): void {
    this.notifApi.list(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.notifs = page.content;
        this.totalPages = page.totalPages;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
      }
    });
  }

  // Load enhanced notifications for DRH role
  private loadDrhNotifications(): void {
    this.notifApi.listWithFilters(this.pageIndex, this.pageSize, this.currentFilter).subscribe({
      next: (page) => {
        this.notifs = page.content;
        this.totalPages = page.totalPages;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load DRH notifications:', err);
        // Fallback to standard notifications
        this.loadStandardNotifications();
      }
    });
  }

  // Load notification statistics
  private loadNotificationStats(): void {
    this.notifApi.getStats().subscribe({
      next: (stats) => {
        this.notificationStats = stats;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notification stats:', err);
      }
    });
  }

  // Filter notifications by category (DRH feature)
  filterByCategory(category: string): void {
    if (this.userRole === 'DRH') {
      this.currentFilter.category = category;
      this.pageIndex = 0;
      this.refreshNotifications();
    }
  }

  // Filter notifications by type (DRH feature)
  filterByType(type: string): void {
    if (this.userRole === 'DRH') {
      this.currentFilter.type = type;
      this.pageIndex = 0;
      this.refreshNotifications();
    }
  }

  // Clear all filters
  clearFilters(): void {
    this.currentFilter = {};
    this.pageIndex = 0;
    this.refreshNotifications();
  }

  // Get notifications requiring DRH attention
  loadAttentionNotifications(): void {
    if (this.userRole === 'DRH') {
      this.notifApi.getDrhAttentionNotifications(this.pageIndex, this.pageSize).subscribe({
        next: (page) => {
          this.notifs = page.content;
          this.totalPages = page.totalPages;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load attention notifications:', err);
        }
      });
    }
  }

  // Enhanced unread count with category filtering for DRH
  private refreshUnreadCount(): void {
    if (this.userRole === 'DRH' && this.currentFilter.category) {
      this.notifApi.unreadCount({ category: this.currentFilter.category }).subscribe({
        next: (count) => {
          this.unreadCount = count;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load filtered unread count:', err);
          this.loadDefaultUnreadCount();
        }
      });
    } else {
      this.loadDefaultUnreadCount();
    }
  }

  private loadDefaultUnreadCount(): void {
    this.notifApi.unreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load unread count:', err);
      }
    });
  }

  // Getter for unread notifications
  get unreadNotifs(): NotificationPayload[] {
    return (this.notifs ?? []).filter(n => n.statut === 'NON_LU');
  }

  // Getter for read notifications
  get readNotifs(): NotificationPayload[] {
    return (this.notifs ?? []).filter(n => n.statut === 'LU');
  }

  // Check if DRH has high priority notifications
  get hasHighPriorityNotifications(): boolean {
    if (this.userRole !== 'DRH') return false;
    return this.unreadNotifs.some(n => 
      n.type === 'DEMANDE_CREATED' && 
      n.categorie && 
      ['CONGE_EXCEPTIONNEL', 'ORDRE_MISSION'].includes(n.categorie)
    );
  }

  // ============================================================
  // ================== NOTIFICATION ACTIONS ====================
  // ============================================================

  // Mark single notification as read
  onMarkRead(n: NotificationPayload): void {
    if (n.statut === 'LU') return;

    // Optimistic UI update
    const before = n.statut;
    n.statut = 'LU';
    this.unreadCount = Math.max(0, this.unreadCount - 1);
    this.notificationStats.unread = Math.max(0, this.notificationStats.unread - 1);
    this.cdr.detectChanges();

    this.notifApi.markRead(n.id).subscribe({
      error: () => {
        // Rollback on error
        n.statut = before;
        this.unreadCount++;
        this.notificationStats.unread++;
        this.cdr.detectChanges();
      }
    });
  }

  // Mark all notifications as read
  onMarkAllRead(): void {
    if (this.userRole === 'DRH' && this.currentFilter.category) {
      // Mark all with current filter
      this.notifApi.markAllRead({ category: this.currentFilter.category }).subscribe({
        next: (updatedCount) => {
          this.notifs = this.notifs.map(n => ({ ...n, statut: 'LU' as const }));
          this.unreadCount = Math.max(0, this.unreadCount - updatedCount);
          this.notificationStats.unread = Math.max(0, this.notificationStats.unread - updatedCount);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[notif] markAllRead failed', err);
        }
      });
    } else {
      // Mark all without filter
      this.notifApi.markAllRead().subscribe({
        next: (updatedCount) => {
          this.notifs = this.notifs.map(n => ({ ...n, statut: 'LU' as const }));
          this.unreadCount = 0;
          this.notificationStats.unread = 0;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[notif] markAllRead failed', err);
        }
      });
    }
  }

  // Clear all notifications
  onClearAll(): void {
    if (this.userRole === 'DRH' && this.currentFilter.category) {
      // Delete all with current filter
      this.notifApi.deleteAll({ category: this.currentFilter.category }).subscribe({
        next: (deletedCount) => {
          this.notifs = [];
          this.unreadCount = 0;
          this.notificationStats.total = 0;
          this.notificationStats.unread = 0;
          this.notificationStats.read = 0;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[notif] deleteAll failed', err);
        }
      });
    } else {
      // Delete all without filter
      this.notifApi.deleteAll().subscribe({
        next: (deletedCount) => {
          this.notifs = [];
          this.unreadCount = 0;
          this.notificationStats.total = 0;
          this.notificationStats.unread = 0;
          this.notificationStats.read = 0;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[notif] deleteAll failed', err);
        }
      });
    }
  }

  // Open notification (navigate to relevant page)
  openNotif(n: NotificationPayload): void {
    if (!n.demandeId) return;

    // Determine target route based on user role and notification type
    let target: string | null = null;
    
    switch (this.userRole) {
      case 'CHEF':
        target = '/chef/demandes';
        break;
      case 'DRH':
        target = '/drh/demandes';
        break;
      case 'EMPLOYE':
        target = '/demandes-et-solde';
        break;
      default:
        target = null;
    }

    if (!target) return;

    // Mark as read if unread
    if (n.statut === 'NON_LU') {
      this.onMarkRead(n);
    }

    // Close dropdown
    this.isNotificationDropdownOpen = false;

    // Navigate with query param
    this.router.navigate([target], { 
      queryParams: { 
        open: n.demandeId,
        notification: n.id 
      } 
    });
  }

  // Delete single notification
  onDelete(n: NotificationPayload): void {
    this.notifApi.deleteOne(n.id).subscribe({
      next: () => {
        this.notifs = this.notifs.filter(x => x.id !== n.id);
        if (n.statut === 'NON_LU') {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.notificationStats.unread = Math.max(0, this.notificationStats.unread - 1);
        }
        this.notificationStats.total = Math.max(0, this.notificationStats.total - 1);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete notification:', err);
      }
    });
  }

  // Load more notifications (pagination)
  loadMore(): void {
    if (this.pageIndex + 1 >= this.totalPages) return;
    
    const next = this.pageIndex + 1;
    const apiCall = this.userRole === 'DRH' 
      ? this.notifApi.listWithFilters(next, this.pageSize, this.currentFilter)
      : this.notifApi.list(next, this.pageSize);

    apiCall.subscribe({
      next: (page) => {
        this.pageIndex = next;
        this.notifs = [...this.notifs, ...page.content];
        this.totalPages = page.totalPages;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load more notifications:', err);
      }
    });
  }

  // ============================================================
  // ================== NOTIFICATION DISPLAY ====================
  // ============================================================

  // Convert to JS Date
  toJsDate(v: string | Date): Date {
    if (v instanceof Date) return v;
    return new Date(v);
  }

  // Track by function for ngFor
  trackByNotifId = (_: number, n: { id: number | string }) => n.id;

  // Choose display date (validation date for validated/refused, creation date otherwise)
  displayDate(n: NotificationPayload): Date {
    const prefer =
      (n.type === 'DEMANDE_VALIDATED' || n.type === 'DEMANDE_REFUSED')
        ? (n.dateValidation || n.dateCreation)
        : n.dateCreation;
    return new Date(prefer);
  }

  // Get human-readable demand type label
  private labelTypeDemande(code?: string | null): string {
    switch (code) {
      case 'CONGE_ANNUEL': return 'congé annuel';
      case 'CONGE_SANS_SOLDE': return 'congé sans solde';
      case 'CONGE_REPOS_COMPENSATEUR': return 'repos compensateur';
      case 'AUTORISATION_SORTIE': return "autorisation d'absence";
      default:
        return code ? code.replaceAll('_',' ').toLowerCase() : 'demande';
    }
  }

  // Format notification subject
  prettySubject(n: NotificationPayload): string {
    switch (n.type) {
      case 'DEMANDE_VALIDATED': return 'Demande validée';
      case 'DEMANDE_REFUSED':   return 'Demande refusée';
      case 'DEMANDE_CREATED':   return 'Nouvelle demande';
      default:                  return 'Mise à jour de votre demande';
    }
  }

  // Format notification message
  prettyMessage(n: NotificationPayload): string {
    // Use backend message if available
    if (n.message && n.message.trim()) return n.message.trim();

    const label = this.labelTypeDemande(n.typeDemande);
    const dDebut = n.periodeDebut ? new Date(n.periodeDebut) : null;
    const dFin   = n.periodeFin   ? new Date(n.periodeFin)   : null;

    const fmtDate = (d: Date) => d.toLocaleDateString('fr-FR');
    const fmtTime = (s?: string|null) => s ?? '';

    switch (n.type) {
      case 'DEMANDE_VALIDATED':
        if (n.categorie?.startsWith('CONGE') && dDebut) {
          return `Votre demande ${label} a été validée pour le ${fmtDate(dDebut)}.`;
        }
        if (n.categorie === 'AUTORISATION' && dDebut) {
          return `Votre ${label} a été validée pour le ${fmtDate(dDebut)} de ${fmtTime(n.heureDebut)} à ${fmtTime(n.heureFin)}.`;
        }
        if (n.categorie === 'ORDRE_MISSION' && dDebut && dFin) {
          return `Votre demande de mission a été validée du ${fmtDate(dDebut)} au ${fmtDate(dFin)}.`;
        }
        return `Votre demande ${label} a été validée.`;

      case 'DEMANDE_REFUSED':
        return `Votre demande ${label} a été refusée.`;

      case 'DEMANDE_CREATED':
        if (n.categorie?.startsWith('CONGE') && dDebut) {
          return `Votre demande ${label} a été créée pour le ${fmtDate(dDebut)}.`;
        }
        return `Votre demande ${label} a été créée.`;

      default:
        return `Mise à jour de votre demande ${label}.`;
    }
  }

  // Check if there are new notifications
  get hasNew(): boolean {
    return this.notifs?.some(n => n.statut === 'NON_LU') ?? false;
  }

  // Check if there are read notifications
  get hasRead(): boolean {
    return this.notifs?.some(n => n.statut === 'LU') ?? false;
  }

  // ============================================================
  // ================== EXISTING METHODS ========================
  // ============================================================

  // [All your existing methods remain unchanged below...]
  private reinitBootstrapUI(): void {
    this.ngZone.runOutsideAngular(() => {
      document.querySelectorAll('[data-bs-toggle="dropdown"]')
        .forEach((el: any) => bootstrap.Dropdown.getOrCreateInstance(el));
      document.querySelectorAll('.offcanvas')
        .forEach((el: any) => bootstrap.Offcanvas.getOrCreateInstance(el));
      document.querySelectorAll('.collapse')
        .forEach((el: any) => bootstrap.Collapse.getOrCreateInstance(el, { toggle: false }));
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
        .forEach((el: any) => bootstrap.Tooltip.getOrCreateInstance(el));
    });
    this.ngZone.run(() => this.cdr.detectChanges());
  }

  toggleTheme(theme: string): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }

  loadThemePreference(): void {
    const theme = localStorage.getItem('theme') || 'light';
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  toggleMenu(): void {
    const html = document.documentElement;
    const currentSize = html.getAttribute('data-sidebar-size');
    html.setAttribute('data-sidebar-size', currentSize === 'lg' ? 'sm' : 'lg');
    this.closeOtherDropdowns('sidebar');
  }

  closeSidebar(): void { document.documentElement.setAttribute('data-sidebar-size', 'lg'); }

  toggleDashboard($event: MouseEvent): void { $event.preventDefault(); this.isDashboardOpen = !this.isDashboardOpen; }
  toggleNotificationDropdown(): void { this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen; this.closeOtherDropdowns('notification'); }
  toggleNotificationActions(): void { this.isNotificationActionsOpen = !this.isNotificationActionsOpen; }
  toggleLanguageDropdown(): void { this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen; this.closeOtherDropdowns('language'); }
  toggleThemeDropdown(): void { this.isThemeDropdownOpen = !this.isThemeDropdownOpen; this.closeOtherDropdowns('theme'); }
  toggleUserDropdown(): void { this.isUserDropdownOpen = !this.isUserDropdownOpen; this.closeOtherDropdowns('user'); }

  clearSearch(): void { this.searchQuery = ''; this.isSearchDropdownOpen = false; }
  selectLanguage(lang: string, title: string): void { console.log(`Selected language: ${title}`); this.isLanguageDropdownOpen = false; }
  toggleFullscreen(): void {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  }

  markAsRead(i: number): void { this.notifications[i].read = true; this.isNotificationDropdownOpen = false; this.cdr.detectChanges(); }
  markAllAsRead(): void { this.notifications.forEach(n => n.read = true); this.isNotificationActionsOpen = false; this.cdr.detectChanges(); }
  clearAllNotifications(): void { this.notifications = []; this.isNotificationActionsOpen = false; this.isNotificationDropdownOpen = false; this.cdr.detectChanges(); }
  archiveAllNotifications(): void { this.notifications = this.notifications.filter(n => n.read); this.isNotificationActionsOpen = false; this.isNotificationDropdownOpen = false; this.cdr.detectChanges(); }
  removeSelectedNotifications(): void { this.notifications = this.notifications.filter((_, i) => !this.selectedNotifications.includes(i)); this.selectedNotifications = []; this.isNotificationActionsOpen = false; this.cdr.detectChanges(); }
  get unreadNotifications(): number { return this.notifications.filter(n => !n.read).length; }

  private closeOtherDropdowns(except: string): void {
    if (except !== 'notification') this.isNotificationDropdownOpen = false;
    if (except !== 'language') this.isLanguageDropdownOpen = false;
    if (except !== 'theme') this.isThemeDropdownOpen = false;
    if (except !== 'user') this.isUserDropdownOpen = false;
    if (except !== 'search') this.isSearchDropdownOpen = false;
    if (except !== 'sidebar') this.isSidebarOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar-head-dropdown') &&
      !target.closest('.app-search') &&
      !target.closest('.vertical-menu-btn')) {
      this.isNotificationDropdownOpen = false;
      this.isLanguageDropdownOpen = false;
      this.isThemeDropdownOpen = false;
      this.isUserDropdownOpen = false;
      this.isSearchDropdownOpen = false;
      this.isSidebarOpen = false;
      this.cdr.detectChanges();
    }
  }

  toggleBackToTop = () => {
    const btn = document.getElementById('back-to-top');
    if (btn) btn.style.display = window.scrollY > 200 ? 'block' : 'none';
  }

  scrollToTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  logout(): void {
    console.log('[HEADER] Logging out...');
    this.authService.logout();
  }

  get userRoleLabel(): string {
    switch (this.userRole) {
      case 'DRH': return 'HR Manager';
      case 'CHEF': return 'Manager';
      case 'CONCIERGE': return 'Concierge';
      case 'EMPLOYE': return 'Employee';
      default: return '';
    }
  }

  protected readonly Role = Role;

  activeTab = 'demandes';
  demandes = [
    { etat: 'Demande de congé', statut: 'Validé' },
    { etat: 'Autorisation', statut: 'Refusé' },
    { etat: 'Ordre de mission', statut: 'En cours' }
  ];

  private loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.ngZone.run(() => {
          this.currentUser = user;
          this.userRole = user.role;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.currentUser = undefined;
          this.userRole = undefined;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadEstSuper(){
    this.employeService.estSuper().subscribe(
      req => {
        console.log("Super DRH status:", req);
        this.issuper = req;
      },
      error => {
        console.log(error);
        console.log("Employé n'est pas super DRH");
      }
    );
  }
}