// Version ultra-simple pour tester la soumission
console.log('=== SIMPLE VERSION START ===');

// Variables globales
let currentUser = '';
let currentQuestion = null;
let currentLang = localStorage.getItem('qdayLanguage') || 'fr';

// Afficher une notification
const showNotification = (message, type = 'info') => {
  console.log(`[${type}] ${message}`);
  const colors = {
    success: '#4CAF50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196F3'
  };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: ${colors[type]}; 
    color: white; padding: 15px 20px; border-radius: 8px; z-index: 1000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); max-width: 300px;
    font-size: 0.9rem; animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

// Charger la question depuis l'API
const loadQuestionFromAPI = async () => {
  try {
    console.log('🚀 Loading question from API...');
    
    const res = await fetch('/api/questions/today');
    console.log('📡 Question API Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const question = await res.json();
    console.log('✅ Question received:', question);
    
    if (question && question.text_fr) {
      currentQuestion = question;
      displayQuestion(question);
      
      // Charger les réponses après la question
      loadAnswers();
      
      showNotification('✅ Question chargée depuis MongoDB!', 'success');
    } else {
      throw new Error('Question invalide');
    }
    
  } catch (err) {
    console.error('❌ Error loading question:', err);
    showNotification(`❌ Erreur: ${err.message}`, 'error');
  }
};

// Afficher la question
const displayQuestion = (question) => {
  const questionBox = document.getElementById('questionBox');
  if (!questionBox) {
    console.error('❌ questionBox not found');
    return;
  }
  
  const questionText = currentLang === 'fr' ? question.text_fr : question.text_en;
  const category = question.category || 'Général';
  const date = question.createdAt ? new Date(question.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  const isDefault = question.isDefault ? '🌟 Question par défaut' : '🌐 Question de l\'admin';
  
  questionBox.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
      <h3 style="margin: 0 0 10px 0; font-size: 1.2em; line-height: 1.4;">${questionText}</h3>
      <small style="opacity: 0.9;">${category} | ${date}</small>
      <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.9rem;">
        ${isDefault}
      </div>
    </div>
  `;
  
  console.log('✅ Question displayed:', questionText);
};

// Charger les réponses depuis l'API
const loadAnswers = async () => {
  if (!currentQuestion || !currentQuestion._id) {
    console.error('❌ No question available for loading answers');
    return;
  }
  
  try {
    console.log('🚀 Loading answers from API...');
    console.log('📝 Question ID:', currentQuestion._id);
    
    const res = await fetch(`/api/answers/question?questionId=${currentQuestion._id}`);
    console.log('📡 Answers API Response status:', res.status);
    
    if (res.ok) {
      const apiAnswers = await res.json();
      console.log('✅ Answers received from API:', apiAnswers);
      
      if (Array.isArray(apiAnswers) && apiAnswers.length > 0) {
        displayAnswers(apiAnswers);
        showNotification(`✅ ${apiAnswers.length} réponse(s) trouvée(s)`, 'success');
      } else {
        console.log('ℹ️ No answers found in API');
        showNotification('ℹ️ Aucune réponse trouvée', 'info');
        displayAnswers([]);
      }
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
    
  } catch (err) {
    console.error('❌ Error loading answers:', err);
    showNotification(`❌ Erreur chargement réponses: ${err.message}`, 'error');
    displayAnswers([]);
  }
};

// Afficher les réponses - Version optimisée
const displayAnswers = (answers) => {
  const answersBox = document.getElementById('answersBox');
  if (!answersBox) {
    console.error('❌ answersBox not found');
    return;
  }
  
  console.log('🎨 Displaying answers:', answers);
  
  if (!answers || answers.length === 0) {
    answersBox.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666; font-style: italic;">
        Aucune réponse pour le moment. Soyez le premier à répondre!
      </div>
    `;
    return;
  }
  
  // Filtrer par langue (optimisé)
  const filteredAnswers = answers.filter(answer => {
    if (currentLang === 'fr') {
      return !answer.language || answer.language === 'fr';
    } else {
      return answer.language === 'en';
    }
  });
  
  console.log('🔍 Filtered answers:', filteredAnswers);
  
  if (filteredAnswers.length === 0) {
    answersBox.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666; font-style: italic;">
        Aucune réponse dans cette langue pour le moment.
      </div>
    `;
    return;
  }
  
  // Trier par date (plus récent en premier) pour meilleure UX
  const sortedAnswers = filteredAnswers.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Afficher chaque réponse (HTML optimisé avec likes et commentaires)
  answersBox.innerHTML = sortedAnswers.map(answer => `
    <div class="answer-card" data-answer-id="${answer._id}" style="
      background: white; border: 1px solid #e0e0e0; border-radius: 12px; 
      padding: 15px; margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      animation: slideIn 0.3s ease-out;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <strong style="color: #333; font-size: 1.1em;">${answer.author || 'Anonymous'}</strong>
        <small style="color: #666; font-size: 0.8em;">
          ${formatDate(answer.createdAt)}
        </small>
      </div>
      <p style="margin: 0; color: #444; line-height: 1.5; font-size: 0.95em;">
        ${answer.text}
      </p>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <button onclick="likeAnswer('${answer._id}')" id="like-btn-${answer._id}" style="
            background: ${isLikedByUser(answer) ? '#ff6b6b' : '#f0f0f0'}; 
            color: ${isLikedByUser(answer) ? 'white' : '#333'}; 
            border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; 
            font-size: 0.85rem; transition: all 0.2s ease;
          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            ❤️ ${answer.likes ? answer.likes.length : 0}
          </button>
          <button onclick="toggleComments('${answer._id}')" style="
            background: #f0f0f0; color: #333; border: none; padding: 6px 12px; 
            border-radius: 6px; cursor: pointer; font-size: 0.85rem; 
            transition: all 0.2s ease;
          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            💬 ${answer.comments ? answer.comments.length : 0}
          </button>
        </div>
      </div>
      <div id="comments-${answer._id}" style="display: none; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
        <div style="margin-bottom: 10px;">
          <input type="text" id="comment-input-${answer._id}" placeholder="Écrire un commentaire..." style="
            width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; 
            font-size: 0.9rem; outline: none; transition: border-color 0.2s ease;
          " onkeypress="if(event.key === 'Enter') addComment('${answer._id}')" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#ddd'">
          <button onclick="addComment('${answer._id}')" style="
            margin-top: 8px; background: #667eea; color: white; border: none; 
            padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
            transition: background 0.2s ease;
          " onmouseover="this.style.background='#5a6fd8'" onmouseout="this.style.background='#667eea'">
            Envoyer
          </button>
        </div>
        <div id="comments-list-${answer._id}">
          ${renderComments(answer.comments || [])}
        </div>
      </div>
    </div>
  `).join('');
  
  console.log(`✅ ${sortedAnswers.length} answers displayed`);
};

// Vérifier si l'utilisateur a liké une réponse
const isLikedByUser = (answer) => {
  return answer.likes && answer.likes.includes(currentUser);
};

// Afficher les commentaires
const renderComments = (comments) => {
  if (!comments || comments.length === 0) {
    return '<p style="color: #999; font-style: italic; font-size: 0.85rem;">Aucun commentaire pour le moment.</p>';
  }
  
  return comments.map(comment => `
    <div style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 6px; border-left: 3px solid #667eea;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <strong style="color: #333; font-size: 0.85rem;">${comment.author}</strong>
        <small style="color: #666; font-size: 0.75rem;">${formatDate(comment.createdAt)}</small>
      </div>
      <p style="margin: 0; color: #444; font-size: 0.85rem; line-height: 1.4;">${comment.text}</p>
    </div>
  `).join('');
};

// Liké une réponse
const likeAnswer = async (answerId) => {
  console.log('👍 Liking answer:', answerId);
  
  try {
    const res = await fetch(`/api/answers/${answerId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: currentUser
      })
    });
    
    if (res.ok) {
      console.log('✅ Like successful');
      showNotification('❤️ Liké!', 'success');
      
      // Recharger les réponses pour mettre à jour le compteur
      setTimeout(() => {
        loadAnswers();
      }, 200);
      
    } else {
      const errorText = await res.text();
      console.error('❌ Like error:', res.status, errorText);
      showNotification('❌ Erreur lors du like', 'error');
    }
    
  } catch (err) {
    console.error('❌ Like network error:', err);
    showNotification('❌ Erreur réseau', 'error');
  }
};

// Afficher/cacher les commentaires
const toggleComments = (answerId) => {
  const commentsSection = document.getElementById(`comments-${answerId}`);
  if (commentsSection) {
    const isVisible = commentsSection.style.display !== 'none';
    commentsSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      // Focus sur le champ de commentaire quand on ouvre
      setTimeout(() => {
        const input = document.getElementById(`comment-input-${answerId}`);
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }
};

// Ajouter un commentaire
const addComment = async (answerId) => {
  const input = document.getElementById(`comment-input-${answerId}`);
  const text = input.value.trim();
  
  if (!text) {
    showNotification('⚠️ Veuillez écrire un commentaire', 'warning');
    return;
  }
  
  console.log('💬 Adding comment to answer:', answerId);
  console.log('📄 Comment text:', text);
  
  try {
    const res = await fetch(`/api/answers/${answerId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: currentUser,
        text: text
      })
    });
    
    if (res.ok) {
      console.log('✅ Comment added successfully');
      input.value = '';
      showNotification('💬 Commentaire ajouté!', 'success');
      
      // Recharger les réponses pour afficher le nouveau commentaire
      setTimeout(() => {
        loadAnswers();
      }, 200);
      
    } else {
      const errorText = await res.text();
      console.error('❌ Comment error:', res.status, errorText);
      showNotification('❌ Erreur lors du commentaire', 'error');
    }
    
  } catch (err) {
    console.error('❌ Comment network error:', err);
    showNotification('❌ Erreur réseau', 'error');
  }
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'à l\'instant';
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  
  return date.toLocaleDateString('fr-FR');
};

// SOUMETTRE UNE RÉPONSE - Version ultra-simple
const submitAnswer = async () => {
  console.log('=== SUBMIT ANSWER START ===');
  
  const answerInput = document.getElementById('answerInput');
  console.log('📝 Answer input element:', answerInput);
  
  const text = answerInput.value.trim();
  console.log('📄 Answer text:', `"${text}"`);
  
  if (!text) {
    showNotification('⚠️ Veuillez écrire une réponse', 'warning');
    return;
  }
  
  if (!currentUser) {
    showNotification('❌ Veuillez vous connecter', 'error');
    return;
  }
  
  if (!currentQuestion) {
    showNotification('❌ Aucune question chargée', 'error');
    return;
  }
  
  const questionId = currentQuestion._id || 'default-question';
  console.log('📤 Submitting answer...');
  console.log('📝 Question ID:', questionId);
  console.log('👤 Author:', currentUser);
  console.log('📄 Text:', text);
  console.log('🌐 Language:', currentLang);
  
  // Construire le corps de la requête
  const requestBody = {
    questionId: questionId,
    author: currentUser,
    text: text,
    language: currentLang
  };
  
  console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
  
  try {
    console.log('🚀 Sending fetch request...');
    
    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Response status:', res.status);
    console.log('📡 Response headers:', [...res.headers.entries()]);
    
    if (res.ok) {
      const result = await res.json();
      console.log('✅ Answer submitted successfully:', result);
      
      // Vider le champ
      answerInput.value = '';
      console.log('🧹 Input field cleared');
      
      // Notification
      showNotification('✅ Réponse publiée!', 'success');
      
      // Recharger les réponses après un court délai (optimisé)
      setTimeout(() => {
        console.log('🔄 Reloading answers...');
        loadAnswers();
      }, 200); // Réduit de 500ms à 200ms
      
    } else {
      const errorText = await res.text();
      console.error('❌ Server error:', res.status, errorText);
      showNotification(`❌ Erreur serveur: ${res.status}`, 'error');
    }
    
  } catch (err) {
    console.error('❌ Network error:', err);
    showNotification(`❌ Erreur réseau: ${err.message}`, 'error');
  }
  
  console.log('=== SUBMIT ANSWER END ===');
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== SIMPLE VERSION INIT ===');
  
  // Vérifier l'utilisateur
  const savedUser = localStorage.getItem('qdayUser') || localStorage.getItem('pseudo');
  if (savedUser) {
    currentUser = savedUser;
    console.log('✅ User found:', currentUser);
    showNotification(`👤 Connecté: ${currentUser}`, 'success');
  } else {
    console.log('❌ No user found');
    showNotification('❌ Utilisateur non connecté', 'error');
    return;
  }
  
  // Charger la question (qui chargera aussi les réponses)
  loadQuestionFromAPI();
  
  // Configurer le bouton de soumission
  const submitBtn = document.getElementById('submitAnswerBtn');
  if (submitBtn) {
    submitBtn.onclick = submitAnswer;
    console.log('✅ Submit button configured');
  } else {
    console.error('❌ Submit button not found');
  }
  
  // Configurer le champ de réponse
  const answerInput = document.getElementById('answerInput');
  if (answerInput) {
    answerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log('⌨️ Enter key pressed, submitting...');
        submitAnswer();
      }
    });
    console.log('✅ Answer input configured');
  } else {
    console.error('❌ Answer input not found');
  }
  
  console.log('=== SIMPLE VERSION READY ===');
});

console.log('=== SIMPLE VERSION LOADED ===');
