// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Centralized error handler for API routes
export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof TypeError) {
    return Response.json(
      { error: 'Invalid data format received from external API' },
      { status: 502 }
    );
  }
  
  if (error instanceof Error && error.message.includes('fetch')) {
    return Response.json(
      { error: errorMessages.NETWORK_ERROR },
      { status: 503 }
    );
  }
  
  return Response.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

// User-facing error messages
export const errorMessages = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  API_TIMEOUT: 'The request took too long. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment before searching again.',
  NOT_FOUND: 'The requested item could not be found.',
  SERVER_ERROR: 'The server encountered an error. Please try again later.',
  NO_RESULTS: 'No results found. Try different search terms or filters.',
  INVALID_VERSION: 'No compatible version found for your selection.',
  API_KEY_MISSING: 'Service configuration error. Please contact support.'
};
