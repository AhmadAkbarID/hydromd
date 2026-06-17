const axios = require('axios');

class ReactChannel {
    /**
     * @param {Object} config - Konfigurasi
     * @param {string} config.userJwt - JWT token user (Bearer)
     * @param {string} [config.bypassApiUrl] - URL API bypass reCAPTCHA
     * @param {string} [config.siteKey] - Google reCAPTCHA site key
     * @param {string} [config.backendUrl] - Backend API URL
     */
    constructor(config) {
        this.userJwt = config.userJwt;
        this.bypassApiUrl = config.bypassApiUrl || 'https://rynekoo-recaptcha.hf.space/action';
        this.siteKey = config.siteKey || '6LemKk8sAAAAAH5PB3f1EspbMlXjtwv5C8tiMHSm';
        this.backendUrl = config.backendUrl || 'https://back.asitha.top/api';
        
        this.axiosInstance = axios.create({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.userJwt}`
            }
        });
    }

    /**
     * Mendapatkan token reCAPTCHA v3
     * @returns {Promise<string>}
     */
    async getRecaptchaToken() {
        const response = await axios.post(this.bypassApiUrl, {
            mode: 'v3',
            url: 'https://asitha.top/channel-manager',
            siteKey: this.siteKey
        });
        
        if (!response.data?.data?.token) {
            throw new Error(`Bypass reCAPTCHA gagal: ${JSON.stringify(response.data)}`);
        }
        return response.data.data.token;
    }

    /**
     * Menukar token reCAPTCHA dengan temporary apiKey
     * @param {string} recaptchaToken
     * @returns {Promise<string>}
     */
    async getTempApiKey(recaptchaToken) {
        const url = `${this.backendUrl}/user/get-temp-token`;
        const payload = { recaptcha_token: recaptchaToken };
        const response = await this.axiosInstance.post(url, payload);
        
        if (!response.data.token) {
            throw new Error('Gagal mendapatkan temp apiKey: ' + JSON.stringify(response.data));
        }
        return response.data.token;
    }

    /**
     * Mengirim reaksi ke post WhatsApp
     * @param {string} postLink - URL post WhatsApp channel
     * @param {string} reacts - Emoji dipisah koma, contoh: "1️⃣,2️⃣,3️⃣"
     * @returns {Promise<Object>} - Response dari server
     */
    async sendReaction(postLink, reacts) {
        const recaptchaToken = await this.getRecaptchaToken();
        const tempApiKey = await this.getTempApiKey(recaptchaToken);
        
        const url = `${this.backendUrl}/channel/react-to-post?apiKey=${tempApiKey}`;
        const payload = {
            post_link: postLink,
            reacts: reacts
        };
        const response = await this.axiosInstance.post(url, payload);
        return response.data;
    }

    /**
     * Method lengkap: langsung react ke post
     * @param {string} postLink
     * @param {string} reacts
     * @returns {Promise<Object>}
     */
    async reactToPost(postLink, reacts) {
        try {
            const result = await this.sendReaction(postLink, reacts);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ReactChannel;