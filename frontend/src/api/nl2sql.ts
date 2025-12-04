// API functions for NL2SQL functionality

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:8001'
  : 'https://sql-study-room-2025.uw.r.appspot.com';

export interface NL2SQLRequest {
  question: string;
  account_number?: number;
}

export interface NL2SQLResponse {
  sql: string;
  results: any[];
  error: string | null;
  row_count?: number;
}

export const callNL2SQL = async (request: NL2SQLRequest): Promise<NL2SQLResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nl2sql/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process query');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};