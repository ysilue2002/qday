// Système de traduction bilingue Français/Anglais
const translations = {
  fr: {
    // Page d'accueil/login
    app_title: "QDAY - Question du Jour",
    login_title: "Connexion",
    pseudo_placeholder: "Entrez votre pseudo",
    login_button: "Se connecter",
    required_field: "Ce champ est obligatoire",
    
    // Page question
    question_of_the_day: "Question du jour",
    answers_title: "Réponses",
    answer_placeholder: "Écrivez votre réponse ici",
    submit_answer: "Répondre",
    no_answers: "Aucune réponse pour le moment",
    no_active_question: "Aucune question active pour le moment",
    loading_error: "Erreur de chargement des réponses",

    // Navigation
    nav_today: "Question du jour",
    nav_history: "Historique",

    // Page historique
    history_title: "Historique des questions",
    history_subtitle: "Retrouvez les questions précédentes et leurs réponses.",
    history_loading: "Chargement...",
    history_empty: "Aucune question disponible",
    history_error: "Erreur de chargement des questions",
    history_select: "Sélectionnez une question pour voir les réponses.",
    history_answers: "Réponses",
    history_no_answers: "Aucune réponse pour cette question",
    history_no_comments: "Aucun commentaire pour le moment",
    history_active_badge: "Active",

    // Notifications
    notif_title: "Notifications",
    notif_empty: "Aucune notification",
    notif_clear: "Tout effacer",
    notif_enable: "Activer les notifications",
    
    // Actions sur réponses
    comments: "Commentaires",
    add_comment: "Ajouter un commentaire...",
    send: "Envoyer",
    like: "J'aime",
    dislike: "Je n'aime pas",
    report: "Signaler",
    
    // Page admin
    admin_title: "QDAY - Administration",
    welcome: "Bienvenue",
    questions_tab: "Questions",
    ads_tab: "Publicités",
    moderation_tab: "Modération",
    stats_tab: "Statistiques",
    settings_tab: "Paramètres",
    
    // Gestion des questions
    add_question: "Ajouter une Question",
    edit_question: "Modifier une Question",
    question_text: "Texte de la question",
    question_text_fr: "Texte de la question (Français)",
    question_text_en: "Texte de la question (Anglais)",
    question_category: "Catégorie",
    question_text_placeholder: "Entrez la question...",
    question_text_fr_placeholder: "Entrez la question en français...",
    question_text_en_placeholder: "Entrez la question en anglais...",
    select_category: "Sélectionnez une catégorie",
    today_question: "Question du jour",
    schedule_question: "Programmer la question",
    schedule_date: "Date et heure de programmation",
    add_button: "Ajouter",
    update_button: "Mettre à jour",
    cancel: "Annuler",
    
    // Catégories
    general: "Général",
    technology: "Technologie",
    science: "Science",
    culture: "Culture",
    sports: "Sports",
    entertainment: "Divertissement",
    other: "Autre",
    
    // Statuts
    active: "Active",
    inactive: "Inactive",
    scheduled: "Programmée",
    today_question_label: "Question du jour",
    disabled: "Désactivée",
    
    // Listes
    question_column: "Question",
    category_column: "Catégorie",
    date_column: "Date",
    status_column: "Statut",
    actions_column: "Actions",
    
    // Notifications
    question_added: "Question ajoutée avec succès!",
    question_updated: "Question mise à jour avec succès!",
    question_deleted: "Question supprimée avec succès!",
    answer_submitted: "Réponse soumise avec succès!",
    error_required: "Veuillez remplir tous les champs obligatoires",
    error_operation: "Erreur lors de l'opération",
    
    // Publicités
    add_ad: "Ajouter une Publicité",
    ad_type: "Type de publicité",
    ad_content: "Contenu",
    image_url: "URL de l'image",
    video_url: "URL de la vidéo",
    text_content: "Texte de la publicité",
    ad_position: "Position",
    position_1: "Position 1",
    position_2: "Position 2",
    position_3: "Position 3",
    position_4: "Position 4",
    position_5: "Position 5",
    position_6: "Position 6",
    preview: "Aperçu",
    
    // Modération
    reported_content: "Contenu signalé",
    no_reported_content: "Aucun contenu signalé",
    approve: "Approuver",
    delete: "Supprimer",
    confirm_delete: "Êtes-vous sûr de vouloir supprimer ce contenu?",
    
    // Langue
    language: "Langue",
    french: "Français",
    english: "English"
  },
  
  en: {
    // Home/login page
    app_title: "QDAY - Question of the Day",
    login_title: "Login",
    pseudo_placeholder: "Enter your nickname",
    login_button: "Sign In",
    required_field: "This field is required",
    
    // Question page
    question_of_the_day: "Question of the Day",
    answers_title: "Answers",
    answer_placeholder: "Write your answer here",
    submit_answer: "Answer",
    no_answers: "No answers yet",
    no_active_question: "No active question at the moment",
    loading_error: "Error loading answers",

    // Navigation
    nav_today: "Today's Question",
    nav_history: "History",

    // History page
    history_title: "Question History",
    history_subtitle: "Browse previous questions and their answers.",
    history_loading: "Loading...",
    history_empty: "No questions available",
    history_error: "Error loading questions",
    history_select: "Select a question to see its answers.",
    history_answers: "Answers",
    history_no_answers: "No answers for this question",
    history_no_comments: "No comments yet",
    history_active_badge: "Active",

    // Notifications
    notif_title: "Notifications",
    notif_empty: "No notifications",
    notif_clear: "Clear all",
    notif_enable: "Enable notifications",
    
    // Answer actions
    comments: "Comments",
    add_comment: "Add a comment...",
    send: "Send",
    like: "Like",
    dislike: "Dislike",
    report: "Report",
    
    // Admin page
    admin_title: "QDAY - Administration",
    welcome: "Welcome",
    questions_tab: "Questions",
    ads_tab: "Advertisements",
    moderation_tab: "Moderation",
    stats_tab: "Statistics",
    settings_tab: "Settings",
    
    // Question management
    add_question: "Add Question",
    edit_question: "Edit Question",
    question_text: "Question text",
    question_text_fr: "Question text (French)",
    question_text_en: "Question text (English)",
    question_category: "Category",
    question_text_placeholder: "Enter the question...",
    question_text_fr_placeholder: "Enter the question in French...",
    question_text_en_placeholder: "Enter the question in English...",
    select_category: "Select a category",
    today_question: "Today's Question",
    schedule_question: "Schedule Question",
    schedule_date: "Schedule date and time",
    add_button: "Add",
    update_button: "Update",
    cancel: "Cancel",
    
    // Categories
    general: "General",
    technology: "Technology",
    science: "Science",
    culture: "Culture",
    sports: "Sports",
    entertainment: "Entertainment",
    other: "Other",
    
    // Status
    active: "Active",
    inactive: "Inactive",
    scheduled: "Scheduled",
    today_question_label: "Today's Question",
    disabled: "Disabled",
    
    // Lists
    question_column: "Question",
    category_column: "Category",
    date_column: "Date",
    status_column: "Status",
    actions_column: "Actions",
    
    // Notifications
    question_added: "Question added successfully!",
    question_updated: "Question updated successfully!",
    question_deleted: "Question deleted successfully!",
    answer_submitted: "Answer submitted successfully!",
    error_required: "Please fill in all required fields",
    error_operation: "Error during operation",
    
    // Advertisements
    add_ad: "Add Advertisement",
    ad_type: "Advertisement type",
    ad_content: "Content",
    image_url: "Image URL",
    video_url: "Video URL",
    text_content: "Advertisement text",
    ad_position: "Position",
    position_1: "Position 1",
    position_2: "Position 2",
    position_3: "Position 3",
    position_4: "Position 4",
    position_5: "Position 5",
    position_6: "Position 6",
    preview: "Preview",
    
    // Moderation
    reported_content: "Reported Content",
    no_reported_content: "No reported content",
    approve: "Approve",
    delete: "Delete",
    confirm_delete: "Are you sure you want to delete this content?",
    
    // Language
    language: "Language",
    french: "Français",
    english: "English"
  }
};

// Langue par défaut
let currentLanguage = localStorage.getItem('qdayLanguage') || 'fr';

// Fonction de traduction
const t = (key) => {
  return translations[currentLanguage][key] || key;
};

// Obtenir le texte de la question selon la langue
const getQuestionText = (question) => {
  if (currentLanguage === 'en' && question.text_en) {
    return question.text_en;
  }
  return question.text || question.text_fr;
};

// Changer de langue
const changeLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('qdayLanguage', lang);
    updateAllTexts();
    console.log('Language changed to:', lang);
    
    // Recharger la question du jour si on est sur la page question
    if (window.location.pathname.includes('question.html')) {
      loadTodayQuestion();
      // Recharger aussi les réponses pour le filtrage par langue
      if (typeof loadAnswers === 'function') {
        loadAnswers();
      }
    }
  }
};

// Mettre à jour tous les textes de la page
const updateAllTexts = () => {
  // Mettre à jour les éléments avec data-translate
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    element.textContent = t(key);
  });
  
  // Mettre à jour les placeholders
  document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
    const key = element.getAttribute('data-translate-placeholder');
    element.placeholder = t(key);
  });
  
  // Mettre à jour les titles
  document.querySelectorAll('[data-translate-title]').forEach(element => {
    const key = element.getAttribute('data-translate-title');
    element.title = t(key);
  });
  
  // Mettre à jour le sélecteur de langue
  updateLanguageSelector();
  
  // Mettre à jour le titre de la page
  document.title = t('app_title');
  
  // Déclencher un événement pour les mises à jour personnalisées
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language: currentLanguage } 
  }));
};

// Mettre à jour le sélecteur de langue
const updateLanguageSelector = () => {
  const selector = document.getElementById('languageSelector');
  if (selector) {
    selector.value = currentLanguage;
  }
};

// Initialiser le sélecteur de langue
const initLanguageSelector = () => {
  // Créer le sélecteur de langue s'il n'existe pas
  if (!document.getElementById('languageSelector')) {
    const selector = document.createElement('select');
    selector.id = 'languageSelector';
    selector.innerHTML = `
      <option value="fr">${t('french')}</option>
      <option value="en">${t('english')}</option>
    `;
    selector.addEventListener('change', (e) => {
      changeLanguage(e.target.value);
    });
    
    // Ajouter le sélecteur à la page
    const header = document.querySelector('h1') || document.querySelector('.admin-header h2');
    if (header) {
      header.parentNode.insertBefore(selector, header.nextSibling);
    }
  }
  
  updateLanguageSelector();
};

// Initialiser la langue au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  initLanguageSelector();
  updateAllTexts();
});

// Exporter les fonctions pour utilisation dans d'autres fichiers
window.t = t;
window.changeLanguage = changeLanguage;
window.updateAllTexts = updateAllTexts;
window.getQuestionText = getQuestionText;
window.currentLanguage = currentLanguage;
