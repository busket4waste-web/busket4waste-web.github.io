(function () {
  'use strict';

  const MAX_LENGTH = 80;

  /** URL для отправки ответов теста (Formspree и т.п.). Задаётся в index.html через window.TEST_SUBMIT_URL */
  const SUBMIT_URL = typeof window !== 'undefined' && window.TEST_SUBMIT_URL ? window.TEST_SUBMIT_URL : '';

  const state = {
    goal: null,
    showToCustomers: true,
    showPhoto: true,
  };

  const screenProfile = document.getElementById('screen-profile');
  const screenTips = document.getElementById('screen-tips');
  const screenEditGoal = document.getElementById('screen-edit-goal');
  const profileItemTips = document.getElementById('profile-item-tips');
  const btnBackTips = document.getElementById('btn-back-tips');
  const goalEmpty = document.getElementById('goal-empty');
  const goalFilled = document.getElementById('goal-filled');
  const goalDisplayText = document.getElementById('goal-display-text');
  const btnAddGoal = document.getElementById('btn-add-goal');
  const btnEditGoal = document.getElementById('btn-edit-goal');
  const btnBackEdit = document.getElementById('btn-back-edit');
  const btnSaveGoal = document.getElementById('btn-save-goal');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  const goalInput = document.getElementById('goal-input');
  const charCount = document.getElementById('char-count');
  const chipsPresets = document.getElementById('chips-presets');
  const toggleShowGoal = document.getElementById('toggle-show-goal');
  const toggleShowPhoto = document.getElementById('toggle-show-photo');
  const btnSubmitTest = document.getElementById('btn-submit-test');
  const testSubmitStatus = document.getElementById('test-submit-status');

  function showScreen(screen) {
    screenProfile.classList.toggle('screen_active', screen === 'profile');
    screenTips.classList.toggle('screen_active', screen === 'tips');
    screenEditGoal.classList.toggle('screen_active', screen === 'edit');
  }

  function renderTipsScreen() {
    if (state.goal && state.goal.trim() !== '') {
      goalEmpty.classList.add('hidden');
      goalFilled.classList.remove('hidden');
      goalDisplayText.textContent = state.goal.trim();
    } else {
      goalEmpty.classList.remove('hidden');
      goalFilled.classList.add('hidden');
    }
    if (toggleShowGoal) {
      toggleShowGoal.checked = state.showToCustomers;
    }
    if (toggleShowPhoto) {
      toggleShowPhoto.checked = state.showPhoto;
    }
  }

  function openEditGoal() {
    goalInput.value = state.goal ?? '';
    goalInput.focus();
    updateCharCount();
    updateChipsFromValue(goalInput.value);
    showScreen('edit');
  }

  function closeEditGoal() {
    showScreen('tips');
    renderTipsScreen();
  }

  function updateCharCount() {
    const len = goalInput.value.length;
    charCount.textContent = len;
  }

  function updateChipsFromValue(value) {
    const normalized = (value || '').trim().toLowerCase();
    chipsPresets.querySelectorAll('.chip').forEach((chip) => {
      const chipVal = (chip.dataset.value || '').trim().toLowerCase();
      const isPreset = [
        'телефон', 'ремонт', 'отпуск', 'обучение', 'подарок',
        'транспорт', 'экипировка', 'семья', 'накопления', 'другое',
      ].includes(chipVal);
      const matches = isPreset && chipVal === normalized;
      chip.classList.toggle('chip_active', matches);
    });
  }

  function setInputFromChip(value) {
    goalInput.value = value;
    updateCharCount();
    updateChipsFromValue(value);
  }

  /** Данные для отправки/копирования: цель и статусы тогглов */
  function getTestPayload() {
    return {
      goal: state.goal && state.goal.trim() !== '' ? state.goal.trim() : '',
      show_goal: state.showToCustomers,
      show_photo: state.showPhoto,
      sent_at: new Date().toISOString(),
    };
  }

  /** Текст ответов для вставки в чат/форму */
  function getTestPayloadText() {
    const p = getTestPayload();
    return [
      'Цель: ' + (p.goal || '(не указана)'),
      'Показывать цель покупателям: ' + (p.show_goal ? 'да' : 'нет'),
      'Показывать мое фото покупателям: ' + (p.show_photo ? 'да' : 'нет'),
      'Время: ' + p.sent_at,
    ].join('\n');
  }

  function setSubmitStatus(message, isError) {
    if (!testSubmitStatus) return;
    testSubmitStatus.textContent = message;
    testSubmitStatus.classList.toggle('error', !!isError);
    testSubmitStatus.classList.toggle('hidden', !message);
  }

  function disableSubmitButton() {
    if (btnSubmitTest) {
      btnSubmitTest.disabled = true;
      btnSubmitTest.setAttribute('aria-disabled', 'true');
    }
  }

  function submitOrCopyTest() {
    if (btnSubmitTest && btnSubmitTest.disabled) return;
    disableSubmitButton();

    const payload = getTestPayload();
    const text = getTestPayloadText();

    if (SUBMIT_URL && SUBMIT_URL.trim() !== '') {
      const body = new URLSearchParams({
        goal: payload.goal,
        show_goal: payload.show_goal ? 'да' : 'нет',
        show_photo: payload.show_photo ? 'да' : 'нет',
        sent_at: payload.sent_at,
      });

      fetch(SUBMIT_URL.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
        .then(function (res) {
          if (res.ok) {
            setSubmitStatus('Ответы отправлены. Спасибо!');
          } else {
            setSubmitStatus('Ошибка отправки. Скопируйте ответы ниже и отправьте организатору вручную.', true);
            copyFallback(text);
          }
        })
        .catch(function () {
          setSubmitStatus('Нет связи. Скопируйте ответы и отправьте организатору вручную.', true);
          copyFallback(text);
        });
    } else {
      copyFallback(text);
      setSubmitStatus('');
    }
  }

  function copyFallback(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {
        showTextFallback(text);
      });
    } else {
      showTextFallback(text);
    }
  }

  function showTextFallback(text) {
    setSubmitStatus('Скопируйте текст:\n' + text, false);
  }

  profileItemTips?.addEventListener('click', function () {
    showScreen('tips');
  });

  profileItemTips?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showScreen('tips');
    }
  });

  btnBackTips?.addEventListener('click', function () {
    showScreen('profile');
  });

  btnAddGoal?.addEventListener('click', openEditGoal);
  btnEditGoal?.addEventListener('click', openEditGoal);
  btnBackEdit?.addEventListener('click', closeEditGoal);
  btnCancelEdit?.addEventListener('click', closeEditGoal);

  btnSaveGoal?.addEventListener('click', function () {
    const text = goalInput.value.trim();
    state.goal = text === '' ? null : text;
    closeEditGoal();
  });

  goalInput?.addEventListener('input', function () {
    if (goalInput.value.length > MAX_LENGTH) {
      goalInput.value = goalInput.value.slice(0, MAX_LENGTH);
    }
    updateCharCount();
    updateChipsFromValue(goalInput.value);
  });

  chipsPresets?.addEventListener('click', function (e) {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const value = chip.dataset.value ?? '';
    setInputFromChip(value);
  });

  toggleShowGoal?.addEventListener('change', function () {
    state.showToCustomers = toggleShowGoal.checked;
  });

  toggleShowPhoto?.addEventListener('change', function () {
    state.showPhoto = toggleShowPhoto.checked;
  });

  btnSubmitTest?.addEventListener('click', submitOrCopyTest);

  showScreen('profile');
  renderTipsScreen();
})();
