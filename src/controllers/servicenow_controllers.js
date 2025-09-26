const axios = require("axios");

exports.getDataFromTable = async (req, res) => {
  const { instanceUrl, username, password, table, queryParams } = req.body;

  if (!instanceUrl || !username || !password || !table) {
    return res.status(400).json({ error: "Faltan parámetros requeridos" });
  }

  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const response = await axios.get(`${instanceUrl}/api/now/table/${table}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      params: queryParams || {},
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error al consultar ServiceNow:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Error al consultar ServiceNow",
      details: error.response?.data || error.message,
    });
  }
};

// Configura tu instancia de ServiceNow
const instance = "https://dev305196.service-now.com";
const user = "admin";
const password = "Jz^UwYGbM{;#w7:<u42(+J:RcmJ3";

/**
 * Función para hacer GET a ServiceNow table API con la parte final de la URL dinámica
 * @param {string} tablePath - Ejemplo: 'incident?sysparm_query=state!=closed'
 * @returns {Promise<Object>} - Devuelve los datos de la API
 */
exports.getServiceNowTable = async (tablePath) => {
  try {
    const url = `${instance}/api/now/table/${tablePath}`;
    const response = await axios.get(url, {
      auth: { username: user, password: password },
      headers: {
        Accept: "application/json",
      },
    });
    console.log(response.data.result);
    return response.data.result; // Devuelve solo el array de resultados
  } catch (error) {
    console.error(
      `Error consultando ${tablePath}:`,
      error.response?.data || error.message
    );
    return null;
  }
};
