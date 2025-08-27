import axios from 'axios';

// URL de base pour la vérification du statut
const API_BASE_URL = 'https://www.pay.moneyfusion.net';

/**
 * Initie une demande de paiement en utilisant l'URL spécifique du plan.
 * @param {object} paymentData - Les données de paiement.
 * @param {string} apiUrlFromSettings - L'URL de l'API de paiement fournie dans les paramètres du plan.
 */
const makePaymentRequest = async (paymentData, apiUrlFromSettings) => {
  const effectiveApiUrl = apiUrlFromSettings;

  if (!effectiveApiUrl) {
    console.error("URL de l'API de paiement non fournie.");
    throw new Error("La configuration du paiement est incomplète.");
  }

  try {
    const response = await axios.post(effectiveApiUrl, paymentData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la demande de paiement:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Une erreur est survenue lors de l'initiation du paiement.");
  }
};

/**
 * Vérifie le statut d'un paiement à l'aide d'un token.
 * @param {string} token - Le jeton de paiement unique.
 */
const checkPaymentStatus = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/paiementNotif/${token}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la vérification du statut du paiement:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Impossible de vérifier le statut du paiement.");
  }
};

export { makePaymentRequest, checkPaymentStatus };