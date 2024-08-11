import { Component, OnInit, HostListener } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
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

  text: { content: string; x: number; y: number } = { content: 'Sample Text', x: 50, y: 50 }; // Store text and position
  isDragging: boolean = false; // Track dragging state
  dragOffsetX: number = 0; // Offset for dragging
  dragOffsetY: number = 0; // Offset for dragging

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchImages();
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
  }

  toggleScaleSlider() {
    this.showScaleSlider = !this.showScaleSlider;
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

  
}