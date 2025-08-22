
import axios from 'axios';

const API_URL = 'https://www.pay.moneyfusion.net';

const makePaymentRequest = async (paymentData, apiUrlFromSettings) => {
  // Use the specific URL from plan settings, which the user just provided.
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

const checkPaymentStatus = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/paiementNotif/${token}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la vérification du statut du paiement:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Impossible de vérifier le statut du paiement.");
  }
};

export { makePaymentRequest, checkPaymentStatus };
