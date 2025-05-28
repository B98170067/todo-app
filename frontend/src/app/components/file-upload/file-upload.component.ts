import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileUploadService } from '../../services/upload.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule, FormsModule, MatListModule, MatButtonModule, MatIconModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  @Input() todoId!: string;
  @Output() uploaded = new EventEmitter<void>();

  selectedFiles: File[] = [];
  uploading = false;
  // attachments: { name: string; url: SafeUrl }[] = [];
  attachments: string[] = [];

  constructor(private uploadService: FileUploadService, private sanitizer: DomSanitizer, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.fetchAttachments();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  uploadFiles() {
    if (!this.selectedFiles.length || !this.todoId) {
      return;
    }

    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('files', file));

    this.uploading = true;
    this.uploadService.uploadFiles(this.todoId, this.selectedFiles).subscribe({
      next: () => {
        this.selectedFiles = [];
        this.uploaded.emit();
        this.uploading = false;

        this.snackBar.open('附件上傳成功', '關閉', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snack-success']
        });
      },
      error: (err) => {
        console.error('附件上傳時發生錯誤：', err);
        this.uploading = false;

        this.snackBar.open('附件上傳時發生錯誤：', '關閉', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snack-error']
        });
      }
    });
  }

  downloadFile(event: Event, filename: string) {
    event.preventDefault();

    const temp = filename.split('/').pop();
    if (!temp) {
      console.error('無效的檔案名稱');
      return;
    }

    this.uploadService.downloadFile(this.todoId, temp).subscribe(res => {
      const link = document.createElement('a');
      link.href = res.fileUrl;
      link.download = temp;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  fetchAttachments() {
    this.uploadService.getAttachments(this.todoId).subscribe(files => {
      // this.attachments = files.map(name => ({
      //   name,
      //   url: this.sanitizer.bypassSecurityTrustUrl(`/upload/attachments/${this.todoId}/${name}`)
      // }));

      this.attachments = files.map(name => (name.split('/').pop() ?? ""));
    });
  }

  deleteAttachment(filename: string) {
    // this.uploadService.deleteAttachment(this.todoId, filename).subscribe(res => {
    //   this.fetchAttachments();
    // });

    this.uploadService.deleteAttachment(this.todoId, filename).subscribe({
      next: res => {
        if (res.status === 200) {
          this.snackBar.open('附件刪除成功', '關閉', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snack-success']
          });
          this.fetchAttachments();
        } else {
          this.snackBar.open('附件刪除失敗，請稍後再試', '關閉', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snack-error']
          });
          console.warn('附件刪除失敗，狀態碼：', res.status);
        }
      },
      error: err => {
        this.snackBar.open('附件刪除時發生錯誤', '關閉', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snack-error']
        });
        console.error('附件刪除時發生錯誤：', err);
      }
    });
  }
}
