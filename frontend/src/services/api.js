// services/api.js
import api from "../api/api_url";

// User service
export const userService = {
  getAll: async () => {
    try {
      const response = await api.get("/users/");
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch users",
          status: error.response?.status
        }
      };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch user",
          status: error.response?.status
        }
      };
    }
  },
  
  create: async (userData) => {
    try {
      const response = await api.post("/users/", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to create user",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}/`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to update user",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  archive: async (id) => {
    try {
      const response = await api.post(`/users/${id}/archive/`, { archive: true });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to archive user",
          status: error.response?.status
        }
      };
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get("/users/profile/");
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch profile",
          status: error.response?.status
        }
      };
    }
  },
  
  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/users/change-password/", passwordData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to change password",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  }
};

// Store service
export const storeService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/stores/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch stores",
          status: error.response?.status
        }
      };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/stores/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch store",
          status: error.response?.status
        }
      };
    }
  },
  
  create: async (storeData) => {
    try {
      const response = await api.post("/stores/", storeData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to create store",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  update: async (id, storeData) => {
    try {
      const response = await api.put(`/stores/${id}/`, storeData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to update store",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  archive: async (id) => {
    try {
      const response = await api.post(`/stores/${id}/archive/`, { archive: true });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to archive store",
          status: error.response?.status
        }
      };
    }
  }
};

// Product service
export const productService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/products/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch products",
          status: error.response?.status
        }
      };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch product",
          status: error.response?.status
        }
      };
    }
  },
  
  create: async (productData) => {
    try {
      const response = await api.post("/products/", productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to create product",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}/`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to update product",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  getCategories: async () => {
    try {
      const response = await api.get("/product-categories/");
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch product categories",
          status: error.response?.status
        }
      };
    }
  }
};

// Inventory service
export const inventoryService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/inventory/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch inventory",
          status: error.response?.status
        }
      };
    }
  },
  
  adjust: async (adjustmentData) => {
    try {
      const response = await api.post("/inventory/adjust/", adjustmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to adjust inventory",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get("/inventory-transactions/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch inventory transactions",
          status: error.response?.status
        }
      };
    }
  },
  
  getLowStock: async () => {
    try {
      const response = await api.get("/inventory/low-stock/");
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch low stock items",
          status: error.response?.status
        }
      };
    }
  }
};

// Order service
export const orderService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/orders/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch orders",
          status: error.response?.status
        }
      };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch order",
          status: error.response?.status
        }
      };
    }
  },
  
  create: async (orderData) => {
    try {
      const response = await api.post("/orders/", orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to create order",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  update: async (id, orderData) => {
    try {
      const response = await api.put(`/orders/${id}/`, orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to update order",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  getReceipt: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/receipt/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch receipt",
          status: error.response?.status
        }
      };
    }
  },
  
  generatePdf: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/pdf/`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to generate PDF",
          status: error.response?.status
        }
      };
    }
  }
};

// Delivery service
export const deliveryService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/deliveries/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch deliveries",
          status: error.response?.status
        }
      };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/deliveries/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch delivery",
          status: error.response?.status
        }
      };
    }
  },
  
  create: async (deliveryData) => {
    try {
      const response = await api.post("/deliveries/", deliveryData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to create delivery",
          status: error.response?.status,
          fields: error.response?.data || {}
        }
      };
    }
  },
  
  updateStatus: async (id, statusData) => {
    try {
      const response = await api.post(`/deliveries/${id}/update-status/`, statusData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to update delivery status",
          status: error.response?.status
        }
      };
    }
  },
  
  uploadSignature: async (id, signatureData) => {
    try {
      let formData;
      
      if (typeof signatureData === 'string' && signatureData.startsWith('data:image')) {
        // Handle base64 image
        formData = new FormData();
        formData.append('signature_data', signatureData);
      } else if (signatureData instanceof File) {
        // Handle file upload
        formData = new FormData();
        formData.append('signature', signatureData);
      } else {
        throw new Error('Invalid signature data');
      }
      
      const response = await api.post(`/deliveries/${id}/signature/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to upload signature",
          status: error.response?.status
        }
      };
    }
  },
  
  getRoutes: async (params = {}) => {
    try {
      const response = await api.get("/delivery-routes/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch delivery routes",
          status: error.response?.status
        }
      };
    }
  }
};

// Dashboard service
export const dashboardService = {
  getSummary: async () => {
    try {
      const response = await api.get("/dashboard/summary/");
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch dashboard summary",
          status: error.response?.status
        }
      };
    }
  },
  
  getSales: async (params = {}) => {
    try {
      const response = await api.get("/dashboard/sales/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch sales data",
          status: error.response?.status
        }
      };
    }
  },
  
  getInventory: async () => {
    try {
      const response = await api.get("/dashboard/inventory/");
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch inventory dashboard data",
          status: error.response?.status
        }
      };
    }
  },
  
  getDeliveries: async (params = {}) => {
    try {
      const response = await api.get("/dashboard/deliveries/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: error.response?.data?.detail || "Failed to fetch delivery dashboard data",
          status: error.response?.status
        }
      };
    }
  }
};

// Export all services
export default {
  user: userService,
  store: storeService,
  product: productService,
  inventory: inventoryService,
  order: orderService,
  delivery: deliveryService,
  dashboard: dashboardService
};