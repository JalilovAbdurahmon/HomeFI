import instance from './axios';

// Bu funksiya hamma sahifa uchun universal ishlaydi
export const addToZakup = async (productData) => {
    try {
        // Backenddagi manzilingni tekshir (masalan: http://localhost:5000/api/xaridlar)
        const response = await instance.post("/xaridlar", productData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}` // Login qilgan user uchun
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};