const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
// Import controllers
const {
  getServiceNowTable,
  getDataFromTable,
} = require("../controllers/servicenow_controllers");
const serviceNowFunctions = require("../functions/servicenow/servicenow_dashboard");
// Ruta para autenticar y consultar ServiceNow

router.get("/greeding", () => console.log("Hello World"));

// Dashboard data for ServiceNow Dashboard
router.get("/servicenow-dashboard", async (req, res) => {
  try {
    const [
      openedTickets,
      numberOfOpenedTickets,
      MTTR,
      //openedTasks,
      backlog,
      PLA,
      openedTicketsPerMonth,
    ] = await Promise.all([
      serviceNowFunctions.getOpenedTickets(),
      serviceNowFunctions.getNumberOpenedTickets(),
      serviceNowFunctions.getMeanTimeToResolution(),
      //serviceNowFunctions.getOpenedTasks(),
      serviceNowFunctions.getBacklog(),
      serviceNowFunctions.getTicketsPercentage(),
      serviceNowFunctions.getOpenedTicketsPerMonth(),
    ]);

    const response = {
      metadata: {
        timestamp: new Date().toISOString(),
        source: "External API",
      },
      data: {
        openedTickets,
        numberOfOpenedTickets,
        MTTR,
        //openedTasks,
        backlog,
        PLA,
        openedTicketsPerMonth,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message, tambien: "error" });
  }
});

/**
 * Valor numérico	Estado (UI)
 *      1	        New
 *      2	        In Progress
 *      3	        On Hold
 *      6	        Resolved
 *      7	        Closed
 *      8	        Canceled
 */

// Tickets already open - Non closed and none canceled
router.get("/openedTickets", serviceNowFunctions.getOpenedTickets);

// NUMBER of Tickets already open - Non closed and none canceled
router.get("/numberOpenedTickets", serviceNowFunctions.getNumberOpenedTickets);

// Mean Time to Resolution
router.get(
  "/averageResolutionTime",
  serviceNowFunctions.getMeanTimeToResolution
);

// All the opened tasks
router.get("/openedTasks", serviceNowFunctions.getOpenedTasks);

// Documented tasks
router.post("/documentedTasks", serviceNowFunctions.getDocumentedTask);

// Backlog
router.get("/backlog", serviceNowFunctions.getBacklog);

// PLA per month
router.get("/ticketsPercentage", serviceNowFunctions.getTicketsPercentage);

// Buscar incidente con SLA
router.get("/buscar", async (req, res) => {
  try {
    const documentedTask = await getServiceNowTable("incident?sysparm_limit=1");
    res.json(documentedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/query", getDataFromTable);

module.exports = router;
