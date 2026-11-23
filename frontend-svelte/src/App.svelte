<script>
  import { onMount } from 'svelte';

  // ==========================================
  // APPLICATION STATE (Svelte 5 Runes)
  // ==========================================

  // Data retrieved from the API
  let studentsList = $state([]);
  let coursesList = $state([]);

  // Page status indicators
  let isLoading = $state(true);
  let generalErrorMessage = $state('');
  let successNotification = $state('');

  // User filter inputs
  let searchQuery = $state('');
  let selectedCourseFilterId = $state('');

  // Form modal controls
  let isModalOpen = $state(false);
  let studentToEdit = $state(null); // null = Add new student; Object = Edit student

  // Form input fields
  let formFirstName = $state('');
  let formLastName = $state('');
  let formCourseId = $state('');
  let formAcademicYear = $state(1);

  // Form validation & submission states
  let formErrorMessage = $state('');
  let isSavingData = $state(false);

  // ==========================================
  // DERIVED STATE (Real-time Filtering)
  // ==========================================

  // Automatically recalculates when searchQuery or selectedCourseFilterId changes
  let filteredStudents = $derived(
    studentsList.filter((student) => {
      const fullName = `${student.nome} ${student.apelido}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.trim().toLowerCase());

      const matchesCourse =
        selectedCourseFilterId === '' ||
        String(student.idCurso) === String(selectedCourseFilterId);

      return matchesSearch && matchesCourse;
    })
  );

  // ==========================================
  // API REQUESTS
  // ==========================================

  // Fetches both students and courses from the API
  async function fetchApiData() {
    isLoading = true;
    generalErrorMessage = '';

    try {
      const [studentsResponse, coursesResponse] = await Promise.all([
        fetch('/alunos'),
        fetch('/cursos'),
      ]);

      if (!studentsResponse.ok || !coursesResponse.ok) {
        throw new Error('Server responded with an error.');
      }

      studentsList = await studentsResponse.json();
      coursesList = await coursesResponse.json();
    } catch (error) {
      generalErrorMessage =
        'Failed to connect to the server. Please verify if the API is running at http://localhost:3000.';
    } finally {
      isLoading = false;
    }
  }

  // Load data upon component mount
  onMount(() => {
    fetchApiData();
  });

  // Translates a course ID into its human-readable course name
  function getCourseName(courseId) {
    const matchedCourse = coursesList.find(
      (course) => String(course.id) === String(courseId)
    );
    return matchedCourse ? matchedCourse.nomeDoCurso : 'Unknown course';
  }

  // Shows a temporary success toast notification for 3 seconds
  function showNotification(message) {
    successNotification = message;
    setTimeout(() => {
      successNotification = '';
    }, 3000);
  }

  // ==========================================
  // MODAL / FORM MANAGEMENT
  // ==========================================

  // Opens an empty form to register a new student
  function openModalForNewStudent() {
    studentToEdit = null;
    formErrorMessage = '';

    formFirstName = '';
    formLastName = '';
    formCourseId = coursesList.length > 0 ? coursesList[0].id : '';
    formAcademicYear = 1;

    isModalOpen = true;
  }

  // Opens the form pre-filled with the selected student's data
  function openModalForEditStudent(student) {
    studentToEdit = student;
    formErrorMessage = '';

    formFirstName = student.nome;
    formLastName = student.apelido;
    formCourseId = student.idCurso;
    formAcademicYear = student.anoCurricular || 1;

    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    studentToEdit = null;
    formErrorMessage = '';
  }

  // Handles form submission (POST if new, PUT if editing)
  async function handleFormSubmit(event) {
    event.preventDefault();
    formErrorMessage = '';
    isSavingData = true;

    // Preserve original ID data type (numeric or string)
    const matchedCourse = coursesList.find(
      (course) => String(course.id) === String(formCourseId)
    );
    const finalCourseId = matchedCourse ? matchedCourse.id : formCourseId;

    const studentPayload = {
      nome: formFirstName.trim(),
      apelido: formLastName.trim(),
      idCurso: finalCourseId,
      anoCurricular: Number(formAcademicYear),
    };

    try {
      const isEditing = studentToEdit !== null;
      const requestUrl = isEditing ? `/alunos/${studentToEdit.id}` : '/alunos';
      const requestMethod = isEditing ? 'PUT' : 'POST';

      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || `Server returned status code ${response.status}`);
      }

      showNotification(
        isEditing ? 'Student updated successfully!' : 'New student created successfully!'
      );
      closeModal();
      await fetchApiData();
    } catch (error) {
      formErrorMessage = error.message || 'Error saving student details.';
    } finally {
      isSavingData = false;
    }
  }

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  async function deleteStudent(student) {
    const fullName = `${student.nome} ${student.apelido}`;
    const userConfirmed = confirm(`Are you sure you want to delete student "${fullName}"?`);

    if (!userConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/alunos/${student.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status} while deleting.`);
      }

      showNotification('Student deleted successfully.');
      await fetchApiData();
    } catch (error) {
      alert(`Could not delete student: ${error.message}`);
    }
  }
</script>

<div class="page-container">
  <!-- PAGE HEADER -->
  <header class="page-header">
    <div>
      <h1 class="main-title">Student Management</h1>
      <p class="subtitle">Clean and modular Svelte front-end for Students & Courses API</p>
    </div>
    <button class="btn btn-primary" onclick={openModalForNewStudent}>
      + New Student
    </button>
  </header>

  <!-- SUCCESS TOAST NOTIFICATION -->
  {#if successNotification}
    <div class="toast-success">
      {successNotification}
    </div>
  {/if}

  <!-- FILTERS & SEARCH BAR -->
  <section class="filters-panel">
    <div class="filter-group">
      <label for="search-input">Search by name or surname:</label>
      <input
        id="search-input"
        type="search"
        placeholder="e.g. John, Smith..."
        bind:value={searchQuery}
      />
    </div>

    <div class="filter-group">
      <label for="course-filter-select">Filter by course:</label>
      <select id="course-filter-select" bind:value={selectedCourseFilterId}>
        <option value="">All courses</option>
        {#each coursesList as course}
          <option value={course.id}>{course.nomeDoCurso}</option>
        {/each}
      </select>
    </div>
  </section>

  <!-- STUDENTS LIST & STATUS MESSAGES -->
  <main>
    {#if isLoading}
      <div class="message-box">Loading students and courses data…</div>
    {:else if generalErrorMessage}
      <div class="message-box error-box">
        <p>{generalErrorMessage}</p>
        <button class="btn btn-secondary" onclick={fetchApiData}>
          Try again
        </button>
      </div>
    {:else if filteredStudents.length === 0}
      <div class="message-box">
        No students found matching the selected filters.
      </div>
    {:else}
      <div class="students-grid">
        {#each filteredStudents as student (student.id)}
          <article class="student-card">
            <div class="student-info">
              <h2 class="student-name">{student.nome} {student.apelido}</h2>
              <div class="badges">
                <span class="badge badge-course">{getCourseName(student.idCurso)}</span>
                <span class="badge badge-year">Year {student.anoCurricular}</span>
              </div>
            </div>

            <div class="student-actions">
              <button
                class="action-btn action-btn-edit"
                onclick={() => openModalForEditStudent(student)}
              >
                Edit
              </button>
              <button
                class="action-btn action-btn-delete"
                onclick={() => deleteStudent(student)}
              >
                Delete
              </button>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </main>

  <!-- CREATE / EDIT MODAL DIALOG -->
  {#if isModalOpen}
    <div class="modal-backdrop" onclick={closeModal} role="presentation">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="modal-window"
        onclick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
      >
        <div class="modal-header">
          <h2 id="modal-title">
            {studentToEdit ? 'Edit Student' : 'New Student'}
          </h2>
          <button class="close-btn" onclick={closeModal} aria-label="Close dialog">✕</button>
        </div>

        <form onsubmit={handleFormSubmit}>
          <div class="form-group">
            <label for="input-first-name">First Name *</label>
            <input
              id="input-first-name"
              type="text"
              required
              placeholder="e.g. John"
              bind:value={formFirstName}
            />
          </div>

          <div class="form-group">
            <label for="input-last-name">Last Name *</label>
            <input
              id="input-last-name"
              type="text"
              required
              placeholder="e.g. Doe"
              bind:value={formLastName}
            />
          </div>

          <div class="form-group">
            <label for="select-course">Course *</label>
            <select id="select-course" required bind:value={formCourseId}>
              <option value="" disabled>Select a course</option>
              {#each coursesList as course}
                <option value={course.id}>{course.nomeDoCurso}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="select-academic-year">Academic Year *</label>
            <select id="select-academic-year" required bind:value={formAcademicYear}>
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
            </select>
          </div>

          {#if formErrorMessage}
            <div class="form-error-alert">{formErrorMessage}</div>
          {/if}

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick={closeModal}>
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" disabled={isSavingData}>
              {isSavingData ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Layout */
  .page-container {
    max-width: 860px;
    margin: 0 auto;
    padding: 32px 16px;
  }

  /* Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
    flex-wrap: wrap;
  }

  .main-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #0f172a;
  }

  .subtitle {
    font-size: 0.95rem;
    color: #64748b;
    margin-top: 4px;
  }

  /* Filters Panel */
  .filters-panel {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px 20px;
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .filter-group {
    flex: 1;
    min-width: 240px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
  }

  input,
  select {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.95rem;
    background: #ffffff;
    outline: none;
    transition: border-color 0.15s;
  }

  input:focus,
  select:focus {
    border-color: #2563eb;
  }

  /* Buttons */
  .btn {
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background-color 0.15s;
  }

  .btn-primary {
    background: #2563eb;
    color: #ffffff;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #334155;
  }

  .btn-secondary:hover {
    background: #e2e8f0;
  }

  /* Students Grid */
  .students-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .student-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .student-name {
    font-size: 1.15rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 6px;
  }

  .badges {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .badge {
    font-size: 0.8rem;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 500;
  }

  .badge-course {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .badge-year {
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }

  /* Actions inside Card */
  .student-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    background: transparent;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .action-btn-edit {
    color: #2563eb;
    border-color: #bfdbfe;
  }

  .action-btn-edit:hover {
    background: #eff6ff;
  }

  .action-btn-delete {
    color: #dc2626;
    border-color: #fecaca;
  }

  .action-btn-delete:hover {
    background: #fef2f2;
  }

  /* Message Boxes */
  .message-box {
    text-align: center;
    padding: 40px 16px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px dashed #cbd5e1;
    color: #64748b;
  }

  .message-box.error-box {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #b91c1c;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  /* Success Toast */
  .toast-success {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0f172a;
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 0.95rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  /* Modal Dialog */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 999;
  }

  .modal-window {
    background: #ffffff;
    border-radius: 8px;
    width: 100%;
    max-width: 460px;
    padding: 24px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .modal-header h2 {
    font-size: 1.3rem;
    color: #0f172a;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    color: #94a3b8;
    cursor: pointer;
  }

  .close-btn:hover {
    color: #1e293b;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-error-alert {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
  }
</style>
