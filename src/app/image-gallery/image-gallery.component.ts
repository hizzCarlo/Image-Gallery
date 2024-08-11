import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.css']
})
export class ImageGalleryComponent implements OnInit {
  images: any[] = [];
  filteredImages: any[] = [];
  selectedFile: File | null = null;
  searchQuery: string = '';
  imageWidth: number = 200; // Default image width
  imageHeight: number = 300; // Default image height
  showScaleSlider: boolean = false;
  showUploadModal: boolean = false;
  showEditModal: boolean = false;
  customFileName: string | null = null;
  editImageUrl: string | null = null;
  editCanvas: HTMLCanvasElement | null = null;
  cropping: boolean = false;
  cropStartX: number = 0;
  cropStartY: number = 0;
  cropEndX: number = 0;
  cropEndY: number = 0;
  activeCategory: string = 'all';

  text: { content: string; x: number; y: number } = { content: 'Sample Text', x: 50, y: 50 }; // Store text and position
  isDragging: boolean = false; // Track dragging state
  dragOffsetX: number = 0; // Offset for dragging
  dragOffsetY: number = 0; // Offset for dragging
  isLoggedIn: boolean = false;
  username: string | null = null;
  dropdownOpen: boolean = false;
  constructor(private http: HttpClient, private apiService: ApiService, private authService: AuthService, private userService: UserService, private router: Router) { } // Inject ApiService

  ngOnInit(): void {
    this.authService.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
      this.dropdownOpen = false; // Ensure dropdown is closed on login status change
      this.fetchImages();
    });
    this.userService.currentUsername.subscribe(name => this.username = name);

    // Load image dimensions from local storage
    const storedImageWidth = localStorage.getItem('imageWidth');
    const storedImageHeight = localStorage.getItem('imageHeight');
    if (storedImageWidth && storedImageHeight) {
      this.imageWidth = parseInt(storedImageWidth, 10);
      this.imageHeight = parseInt(storedImageHeight, 10);
    }
  }
  logout() {
    this.authService.logout();
    this.dropdownOpen = false; // Ensure dropdown is closed on logout
    this.router.navigate(['/']); // Redirect to homepage after logout
  }

  showDropdown() {
    this.dropdownOpen = true;
  }

  hideDropdown() {
    this.dropdownOpen = false;
  }

  fetchImages(): void {
    this.apiService.get<any[]>('get-images')
      .subscribe(data => {
        this.images = data.map(image => ({
          id: image.id,
          url: image.url,
          alt: image.alt
        }));
        this.filteredImages = this.images; // Initialize filtered images
      });
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onDownload(imageId: number): void {
    this.apiService.get(`download-image?id=${imageId}`, { responseType: 'blob' })
    .subscribe(blob => {
      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
        a.download = `image_${imageId}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, error => {
        console.error('Download failed', error);
      });
  }

  openModal(imageUrl: string) {
    const modal = document.getElementById("myModal") as HTMLElement;
    const modalImg = document.getElementById("img01") as HTMLImageElement;
    modal.style.display = "block";
    modalImg.src = imageUrl;
  }

  onSearch(): void {
    this.filteredImages = this.images.filter(image => 
      image.alt.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  onScaleChange(event: any): void {
    this.imageWidth = event.target.value;
    this.imageHeight = event.target.value * 1.5; // Adjust height to be 1.5 times the width
   

    // Save image dimensions to local storage
    localStorage.setItem('imageWidth', this.imageWidth.toString());
    localStorage.setItem('imageHeight', this.imageHeight.toString());
  }

  closeScaleSlider(event: Event) {
    if ((event.target as HTMLElement).classList.contains('dropdown')) {
      this.showScaleSlider = false;
    }
  }

  closeModal(event?: Event) {
    if (!event || (event.target as HTMLElement).classList.contains('modal')) {
      // Close the image modal
      const modal = document.getElementById('myModal');
      if (modal) {
        modal.style.display = 'none';
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.resize-button-container')) {
      this.showScaleSlider = false;
    }
  }

  filterCategory(category: string): void {
    this.activeCategory = category;
    if (category.toLowerCase() === 'all') {
      this.filteredImages = this.images;
    } else {
      const lowerCaseCategory = category.toLowerCase();
      this.filteredImages = this.images.filter(image => {
        const imageName = image.url.toLowerCase();
        const imageExtension = imageName.split('.').pop();
        return imageName.includes(lowerCaseCategory) || imageExtension === lowerCaseCategory;
      });
    }
  }
}