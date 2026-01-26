// admin.js - Interface d'administration professionnelle

// Variables globales
let currentQuestions = [];
let currentAds = {};

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  console.log('Admin DOM loaded');
  
  initializeAdmin();
  
  // Charger les publicités depuis localStorage
  const stored = localStorage.getItem('qdayAds');
  if (stored) {
    currentAds = JSON.parse(stored);
  }
  
  // Initialiser les champs de date avec la date et heure actuelles
  initializeDateTimeFields();
  
  loadQuestions();
  loadAds();
  
  // Configurer le formulaire de question
  setupQuestionForm();
  
  setupEventListeners();
});

// Initialiser les champs de date/heure
const initializeDateTimeFields = () => {
  const now = new Date();
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  
  // Initialiser le champ de programmation des questions
  const questionSchedule = document.getElementById('questionSchedule');
  if (questionSchedule) {
    questionSchedule.value = localDateTime;
  }
  
  // Initialiser le champ de programmation des pubs
  const adSchedule = document.getElementById('adSchedule');
  if (adSchedule) {
    adSchedule.value = localDateTime;
  }
  
  // Initialiser le champ d'expiration des pubs
  const adExpiry = document.getElementById('adExpiry');
  if (adExpiry) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDateTime = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    adExpiry.value = tomorrowDateTime;
  }
};

// Initialiser l'interface admin
const initializeAdmin = () => {
  // Activer le premier menu par défaut
  showTab('questions');
};

// Configuration des event listeners
const setupEventListeners = () => {
  console.log('Setting up event listeners');
  
  // Menu navigation
  document.querySelectorAll('.menu-item').forEach(item => {
    console.log('Found menu item:', item.dataset.tab);
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      console.log('Menu clicked:', tab);
      showTab(tab);
    });
  });

  // Bouton "Nouvelle Question" - CORRIGÉ
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  if (addQuestionBtn) {
    console.log('Found add question button');
    addQuestionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Add question button clicked');
      showAddQuestionModal();
    });
  } else {
    console.error('Add question button not found!');
  }

  // Boutons de configuration des publicités - CORRIGÉ
  document.querySelectorAll('[onclick^="showAdModal"]').forEach(btn => {
    const slotNumber = btn.getAttribute('onclick').match(/showAdModal\((\d+)\)/)?.[1];
    if (slotNumber) {
      btn.removeAttribute('onclick');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Ad config button clicked for slot:', slotNumber);
        showAdModal(parseInt(slotNumber));
      });
    }
  });

  // Formulaire question
  const questionForm = document.getElementById('questionForm');
  if (questionForm) {
    console.log('Found question form');
    questionForm.addEventListener('submit', handleQuestionSubmit);
  }

  // Formulaire publicité
  const adForm = document.getElementById('adForm');
  if (adForm) {
    console.log('Found ad form');
    adForm.addEventListener('submit', handleAdSubmit);
  }

  // Changement de type de pub
  const adType = document.getElementById('adType');
  if (adType) {
    console.log('Found ad type select');
    adType.addEventListener('change', handleAdTypeChange);
  }

  // Checkbox "Question du jour"
  const isTodayQuestion = document.getElementById('isTodayQuestion');
  if (isTodayQuestion) {
    console.log('Found today question checkbox');
    isTodayQuestion.addEventListener('change', handleTodayQuestionChange);
  }

  // Boutons de modération - CORRIGÉ
  const refreshBtn = document.querySelector('[onclick="refreshModeration()"]');
  if (refreshBtn) {
    refreshBtn.removeAttribute('onclick');
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      refreshModeration();
    });
  }

  const bulkApproveBtn = document.querySelector('[onclick="bulkApprove()"]');
  if (bulkApproveBtn) {
    bulkApproveBtn.removeAttribute('onclick');
    bulkApproveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      bulkApprove();
    });
  }

  const bulkRejectBtn = document.querySelector('[onclick="bulkReject()"]');
  if (bulkRejectBtn) {
    bulkRejectBtn.removeAttribute('onclick');
    bulkRejectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      bulkReject();
    });
  }

  const bulkBanBtn = document.querySelector('[onclick="bulkBan()"]');
  if (bulkBanBtn) {
    bulkBanBtn.removeAttribute('onclick');
    bulkBanBtn.addEventListener('click', (e) => {
      e.preventDefault();
      bulkBan();
    });
  }

  // Modal close buttons - CORRIGÉ
  document.querySelectorAll('[onclick^="closeModal"]').forEach(btn => {
    const modalId = btn.getAttribute('onclick').match(/closeModal\('([^']+)'\)/)?.[1];
    if (modalId) {
      btn.removeAttribute('onclick');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(modalId);
      });
    }
  });

  console.log('Event listeners setup complete');
};

// Navigation entre tabs
const showTab = (tabName) => {
  console.log('Showing tab:', tabName);
  
  // Cacher tous les tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Désactiver tous les menus
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });

  // Afficher le tab sélectionné
  const tabElement = document.getElementById(`${tabName}-tab`);
  if (tabElement) {
    tabElement.classList.add('active');
  }
  
  const menuElement = document.querySelector(`[data-tab="${tabName}"]`);
  if (menuElement) {
    menuElement.classList.add('active');
  }

  // Charger les données spécifiques
  if (tabName === 'stats') {
    loadStats();
  } else if (tabName === 'moderation') {
    loadModeration();
  }
};

// === GESTION DES QUESTIONS ===

// Charger les questions
const loadQuestions = async () => {
  try {
    console.log('Loading questions...');
    
    // Charger depuis localStorage en premier
    const storedQuestions = localStorage.getItem('qdayQuestions');
    if (storedQuestions) {
      currentQuestions = JSON.parse(storedQuestions);
      console.log('Loaded from localStorage:', currentQuestions);
      
      // Trier les questions par date (programmées d'abord)
      const sortedQuestions = [...currentQuestions].sort((a, b) => {
        const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(a.createdAt || 0);
        const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      displayQuestions(sortedQuestions);
    }
    
    // Essayer de charger depuis l'API (si disponible)
    try {
      const res = await fetch('/api/questions');
      const questions = await res.json();
      currentQuestions = questions;
      localStorage.setItem('qdayQuestions', JSON.stringify(currentQuestions));
      
      // Trier les questions par date
      const sortedQuestions = [...currentQuestions].sort((a, b) => {
        const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(a.createdAt || 0);
        const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      displayQuestions(sortedQuestions);
    } catch (apiErr) {
      console.log('API non disponible, utilisation du localStorage');
    }
  } catch (err) {
    console.error('Erreur chargement questions:', err);
  }
};

// Afficher les questions
const displayQuestions = (questions) => {
  const container = document.getElementById('questionsList');
  if (!container) {
    console.error('Container questionsList not found');
    return;
  }

  // Vérifier si questions est un tableau
  if (!Array.isArray(questions)) {
    console.error('Questions is not an array:', questions);
    return;
  }

  console.log('Displaying questions:', questions);

  const now = new Date();
  const today = now.toDateString();

  container.innerHTML = questions.map(q => {
    const scheduledDate = q.scheduledDate ? new Date(q.scheduledDate) : null;
    const scheduledDay = scheduledDate ? scheduledDate.toDateString() : null;
    
    // Obtenir le texte de la question selon la langue actuelle
    const questionText = getQuestionText(q);
    
    // Déterminer le statut
    let status = 'inactive';
    let statusText = 'Inactive';
    let statusClass = 'status-inactive';
    
    if (scheduledDate) {
      if (scheduledDay === today && q.active) {
        status = 'active';
        statusText = 'Active (Aujourd\'hui)';
        statusClass = 'status-active';
      } else if (scheduledDate > now) {
        status = 'scheduled';
        statusText = 'Programmée';
        statusClass = 'status-pending';
      } else {
        status = 'past';
        statusText = 'Passée';
        statusClass = 'status-inactive';
      }
    } else if (q.active) {
      status = 'active';
      statusText = 'Question du jour';
      statusClass = 'status-active';
    } else {
      status = 'inactive';
      statusText = 'Désactivée';
      statusClass = 'status-inactive';
    }

    return `
      <div class="question-item">
        <span title="${q.text_en ? `EN: ${q.text_en}` : ''}">${questionText}</span>
        <span>${q.category}</span>
        <span>
          ${scheduledDate ? 
            `Programmée: ${scheduledDate.toLocaleDateString()}` : 
            new Date(q.date || q.createdAt).toLocaleDateString()
          }
        </span>
        <span>
          <span class="status-badge ${statusClass}">
            ${statusText}
          </span>
        </span>
        <div class="action-buttons">
          <button class="btn-small btn-edit" onclick="editQuestion('${q._id}')">✏️</button>
          <button class="btn-small btn-delete" onclick="deleteQuestion('${q._id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
  
  console.log('Questions displayed successfully');
};

// Configurer le formulaire de question
const setupQuestionForm = () => {
  const form = document.getElementById('questionForm');
  if (!form) {
    console.error('Question form not found');
    return;
  }

  console.log('Setting up question form');
  
  form.addEventListener('submit', handleQuestionSubmit);
  
  // Réinitialiser les champs de date à l'ouverture du modal
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  if (addQuestionBtn) {
    addQuestionBtn.addEventListener('click', () => {
      setTimeout(() => {
        initializeDateTimeFields();
      }, 100);
    });
  }
};

// Afficher modal ajout question
const showAddQuestionModal = () => {
  console.log('Opening question modal for add');
  const modal = document.getElementById('questionModal');
  if (modal) {
    modal.style.display = 'block';
    
    // Réinitialiser complètement le formulaire
    const form = document.getElementById('questionForm');
    form.reset();
    
    // Réinitialiser l'ID d'édition
    form.dataset.editingId = '';
    
    // Réinitialiser le titre et le bouton
    const modalTitle = document.querySelector('#questionModal .modal-header h3');
    if (modalTitle) {
      modalTitle.textContent = t('add_question');
    }
    
    const submitBtn = document.querySelector('#questionForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = t('add_button');
    }
    
    // Réinitialiser le champ de date avec la date et heure actuelles
    setTimeout(() => {
      initializeDateTimeFields();
    }, 100);
    
    // Masquer le champ de programmation par défaut
    const scheduleGroup = document.getElementById('scheduleGroup');
    if (scheduleGroup) {
      scheduleGroup.style.display = 'none';
    }
  }
};

// Gérer le changement de la checkbox "Question du jour"
const handleTodayQuestionChange = () => {
  const isTodayQuestion = document.getElementById('isTodayQuestion').checked;
  const scheduleGroup = document.getElementById('scheduleGroup');
  
  if (isTodayQuestion) {
    // Masquer le champ de programmation
    scheduleGroup.style.display = 'none';
  } else {
    // Afficher le champ de programmation
    scheduleGroup.style.display = 'block';
  }
};

// Fermer modal
const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
};

// Gérer soumission question
const handleQuestionSubmit = async (e) => {
  e.preventDefault();
  
  const questionTextFr = document.getElementById('questionText_fr').value.trim();
  const questionTextEn = document.getElementById('questionText_en').value.trim();
  const questionCategory = document.getElementById('questionCategory').value;
  const isTodayQuestion = document.getElementById('isTodayQuestion').checked;
  const questionSchedule = document.getElementById('questionSchedule').value;
  
  // Validation
  if (!questionTextFr || !questionTextEn || !questionCategory) {
    showNotification(t('error_required'), 'error');
    return;
  }
  
  // Vérifier si c'est une édition ou un ajout
  const editingId = document.getElementById('questionForm').dataset.editingId;
  const isEditing = editingId && editingId !== '';
  
  console.log('Form mode:', isEditing ? 'edit' : 'add');
  console.log('Editing ID:', editingId);
  
  const formData = {
    text_fr: questionTextFr,
    text_en: questionTextEn,
    text: questionTextFr, // Pour compatibilité
    category: questionCategory,
    active: true,
    scheduledDate: isTodayQuestion ? null : (questionSchedule || null),
    updatedAt: new Date().toISOString()
  };

  console.log('Submitting question data:', formData);

  try {
    // S'assurer que currentQuestions est un tableau
    if (!Array.isArray(currentQuestions)) {
      currentQuestions = [];
    }
    
    if (isEditing) {
      // MODE ÉDITION - Mettre à jour la question existante
      console.log('Updating existing question:', editingId);
      
      const questionIndex = currentQuestions.findIndex(q => q._id === editingId);
      if (questionIndex === -1) {
        showNotification('Question non trouvée pour la modification', 'error');
        return;
      }
      
      // Si c'est une question du jour, désactiver les autres
      if (isTodayQuestion) {
        console.log('Updated today question, deactivating previous today questions');
        
        currentQuestions = currentQuestions.map(q => {
          // Si c'est une question du jour (sans scheduledDate) et active, et que ce n'est pas la question en cours d'édition
          if (!q.scheduledDate && q.active && q._id !== editingId) {
            console.log('Deactivating previous today question:', q._id);
            return { ...q, active: false };
          }
          return q;
        });
      }
      
      // Mettre à jour la question
      currentQuestions[questionIndex] = {
        ...currentQuestions[questionIndex],
        ...formData
      };
      
      showNotification(t('question_updated'), 'success');
      
    } else {
      // MODE AJOUT - Créer une nouvelle question
      console.log('Creating new question');
      
      // Si c'est une question du jour, désactiver les autres
      if (isTodayQuestion) {
        console.log('New today question, deactivating previous today questions');
        
        currentQuestions = currentQuestions.map(q => {
          // Si c'est une question du jour (sans scheduledDate) et active, la désactiver
          if (!q.scheduledDate && q.active) {
            console.log('Deactivating previous today question:', q._id);
            return { ...q, active: false };
          }
          return q;
        });
      }
      
      // Créer la nouvelle question
      const newQuestion = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      // Ajouter à la liste locale
      currentQuestions.push(newQuestion);
      
      showNotification(t('question_added'), 'success');
    }
    
    // Sauvegarder dans localStorage (fallback)
    localStorage.setItem('qdayQuestions', JSON.stringify(currentQuestions));
    
    // Essayer de sauvegarder dans MongoDB API
    try {
      console.log('📤 Sending question to MongoDB API...');
      const apiFormData = isEditing ? {
        ...formData,
        _id: editingId
      } : formData;
      
      const apiResponse = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiFormData)
      });
      
      if (apiResponse.ok) {
        const apiResult = await apiResponse.json();
        console.log('✅ Question sauvegardée dans MongoDB:', apiResult);
        showNotification('✅ Question synchronisée avec MongoDB!', 'success');
        
        // Recharger les questions depuis MongoDB pour avoir les bons IDs
        setTimeout(() => {
          loadQuestions();
        }, 1000);
        
      } else {
        const errorText = await apiResponse.text();
        console.error('❌ Erreur API MongoDB:', apiResponse.status, errorText);
        showNotification('⚠️ Question sauvegardée localement uniquement', 'warning');
      }
    } catch (apiErr) {
      console.error('❌ Erreur connexion API MongoDB:', apiErr);
      showNotification('⚠️ Question sauvegardée localement uniquement', 'warning');
    }
    
    // Fermer le modal
    closeModal('questionModal');
    
    // Réinitialiser le formulaire
    document.getElementById('questionForm').reset();
    document.getElementById('questionForm').dataset.editingId = '';
    
    // Réinitialiser le titre et le bouton
    const modalTitle = document.querySelector('#questionModal .modal-header h3');
    if (modalTitle) {
      modalTitle.textContent = t('add_question');
    }
    
    const submitBtn = document.querySelector('#questionForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = t('add_button');
    }
    
    // Trier les questions par date (questions du jour d'abord)
    const sortedQuestions = [...currentQuestions].sort((a, b) => {
      // Questions du jour (sans scheduledDate) en premier
      if (!a.scheduledDate && b.scheduledDate) return -1;
      if (a.scheduledDate && !b.scheduledDate) return 1;
      
      // Sinon trier par date
      const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(a.createdAt || 0);
      const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(b.createdAt || 0);
      return dateA - dateB;
    });
    
    // Mettre à jour l'affichage
    displayQuestions(sortedQuestions);
    
    console.log('Questions after operation:', currentQuestions);
    console.log('Sorted questions:', sortedQuestions);
    console.log('LocalStorage qdayQuestions:', localStorage.getItem('qdayQuestions'));
    
  } catch (err) {
    console.error('Erreur lors de l\'opération sur la question:', err);
    showNotification(t('error_operation'), 'error');
  }
};

// === GESTION DES PUBLICITÉS ===

// Charger les publicités
const loadAds = async () => {
  console.log('Loading ads...');
  
  // Simuler le chargement des pubs (à remplacer par API réelle)
  for (let i = 1; i <= 6; i++) {
    currentAds[i] = {
      slot: i,
      type: 'empty',
      content: null,
      schedule: null,
      expiry: null
    };
    updateAdPreview(i);
  }
};

// Afficher modal publicité
const showAdModal = (slotNumber) => {
  console.log('Opening ad modal for slot:', slotNumber);
  
  const modal = document.getElementById('adModal');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('adSlotNumber').textContent = `(${slotNumber})`;
    document.getElementById('adSlot').value = slotNumber;
    
    // Pré-remplir avec les données existantes
    const ad = currentAds[slotNumber];
    if (ad && ad.type !== 'empty') {
      document.getElementById('adType').value = ad.type;
      handleAdTypeChange(); // Afficher les champs appropriés
      
      if (ad.type === 'image') document.getElementById('adImageUrl').value = ad.content || '';
      if (ad.type === 'video') document.getElementById('adVideoUrl').value = ad.content || '';
      if (ad.type === 'text') document.getElementById('adText').value = ad.content || '';
      if (ad.type === 'html') document.getElementById('adHtml').value = ad.content || '';
      
      document.getElementById('adLink').value = ad.link || '';
      document.getElementById('adSchedule').value = ad.schedule || '';
      document.getElementById('adExpiry').value = ad.expiry || '';
    } else {
      document.getElementById('adForm').reset();
    }
  }
};

// Gérer changement de type de pub
const handleAdTypeChange = () => {
  const type = document.getElementById('adType').value;
  console.log('Ad type changed to:', type);
  
  // Cacher tous les groupes
  const groups = ['imageGroup', 'videoGroup', 'textGroup', 'htmlGroup', 'adsenseGroup'];
  groups.forEach(groupId => {
    const element = document.getElementById(groupId);
    if (element) {
      element.style.display = 'none';
    }
  });
  
  // Afficher le groupe approprié
  if (type === 'image') {
    const element = document.getElementById('imageGroup');
    if (element) element.style.display = 'block';
  }
  if (type === 'video') {
    const element = document.getElementById('videoGroup');
    if (element) element.style.display = 'block';
  }
  if (type === 'text') {
    const element = document.getElementById('textGroup');
    if (element) element.style.display = 'block';
  }
  if (type === 'html') {
    const element = document.getElementById('htmlGroup');
    if (element) element.style.display = 'block';
  }
  if (type === 'adsense') {
    const element = document.getElementById('adsenseGroup');
    if (element) {
      element.style.display = 'block';
      updateAdsensePreview();
    }
  }
};

// Mettre à jour l'aperçu AdSense
const updateAdsensePreview = () => {
  const format = document.getElementById('adsenseFormat').value;
  const sizeElement = document.querySelector('.adsense-size');
  
  const formatSizes = {
    'responsive': 'Responsive',
    'auto': 'Auto',
    'rectangle': '300x250',
    'banner': '728x90',
    'skyscraper': '120x600'
  };
  
  if (sizeElement) {
    sizeElement.textContent = formatSizes[format] || '300x250';
  }
};

// Gérer le fichier image
const handleImageFile = (input) => {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('imagePreview');
    if (preview) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Aperçu de l'image" />`;
    }
    
    // Stocker le fichier pour l'upload
    input.dataset.fileData = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Gérer le fichier vidéo
const handleVideoFile = (input) => {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('videoPreview');
    if (preview) {
      preview.innerHTML = `<video controls><source src="${e.target.result}" type="${file.type}" /></video>`;
    }
    
    // Stocker le fichier pour l'upload
    input.dataset.fileData = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Gérer soumission publicité
const handleAdSubmit = async (e) => {
  e.preventDefault();
  
  const slotNumber = parseInt(document.getElementById('adSlot').value);
  const type = document.getElementById('adType').value;
  
  let content = '';
  if (type === 'image') {
    // Priorité au fichier uploadé, sinon URL
    const imageFile = document.getElementById('adImageFile');
    if (imageFile && imageFile.dataset.fileData) {
      content = imageFile.dataset.fileData; // Base64
    } else {
      content = document.getElementById('adImageUrl').value;
    }
  }
  if (type === 'video') {
    // Priorité au fichier uploadé, sinon URL
    const videoFile = document.getElementById('adVideoFile');
    if (videoFile && videoFile.dataset.fileData) {
      content = videoFile.dataset.fileData; // Base64
    } else {
      content = document.getElementById('adVideoUrl').value;
    }
  }
  if (type === 'text') {
    content = document.getElementById('adText').value;
  }
  if (type === 'html') {
    content = document.getElementById('adHtml').value;
  }
  if (type === 'adsense') {
    content = {
      clientId: document.getElementById('adsenseClientId').value,
      slotId: document.getElementById('adsenseSlotId').value,
      format: document.getElementById('adsenseFormat').value
    };
  }
  
  const adData = {
    slot: slotNumber,
    type,
    content,
    link: document.getElementById('adLink').value,
    schedule: document.getElementById('adSchedule').value,
    expiry: document.getElementById('adExpiry').value
  };
  
  console.log('Saving ad:', adData);
  
  // Sauvegarder dans localStorage
  currentAds[slotNumber] = adData;
  localStorage.setItem('qdayAds', JSON.stringify(currentAds));
  
  // Mettre à jour l'aperçu
  updateAdPreview(slotNumber);
  
  // Fermer le modal
  closeModal('adModal');
  
  showNotification('Publicité sauvegardée avec succès!', 'success');
};

// === FONCTIONS UTILITAIRES ===

// Afficher notification
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'success') notification.style.background = '#28a745';
  if (type === 'error') notification.style.background = '#dc3545';
  if (type === 'info') notification.style.background = '#17a2b8';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

// Fonctions de gestion des questions
const editQuestion = (questionId) => {
  console.log('Edit question:', questionId);
  
  // Trouver la question à modifier
  const question = currentQuestions.find(q => q._id === questionId);
  if (!question) {
    showNotification('Question non trouvée', 'error');
    return;
  }
  
  console.log('Question to edit:', question);
  
  // Remplir le formulaire avec les données de la question
  document.getElementById('questionText_fr').value = question.text_fr || question.text || '';
  document.getElementById('questionText_en').value = question.text_en || '';
  document.getElementById('questionCategory').value = question.category || '';
  
  // Gérer la checkbox "Question du jour"
  const isTodayQuestion = document.getElementById('isTodayQuestion');
  const scheduleGroup = document.getElementById('scheduleGroup');
  const questionSchedule = document.getElementById('questionSchedule');
  
  if (!question.scheduledDate) {
    // C'est une question du jour
    isTodayQuestion.checked = true;
    scheduleGroup.style.display = 'none';
  } else {
    // C'est une question programmée
    isTodayQuestion.checked = false;
    scheduleGroup.style.display = 'block';
    
    // Mettre la date programmée
    const scheduledDate = new Date(question.scheduledDate);
    const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    questionSchedule.value = localDateTime;
  }
  
  // Stocker l'ID de la question en cours d'édition
  document.getElementById('questionForm').dataset.editingId = questionId;
  
  // Changer le titre du modal
  const modalTitle = document.querySelector('#questionModal .modal-header h3');
  if (modalTitle) {
    modalTitle.textContent = t('edit_question');
  }
  
  // Changer le texte du bouton de soumission
  const submitBtn = document.querySelector('#questionForm button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = t('update_button');
  }
  
  // Ouvrir le modal
  const modal = document.getElementById('questionModal');
  if (modal) {
    modal.style.display = 'block';
  }
  
  showNotification('Modifiez les champs et cliquez sur "Mettre à jour"', 'info');
};

const deleteQuestion = (questionId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette question?')) {
    currentQuestions = currentQuestions.filter(q => q._id !== questionId);
    localStorage.setItem('qdayQuestions', JSON.stringify(currentQuestions));
    displayQuestions(currentQuestions);
    showNotification('Question supprimée avec succès!', 'success');
  }
};

// Fonctions de modération
const loadModeration = () => {
  console.log('Loading moderation data...');
  const moderationList = document.getElementById('moderationList');
  if (moderationList) {
    moderationList.innerHTML = '<p>Aucun contenu à modérer</p>';
  }
};

const loadStats = () => {
  console.log('Loading statistics...');
  const totalQuestionsElement = document.getElementById('totalQuestions');
  if (totalQuestionsElement) {
    totalQuestionsElement.textContent = currentQuestions.length;
  }
  
  const todayAnswersElement = document.getElementById('todayAnswers');
  if (todayAnswersElement) {
    todayAnswersElement.textContent = '0';
  }
  
  const activeUsersElement = document.getElementById('activeUsers');
  if (activeUsersElement) {
    activeUsersElement.textContent = '0';
  }
  
  const engagementRateElement = document.getElementById('engagementRate');
  if (engagementRateElement) {
    engagementRateElement.textContent = '0%';
  }
};

const refreshModeration = () => {
  loadModeration();
  showNotification('Modération rafraîchie', 'info');
};

const bulkApprove = () => {
  showNotification('Approbation groupée non implémentée', 'info');
};

const bulkReject = () => {
  showNotification('Rejet groupé non implémenté', 'info');
};

const bulkBan = () => {
  showNotification('Bannissement groupé non implémenté', 'info');
};

// Fonctions de gestion des publicités
const updateAdPreview = (slotNumber) => {
  const preview = document.getElementById(`ad-preview-${slotNumber}`);
  if (preview) {
    preview.innerHTML = '<div class="ad-placeholder-small"></div>';
  }
};

// Mettre à jour la langue du formulaire
const updateFormLanguage = () => {
  // Mettre à jour les labels du formulaire de question
  const modalTitle = document.querySelector('#questionModal .modal-header h3');
  if (modalTitle && !document.getElementById('questionForm').dataset.editingId) {
    modalTitle.textContent = t('add_question');
  }
  
  // Mettre à jour les placeholders
  const questionTextFr = document.getElementById('questionText_fr');
  if (questionTextFr) {
    questionTextFr.placeholder = t('question_text_fr_placeholder');
  }
  
  const questionTextEn = document.getElementById('questionText_en');
  if (questionTextEn) {
    questionTextEn.placeholder = t('question_text_en_placeholder');
  }
};
