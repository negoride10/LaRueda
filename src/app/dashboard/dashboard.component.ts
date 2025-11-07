import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { ContactService, Contact, ContactsResponse } from '../services/contact.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userData: any;

  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalContacts: number = 0;
  perPage: number = 20;
  isLoadingContacts: boolean = false;

  searchNombre: string = '';
  searchCelular: string = '';
  searchPlaca: string = '';

  showCreateModal: boolean = false;
  newContact: Contact = {
    nombre: '',
    celular: '',
    placa: ''
  };
  isCreating: boolean = false;
  createMessage: string = '';
  createError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.userData = this.authService.getCurrentUser();

    // Si no hay usuario autenticado, redirigir al login
    if (!this.userData) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar contactos
    this.loadContacts();
  }

  loadContacts(page: number = 1): void {
    this.isLoadingContacts = true;
    this.contactService.getContacts(page).subscribe({
      next: (response: ContactsResponse) => {
        this.contacts = response.data || [];
        this.filteredContacts = [...this.contacts];
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.totalContacts = response.total;
        this.perPage = response.per_page;
        this.isLoadingContacts = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error cargando contactos', error);
        this.isLoadingContacts = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredContacts = this.contacts.filter(contact => {
      const matchNombre = !this.searchNombre ||
        contact.nombre?.toLowerCase().includes(this.searchNombre.toLowerCase());
      const matchCelular = !this.searchCelular ||
        contact.celular?.includes(this.searchCelular);
      const matchPlaca = !this.searchPlaca ||
        contact.placa?.toLowerCase().includes(this.searchPlaca.toLowerCase());

      return matchNombre && matchCelular && matchPlaca;
    });
  }

  clearFilters(): void {
    this.searchNombre = '';
    this.searchCelular = '';
    this.searchPlaca = '';
    this.applyFilters();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newContact = { nombre: '', celular: '', placa: '' };
    this.createMessage = '';
    this.createError = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newContact = { nombre: '', celular: '', placa: '' };
    this.createMessage = '';
    this.createError = '';
  }

  createContact(): void {
    // Validación básica
    if (!this.newContact.nombre || !this.newContact.celular) {
      this.createError = 'Nombre y Celular son obligatorios';
      return;
    }

    this.isCreating = true;
    this.createError = '';
    this.createMessage = '';

    this.contactService.createContact(this.newContact).subscribe({
      next: (response) => {
        console.log('Contacto creado', response);
        this.createMessage = 'Contacto creado exitosamente';
        this.isCreating = false;

        // Recargar la lista después de 1 segundo
        setTimeout(() => {
          this.loadContacts(this.currentPage);
          this.closeCreateModal();
        }, 1000);
      },
      error: (error) => {
        console.error('Error creando contacto', error);
        this.createError = 'Error al crear el contacto. Intenta nuevamente.';
        this.isCreating = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadContacts(page);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
