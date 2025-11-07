import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  id?: number;
  nombre: string;
  celular: string;
  placa?: string;
}

export interface ContactsResponse {
  current_page: number;
  data: Contact[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://api.larueda.com.co/api/testingreso/contacts';

  constructor(private http: HttpClient) {}

  getContacts(page: number = 1): Observable<ContactsResponse> {
    return this.http.get<ContactsResponse>(`${this.apiUrl}?page=${page}`);
  }

  createContact(contact: Contact): Observable<any> {
    // Enviar los datos directamente sin wrapper "rows"
    return this.http.post(this.apiUrl, contact);
  }

  createContactsBulk(contacts: Contact[]): Observable<any> {
    // Para carga masiva, enviar array directo
    return this.http.post(this.apiUrl, contacts);
  }
}
