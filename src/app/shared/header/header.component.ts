import { Component, OnInit, HostListener, OnDestroy, Renderer2, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { DatePipe, NgClass, NgIf, TitleCasePipe, NgFor } from '@angular/common';
import { Employe } from '../../models/Employe.model';
import { AuthService } from '../../services/auth/auth.service';
import { Role } from '../../models/Role.model';
import { Subscription, filter } from 'rxjs';
import {WsNotificationService} from '../../services/WsNotification/ws-notification.service';
import {NotificationService} from '../../services/notification/notification.service';
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

  issuper:boolean=false;

  searchQuery = '';
  currentRoute = '';
  currentTheme: string = 'light';
  currentUser?: Employe;
  userRole?: string;

  private userSubscription?: Subscription;
  private navSub?: Subscription;

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
    

    // =========================
    // AJOUTS: services notif/WS
    // =========================
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

      // =========================
      // AJOUT: démarrer notifications
      // =========================
      this.bootstrapNotificationsLayer();
    }
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user || undefined;
      this.userRole = user?.role || undefined;
    });

    // 👉 Ré-init Bootstrap à chaque navigation (dropdown, offcanvas, tooltip…)
    this.navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.reinitBootstrapUI());
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.toggleBackToTop);
    this.userSubscription?.unsubscribe();
    this.navSub?.unsubscribe();

    // =========================
    // AJOUT: cleanup notif/WS
    // =========================
    try { this._subs.forEach(s => s.unsubscribe()); } catch {}
    try { this.ws.disconnect(); } catch {}
  }

  // --- Ré-init Bootstrap sur DOM actuel ---
  private reinitBootstrapUI(): void {
    this.ngZone.runOutsideAngular(() => {
      // Dropdowns
      document.querySelectorAll('[data-bs-toggle="dropdown"]')
        .forEach((el: any) => bootstrap.Dropdown.getOrCreateInstance(el));
      // Offcanvas
      document.querySelectorAll('.offcanvas')
        .forEach((el: any) => bootstrap.Offcanvas.getOrCreateInstance(el));
      // Collapse (menus latéraux)
      document.querySelectorAll('.collapse')
        .forEach((el: any) => bootstrap.Collapse.getOrCreateInstance(el, { toggle: false }));
      // Tooltips (si utilisés)
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
        .forEach((el: any) => bootstrap.Tooltip.getOrCreateInstance(el));
    });
    // Retour zone Angular → tick
    this.ngZone.run(() => this.cdr.detectChanges());
  }

  // ---------- Thème ----------
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

  // ---------- Sidebar ----------
  toggleMenu(): void {
    const html = document.documentElement;
    const currentSize = html.getAttribute('data-sidebar-size');
    html.setAttribute('data-sidebar-size', currentSize === 'lg' ? 'sm' : 'lg');
    this.closeOtherDropdowns('sidebar');
  }
  closeSidebar(): void { document.documentElement.setAttribute('data-sidebar-size', 'lg'); }

  // ---------- Dropdowns “template” ----------
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

  // ---------- Notifications ----------
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

  // --- Utilisateur courant ---
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

  // ============================================================
  // ================== AJOUTS : Notifications ==================
  // ============================================================

  // État notifications (REST)
  private _subs: Subscription[] = [];
  notifs: import('../../models/NotificationPayload').NotificationPayload[] = [];
  unreadCount = 0;
  pageIndex = 0;
  pageSize = 10;
  totalPages = 1;

  // Lancer la couche notif (appelé dans ngOnInit si connecté)
  private bootstrapNotificationsLayer(): void {
    if (this._wsStarted) return;
    this._wsStarted = true;

    this.refreshList();
    this.refreshUnreadCount();

    const token =
      (this.authService as any).getAccessToken?.() ||
      localStorage.getItem('access_token') ||
      '';

    this.ws.ensureConnected(token);

    const sub = this.ws.incoming$.subscribe(n => {
      this.ngZone.run(() => {
        // ✅ dédup : on n’ajoute pas si un notif avec le même id existe
        if (!this.notifs.some(x => x.id === n.id)) {
          this.notifs = [n, ...this.notifs];
          if (n.statut === 'NON_LU') this.unreadCount++;
        }
        this.cdr.detectChanges();
      });
    });
    this._subs.push(sub);
  }
  get unreadNotifs() {
    return (this.notifs ?? []).filter(n => n.statut === 'NON_LU');
  }
  get readNotifs() {
    return (this.notifs ?? []).filter(n => n.statut === 'LU');
  }

  // --- Dates : convertit les chaînes ISO normalisées en Date
  toJsDate(v: string | Date): Date {
    if (v instanceof Date) return v;
    return new Date(v); // v déjà normalisé côté WS (Z + ms)
  }

  // --- Texte FR : message de secours si back ne fournit rien


  private humanizeDemande(n: NotificationPayload): string {
    // ex: "CONGE_SANS_SOLDE" -> "congé sans solde"
    const t = (n.typeDemande || '').toLowerCase().replace(/_/g, ' ');
    if (t) return `de ${t}`;
    const c = (n.categorie || '').toLowerCase().replace(/_/g, ' ');
    return c ? `(${c})` : '';
  }

  trackByNotifId = (_: number, n: { id: number | string }) => n.id;

// --- Texte FR de secours si le back n’envoie pas déjà un message propre ---

  // Choisit la date à afficher (validation si VALIDATED/REFUSED, sinon création)
  displayDate(n: NotificationPayload): Date {
    const prefer =
      (n.type === 'DEMANDE_VALIDATED' || n.type === 'DEMANDE_REFUSED')
        ? (n.dateValidation || n.dateCreation)
        : n.dateCreation;
    return new Date(prefer);
  }

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

  prettySubject(n: NotificationPayload): string {
    switch (n.type) {
      case 'DEMANDE_VALIDATED': return 'Demande validée';
      case 'DEMANDE_REFUSED':   return 'Demande refusée';
      case 'DEMANDE_CREATED':   return 'Nouvelle demande';
      default:                  return 'Mise à jour de votre demande';
    }
  }

  prettyMessage(n: NotificationPayload): string {
    // si le back a déjà normalisé le message, on le garde
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
        return `Votre demande ${label} a été refusée.`; // (motif livré dans n.message par le back si dispo)

      case 'DEMANDE_CREATED':
        if (n.categorie?.startsWith('CONGE') && dDebut) {
          return `Votre demande ${label} a été créée pour le ${fmtDate(dDebut)}.`;
        }
        return `Votre demande ${label} a été créée.`;

      default:
        return `Mise à jour de votre demande ${label}.`;
    }
  }

  private refreshList(statut?: import('../../services/notification/notification.service').NotifStatut): void {
    this.notifs = [];
    this.notifApi.list(this.pageIndex, this.pageSize, statut).subscribe(page => {
      this.notifs = page.content;
      this.totalPages = page.totalPages;
      this.cdr.detectChanges();
    });
  }

  private refreshUnreadCount(): void {
    this.notifApi.unreadCount().subscribe(c => {
      this.unreadCount = c;
      this.cdr.detectChanges();
    });
  }

  // Helpers (pour template : titres "New" / "Read Before")
  get hasNew(): boolean {
    return this.notifs?.some(n => n.statut === 'NON_LU') ?? false;
  }
  get hasRead(): boolean {
    return this.notifs?.some(n => n.statut === 'LU') ?? false;
  }

  // Actions REST
  onMarkRead(n: import('../../models/NotificationPayload').NotificationPayload): void {
    if (n.statut === 'LU') return;

    // Optimistic UI
    const before = n.statut;
    n.statut = 'LU';
    this.unreadCount = Math.max(0, this.unreadCount - 1);
    this.cdr.detectChanges();

    this.notifApi.markRead(n.id).subscribe({
      error: () => { // rollback si échec
        n.statut = before;
        this.unreadCount++;
        this.cdr.detectChanges();
      }
    });
  }


  onMarkAllRead(): void {
    this.notifApi.markAllRead().subscribe({
      next: () => {
        this.notifs = this.notifs.map(n => ({ ...n, statut: 'LU' }));
        this.unreadCount = 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[notif] markAllRead failed', err);
        // TODO: toast/alert utilisateur
      }
    });
  }

  onClearAll(): void {
    this.notifApi.deleteAll().subscribe({
      next: () => {
        this.notifs = [];
        this.unreadCount = 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[notif] deleteAll failed', err);
        // TODO: toast/alert
      }
    });
  }
  openNotif(n: import('../../models/NotificationPayload').NotificationPayload): void {
    if (n.type !== 'DEMANDE_CREATED' || !n.demandeId) return;

    // rôle courant -> route cible
    let target: string | null = null;
    if (this.userRole === 'CHEF') target = '/chef/demandes';
    else if (this.userRole === 'DRH') target = '/drh/demandes';
    else target = null;

    if (!target) return;

    // marque lue (optimiste)
    if (n.statut === 'NON_LU') this.onMarkRead(n);

    // ferme le menu
    this.isNotificationDropdownOpen = false;

    // navigate avec query param `open`
    this.router.navigate([target], { queryParams: { open: n.demandeId } });
  }

  onDelete(n: import('../../models/NotificationPayload').NotificationPayload): void {
    this.notifApi.deleteOne(n.id).subscribe(() => {
      this.notifs = this.notifs.filter(x => x.id !== n.id);
      if (n.statut === 'NON_LU') this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.cdr.detectChanges();
    });
  }

  // Pagination "Voir plus"
  loadMore(): void {
    if (this.pageIndex + 1 >= this.totalPages) return;
    const next = this.pageIndex + 1;
    this.notifApi.list(next, this.pageSize).subscribe(page => {
      this.pageIndex = next;
      this.notifs = [...this.notifs, ...page.content];
      this.totalPages = page.totalPages;
      this.cdr.detectChanges();
    });
  }


  // check the employ is super drh or not 
  loadEstSuper(){
    this.employeService.estSuper().subscribe(
      req=>{
        console.log("//////////////////////////////////////"+req)
        this.issuper= req

      },
      error=>{
        console.log(error);
        console.log("employe est  ne pas super drh ")

      }
    )
  }
}
