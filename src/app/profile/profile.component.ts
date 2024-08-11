import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service'; // Import ApiService

interface ProfileData {
  aboutMe: string;
  age: number;
  residence: string;
  address: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username: string | null = null;
  uniqueID: string | null = null;
  age: number = 0; // Example age
  residence: string = '--'; // Example residence
  address: string = '--'; // Example address
  email: string = 'email@example.com'; // Example email
  phone: string = '--'; // Example phone
  aboutMe: string = ''; // Add aboutMe field

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
  rotateAngle: number = 0; // Initialize rotateAngle to 0
  blurAmount: number = 0;
  brightnessAmount: number = 0;
  contrastAmount: number = 0;

  // New properties for editing profile
  editAboutMe: string = '';
  editAge: number = this.age;
  editResidence: string = this.residence;
  editAddress: string = this.address;
  editEmail: string = this.email;
  editPhone: string = this.phone;

  constructor(private userService: UserService, private http: HttpClient, private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.userService.currentUsername.subscribe(name => this.username = name);
    this.userService.currentUniqueID.subscribe(id => {
      this.uniqueID = id;
      if (this.uniqueID) {
        this.fetchProfileData(this.uniqueID);
      }
    });
  }

  openEditModal(): void {
    this.editAboutMe = this.aboutMe;
    this.editAge = this.age;
    this.editResidence = this.residence;
    this.editAddress = this.address;
    this.editEmail = this.email;
    this.editPhone = this.phone;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveProfile(): void {
    const profileData = {
      uniqueID: this.uniqueID,
      aboutMe: this.editAboutMe,
      age: this.editAge,
      residence: this.editResidence,
      address: this.editAddress,
      email: this.editEmail,
      phone: this.editPhone
    };

    this.apiService.post('saveProfile', profileData).subscribe(response => {
      // Update local data if save is successful
      this.aboutMe = this.editAboutMe;
      this.age = this.editAge;
      this.residence = this.editResidence;
      this.address = this.editAddress;
      this.email = this.editEmail;
      this.phone = this.editPhone;
      this.showEditModal = false;
    }, error => {
      console.error('Error saving profile:', error);
    });
  }

  fetchProfileData(uniqueID: string): void {
    this.apiService.get<ProfileData>(`fetch_profile/${uniqueID}`).subscribe(response => {
      this.aboutMe = response.aboutMe;
      this.age = response.age;
      this.residence = response.residence;
      this.address = response.address;
      this.email = response.email;
      this.phone = response.phone;
    }, error => {
      // Handle the error gracefully without logging to the console
      if (error.error === "Profile not found") {
        // Optionally, you can set default values or show a user-friendly message
        this.aboutMe = `Hello! I'm ${this.username}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean fermentum ullamcorper sem, at placerat dolor volutpat ac. Duis nulla enim, condimentum nec ultricies.`;
        this.age = 0;
        this.residence = '--';
        this.address = '--';
        this.email = 'email@example.com';
        this.phone = '--';
      }
    });
  }
}