const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }
  return response.json();
};

// --- Personal Texts API ---
export const getPersonalTexts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/texts`);
  return handleResponse(response);
};

export const getPersonalTextById = async (id: string, password?: string) => {
  const query = password ? `?password=${password}` : '';
  const response = await fetch(`${API_BASE_URL}/api/texts/${id}${query}`);
  return handleResponse(response);
};

export const createPersonalText = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/texts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updatePersonalText = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/texts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deletePersonalText = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/texts/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
  // No JSON response for delete, just check status
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }
  return { message: 'Text deleted successfully' };
};

// --- Parental Alienation Articles API ---
export const getArticles = async () => {
  const response = await fetch(`${API_BASE_URL}/api/articles`);
  return handleResponse(response);
};

export const getArticleById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);
  return handleResponse(response);
};

export const createArticle = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateArticle = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteArticle = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }
  return { message: 'Article deleted successfully' };
};

// --- Diary API ---
export const uploadDiaryEntry = async (file: File) => {
  const formData = new FormData();
  formData.append('diaryFile', file);

  const response = await fetch(`${API_BASE_URL}/api/diary/upload`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      // 'Content-Type': 'multipart/form-data' is set automatically by fetch with FormData
    },
    body: formData,
  });
  return handleResponse(response);
};

export const getDiaryEntries = async () => {
  const response = await fetch(`${API_BASE_URL}/api/diary/list`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
};

export const downloadDiaryEntry = async (filename: string) => {
  const response = await fetch(`${API_BASE_URL}/api/diary/download/${filename}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }
  return response.blob(); // Return as blob for file download
};

export const deleteDiaryEntry = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/diary/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }
  return { message: 'Diary entry deleted successfully' };
};
