// Example of how to create any new service using the shared API client

import api from "./apiClient";

export const exampleService = {
    // Get data example
    getData: async (id) => {
        try {
            const response = await api.get(`/some-endpoint/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Post data example
    createData: async (data) => {
        try {
            const response = await api.post("/some-endpoint", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update data example
    updateData: async (id, data) => {
        try {
            const response = await api.put(`/some-endpoint/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete data example
    deleteData: async (id) => {
        try {
            const response = await api.delete(`/some-endpoint/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Upload file example
    uploadFile: async (formData) => {
        try {
            const response = await api.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Download file example
    downloadFile: async (fileId) => {
        try {
            const response = await api.get(`/download/${fileId}`, {
                responseType: "blob",
            });
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default exampleService;

// Usage example:
// import exampleService from "../services/exampleService";
//
// const data = await exampleService.getData(123);
// await exampleService.createData({ name: "test" });
// await exampleService.updateData(123, { name: "updated" });
// await exampleService.deleteData(123);
