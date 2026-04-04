const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "An error occurred" };
    }

    return { data };
  } catch (error) {
    return { error: "Network error occurred" };
  }
}

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    return fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string) => {
    return fetchApi<{ token: string; user: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};

// Wallet API
export const walletApi = {
  getBalance: async () => {
    return fetchApi<{ id: number; balance: number }>("/wallet", {
      method: "GET",
    });
  },

  addMoney: async (amount: number) => {
    return fetchApi<{ id: number; balance: number }>("/wallet/add", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  verify: async (walletId: number) => {
    return fetchApi<{ id: number }>(`/wallet/verify/${walletId}`, {
      method: "GET",
    });
  },
};

// Transaction API
export const transactionApi = {
  getAll: async () => {
    return fetchApi<Array<{
      amount: number;
      sender: number;
      receiver: number;
    }>>("/transactions", {
      method: "GET",
    });
  },

  transfer: async (walletId: number, amount: number) => {
    return fetchApi("/transactions/transfer", {
      method: "POST",
      body: JSON.stringify({ wallet_id: walletId, amount }),
    });
  },
};

export default fetchApi;
