import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { Cloudinary } from 'cloudinary-core';
import { ApiService } from '../api.service';
import { FooterVisibilityService } from '../services/footer-visibility.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnDestroy {
  username: string | null = null;
  uniqueID: string | null = null;
  showUploadModal: boolean = false;
  selectedFile: File | null = null;
  customFileName: string | null = null;
  images: any[] = [];
  filteredImages: any[] = [];
  searchQuery: string = '';
  showEditModal: boolean = false;
  editImageUrl: string | null = null;
  cloudinary: any;
  transformations: any = {
    resize: false,
    sepia: false,
    textOverlay: false,
    rotate: false,
    grayscale: false,
    blur: true,
    brightness: true,
    contrast: true
  };
  resizeWidth: number | null = null;
  resizeHeight: number | null = null;
  overlayText: string = '';
  rotateAngle: number = 0;
  blurAmount: number = 0;
  brightnessAmount: number = 0;
  contrastAmount: number = 0;

  constructor(private userService: UserService, private http: HttpClient, private apiService: ApiService, private footerVisibilityService: FooterVisibilityService) {
    this.cloudinary = new Cloudinary({ cloud_name: 'dhu8cxsot', secure: true });
  }

  ngOnInit(): void {
    this.userService.currentUsername.subscribe(name => this.username = name);
    this.userService.currentUniqueID.subscribe(id => {
      this.uniqueID = id;
      this.fetchImages();
    });
    this.footerVisibilityService.setFooterVisible(false);
  }

  ngOnDestroy(): void {
    this.footerVisibilityService.setFooterVisible(true);
  }

  fetchImages(): void {
    if (this.uniqueID) {
      this.apiService.get<any[]>(`get-images-by-id/${this.uniqueID}`)
        .subscribe(data => {
          this.images = data;
          this.filteredImages = this.images;
        });
    }
  }

  onSearch(): void {
    this.filteredImages = this.images.filter(image => 
      image.alt.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  onDelete(imageId: number): void {
    if (imageId === undefined) {
      console.error('Image ID is undefined');
      return;
    }

    this.apiService.delete('delete-image', { id: imageId }).subscribe(
      (response: any) => {
        console.log('Image deleted successfully:', response);
        this.fetchImages();
      },
      (error) => {
        console.error('Error deleting image:', error);
      }
    );
  }

  onEdit(imageId: number): void {
    const image = this.images.find(image => image.id === imageId);
    if (image) {
      this.fetchAndUploadImage(image.url).then(cloudinaryUrl => {
        this.editImageUrl = cloudinaryUrl;
        this.showEditModal = true;
        this.updateTransformations();
      });
    }
  }

  async fetchAndUploadImage(imageUrl: string): Promise<string> {
    const fetchImageUrl = `http://localhost/api/fetch-image?url=${encodeURIComponent(imageUrl)}`;
    const blob = await this.http.get(fetchImageUrl, { responseType: 'blob' }).toPromise() as Blob;
    const formData = new FormData();
    formData.append('file', blob, 'image.png');
    formData.append('upload_preset', 'meowmelol');

    const response: any = await this.http.post('https://api.cloudinary.com/v1_1/dhu8cxsot/image/upload', formData).toPromise();
    
    return response.secure_url;
  }

  updateTransformations(): void {
    if (!this.editImageUrl) {
      return;
    }
  
    const transformations = [];
  
    if (this.transformations.resize && this.resizeWidth && this.resizeHeight) {
      transformations.push({ width: this.resizeWidth, height: this.resizeHeight, crop: 'fill' });
    }
    if (this.transformations.textOverlay && this.overlayText && this.overlayText.trim() !== '') {
      transformations.push({ overlay: `text:Arial_60:${this.overlayText}`, gravity: 'south', y: 20 });
    }
    if (this.transformations.sepia) {
      transformations.push({ effect: 'sepia' });
    }
    if (this.rotateAngle) {
      transformations.push({ angle: this.rotateAngle });
    }
    if (this.transformations.grayscale) {
      transformations.push({ effect: 'grayscale' });
    }
    if (this.transformations.blur) {
      transformations.push({ effect: `blur:${this.blurAmount}` });
    }
    if (this.transformations.brightness) {
      transformations.push({ effect: `brightness:${this.brightnessAmount}` });
    }
    if (this.transformations.contrast) {
      transformations.push({ effect: `contrast:${this.contrastAmount}` });
    }
  
    this.editImageUrl = this.cloudinary.url(this.extractPublicId(this.editImageUrl), {
      transformation: transformations
    });
  }
  
  applyTransformations(): void {
    const selectedTransformations = Object.keys(this.transformations).filter(key => {
      if (key === 'resize' && this.transformations.resize) {
        return this.resizeWidth && this.resizeHeight;
      }
      if (key === 'textOverlay' && this.transformations.textOverlay) {
        return this.overlayText && this.overlayText.trim() !== '';
      }
      return this.transformations[key];
    });

    if (this.editImageUrl) {
      this.fetchImageAndUploadToEditor(this.editImageUrl, selectedTransformations);
    }
  }

  fetchImageAndUploadToEditor(imageUrl: string, transformations: string[]): void {
    const fetchImageUrl = `http://localhost/api/fetch-image?url=${encodeURIComponent(imageUrl)}`;
    this.http.get(fetchImageUrl, { responseType: 'blob' }).subscribe(blob => {
      const formData = new FormData();
      formData.append('file', blob, 'image.png');
      formData.append('upload_preset', 'meowmelol');

      this.http.post('https://api.cloudinary.com/v1_1/dhu8cxsot/image/upload', formData)
        .subscribe((response: any) => {
          let editUrl = this.cloudinary.url(response.public_id, {
            transformation: transformations.map(transformation => {
              switch (transformation) {
                case 'resize':
                  return { width: this.resizeWidth, height: this.resizeHeight, crop: 'fill' };
                case 'textOverlay':
                  return { overlay: `text:Arial_60:${this.overlayText}`, gravity: 'south', y: 20 };
                case 'sepia':
                  return { effect: 'sepia' };
                case 'rotate':
                  return { angle: this.rotateAngle };
                case 'grayscale':
                  return { effect: 'grayscale' };
                case 'blur':
                  return { effect: `blur:${this.blurAmount}` };
                case 'brightness':
                  return { effect: `brightness:${this.brightnessAmount}` };
                case 'contrast':
                  return { effect: `contrast:${this.contrastAmount}` };
                default:
                  return {};
              }
            })
          });
          this.closeEditModal();
          window.open(editUrl, '_blank');
        }, error => {
          console.error('Upload to Cloudinary failed', error);
        });
    }, error => {
      console.error('Fetching image failed', error);
    });
  }

  resizeImage(publicId: string, width: number, height: number): string {
    return this.cloudinary.url(publicId, {
      transformation: [
        { width, height, crop: 'fill' }
      ]
    });
  }

  addTextOverlay(publicId: string, text: string): string {
    return this.cloudinary.url(publicId, {
      transformation: [
        { overlay: `text:Arial_60:${text}`, gravity: 'south', y: 20 }
      ]
    });
  }

  applyEffect(publicId: string, effect: string): string {
    return this.cloudinary.url(publicId, {
      transformation: [
        { effect }
      ]
    });
  }

  rotateImage(publicId: string, angle: number): string {
    return this.cloudinary.url(publicId, {
      transformation: [
        { angle }
      ]
    });
  }

  extractPublicId(url: string): string {
    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    return publicIdWithExtension.split('.')[0];
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async checkFileName(fileName: string): Promise<string> {
    const existingFileNames = this.images.map(image => image.url.split('/').pop());
    let baseFileName = fileName.split('.').slice(0, -1).join('.');
    const fileExtension = fileName.split('.').pop();
    let uniqueFileName = fileName;
    let counter = 1;

    while (existingFileNames.includes(uniqueFileName)) {
      uniqueFileName = `${baseFileName}(${counter}).${fileExtension}`;
      counter++;
    }

    return uniqueFileName;
  }

  private resetTransformations(): void {
    this.transformations = {
      resize: false,
      sepia: false,
      textOverlay: false,
      rotate: false,
      grayscale: false,
      blur: true,
      brightness: true,
      contrast: true
    };
    this.resizeWidth = null;
    this.resizeHeight = null;
    this.overlayText = '';
    this.rotateAngle = 0;
    this.blurAmount = 0;
    this.brightnessAmount = 0;
    this.contrastAmount = 0;
  }

  onUpload() {
    if (this.selectedFile) {
      const formData = new FormData();
      const fileNameParts = this.selectedFile.name.split('.');
      const fileExtension = fileNameParts.pop();
      const baseFileName = fileNameParts.join('.');

      let fileName = this.customFileName ? `${this.customFileName}_${this.uniqueID}.${fileExtension}` : `${baseFileName}_${this.uniqueID}.${fileExtension}`;

      this.checkFileName(fileName).then(uniqueFileName => {
        formData.append('image', this.selectedFile!, uniqueFileName);
        formData.append('unique_id', this.uniqueID!);

        this.apiService.uploadImageWithID(formData).subscribe(response => {
          this.showUploadModal = false;
          this.customFileName = '';
          this.fetchImages();
        }, error => {
          console.error('Upload failed', error);
        });
      });
    } else {
      console.error('Selected file is not available');
    }
  }
  closeEditModal(): void {
    this.resetTransformations();
    this.showEditModal = false;
  }

  toggleUploadModal() {
    this.showUploadModal = !this.showUploadModal;
  }

  closeUploadModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.showUploadModal = false;
      this.customFileName = '';
    }
  }

  openModal(imageUrl: string) {
    const modal = document.getElementById("myModal") as HTMLElement;
    const modalImg = document.getElementById("img01") as HTMLImageElement;
    modal.style.display = "block";
    modalImg.src = imageUrl;
  }

  closeModal(event?: Event) {
    if (!event || (event.target as HTMLElement).classList.contains('modal')) {
      const modal = document.getElementById('myModal');
      if (modal) {
        modal.style.display = 'none';
      }
    }
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

}