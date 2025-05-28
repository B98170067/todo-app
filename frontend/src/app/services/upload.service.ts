import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) { }

  uploadFiles(todoId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    return this.http.post(`${this.baseUrl}/${todoId}/upload-multiple`, formData);
  }

  getAttachments(todoId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/attachments/${todoId}`);
  }

  downloadFile(todoId: string, fileName: string): Observable<any> {
    return this.http.get<string[]>(`${this.baseUrl}/attachments/${todoId}/${fileName}`);
  }

  deleteAttachment(todoId: string, filename: string): Observable<any> {
    // return this.http.delete(`${this.baseUrl}/attachments/${todoId}/${filename}`);
    return this.http.delete<any>(`${this.baseUrl}/attachments/${todoId}/${filename}`, { observe: 'response' });
  }

  deleteAllAttachments(todoId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${todoId}/attachments`);
  }
}
