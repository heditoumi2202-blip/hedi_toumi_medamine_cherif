// Gestion de la galerie d'images
class GalleryManager {
  constructor() {
    this.API_URL = 'http://localhost:5000/api';
  }

  // Récupère toutes les photos d'une catégorie
  async getPhotosByCategory(category) {
    try {
      const response = await fetch(`${this.API_URL}/photos?category=${category}`);
      
      if (!response.ok) {
        console.error(`Erreur ${response.status}: ${response.statusText}`);
        return [];
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Réponse non-JSON reçue:', contentType);
        return [];
      }

      const photos = await response.json();
      return photos;
    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error);
      return [];
    }
  }

  // Récupère uniquement les photos de l'utilisateur connecté
  async getUserPhotos(category) {
    try {
      if (!auth.isLoggedIn()) {
        return [];
      }

      const userId = auth.getUser().id;
      const allPhotos = await this.getPhotosByCategory(category);
      
      // Filtrer les photos de l'utilisateur
      return allPhotos.filter(p => {
        const photoUserId = typeof p.uploadedBy === 'string' ? p.uploadedBy : (p.uploadedBy._id || p.uploadedBy.id);
        return photoUserId === userId;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des photos utilisateur:', error);
      return [];
    }
  }

  // Ajoute une photo à la base de données
  async addPhoto(title, description, category, imageUrl) {
    try {
      if (!auth.isLoggedIn()) {
        throw new Error('Vous devez être connecté pour ajouter une photo');
      }

      const response = await fetch(`${this.API_URL}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.getToken()}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Erreur ${response.status}:`, errorData);
        throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, photo: data };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la photo:', error);
      return { success: false, message: error.message };
    }
  }

  // Supprime une photo
  async deletePhoto(photoId) {
    try {
      if (!auth.isLoggedIn()) {
        throw new Error('Vous devez être connecté pour supprimer une photo');
      }

      const response = await fetch(`${this.API_URL}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      return { success: true, message: 'Photo supprimée' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Convertir une image en base64 pour stocker l'URL
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }

  // Affiche les photos publiques statiques (quand pas connecté)
  async displayPublicPhotos(staticPhotos, gallerySelector) {
    const gallery = document.querySelector(gallerySelector);
    gallery.innerHTML = ''; // Vider la galerie

    staticPhotos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${photo.src}" alt="${photo.title}" onclick="gallery.openLightbox('${photo.src}', '${photo.title}')" style="cursor:zoom-in;">
        <div class="item-info">
          <h3>${photo.title}</h3>
          <p>${photo.description || ''}</p>
        </div>
      `;
      gallery.appendChild(item);
    });
  }

  // Affiche les photos de l'utilisateur connecté
  async displayUserPhotos(category, gallerySelector) {
    const photos = await this.getUserPhotos(category);
    const gallery = document.querySelector(gallerySelector);
    gallery.innerHTML = ''; // Vider la galerie

    if (photos.length === 0) {
      gallery.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">Aucune photo ajoutée pour le moment</p>';
      return;
    }

    photos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${photo.imageUrl}" alt="${photo.title}" data-photo-id="${photo._id || photo.id}" onclick="gallery.openLightbox('${photo.imageUrl}', '${photo.title}')" style="cursor:zoom-in;">
        <button onclick="gallery.deletePhotoItem('${photo._id || photo.id}')" class="delete-btn">X</button>
        <div class="item-info">
          <h3>${photo.title}</h3>
          <p>${photo.description || ''}</p>
        </div>
      `;
      gallery.appendChild(item);
    });
  }

  // Supprime une photo de l'affichage
  async deletePhotoItem(photoId) {
    const result = await this.deletePhoto(photoId);

    if (result.success) {
      document.querySelector(`[data-photo-id="${photoId}"]`).closest('.gallery-item').remove();
      alert('Photo supprimée!');
    } else {
      alert(result.message);
    }
  }

  // Ouvre le lightbox
  openLightbox(src, title) {
    let overlay = document.getElementById('lightbox-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lightbox-overlay';
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;
        display:flex;align-items:center;justify-content:center;cursor:zoom-out;
      `;
      overlay.innerHTML = `
        <button id="lightbox-close" style="position:absolute;top:20px;right:30px;background:none;border:none;color:#fff;font-size:2.5rem;cursor:pointer;line-height:1;">&times;</button>
        <img id="lightbox-img" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:6px;box-shadow:0 8px 40px #000;">
        <p id="lightbox-title" style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:#fff;font-size:1rem;background:rgba(0,0,0,0.5);padding:6px 16px;border-radius:20px;"></p>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
      document.getElementById('lightbox-close').addEventListener('click', () => overlay.style.display = 'none');
      document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.style.display = 'none'; });
    }
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-title').textContent = title || '';
    overlay.style.display = 'flex';
  }
}

// Créer une instance globale
const gallery = new GalleryManager();
